'use client'

import { useRouter } from "next/navigation"
import { createRef, RefObject, useEffect, useRef, useState } from "react"
import { sendEvent } from "@/app/actions"
import MeetingControls from "@/components/meeting-controls"
import VideoTile from "@/components/video-tile"
import { EVENTS } from "@/lib/events/constants"
import { JoinRoomEventData, LeaveRoomEventData } from "../app/[code]/types"
import { getCookie } from "@/lib/cookie"
import useMediaStream from "use-media-stream"

type RoomProps = {
  code: string
}

const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302'
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function Room(props: RoomProps) {
  const { code } = props
  const router = useRouter()

  // Refs
  const videoRefs = useRef<Record<string, RefObject<HTMLVideoElement> | undefined>>({})
  const pcRef = useRef<RTCPeerConnection | null>(null)

  // Participants in the room
  const username = getCookie('username')
  const [participants, setParticipants] = useState<string[]>([])

  // Media stream
  const { start, stop, muteAudio, muteVideo, unmuteAudio, unmuteVideo, isStreaming, stream, isAudioMuted, isVideoMuted } = useMediaStream()

  // STEP 1: Start Media Stream & Setup Peer Connection
  // WebRTC needs a media stream/data channel to work
  useEffect(() => {
    // Start Media Stream
    start()

    // Setup Peer Connection
    pcRef.current = new RTCPeerConnection(servers)
    pcRef.current.onicecandidate = (event) => {
      console.log("event", event.candidate)
    }

    return () => {
      stop()
      pcRef.current?.close()
    }
  }, [])

  // STEP 2: Add local media tracks to peer connection and join the room
  // this is called when the media stream is available with isStreaming is true
  useEffect(() => {
    if (isStreaming) {
      // If peer connection exists and we have a media stream
      if (pcRef.current && stream) {
        // Add each track from our local stream to the peer connection
        stream.getTracks().forEach((track) => {
          console.log("adding track", track)
          pcRef.current!.addTrack(track, stream)
        })
      }

      // Join current user to the room by sending a JOIN_ROOM event
      sendEvent(EVENTS.JOIN_ROOM, { code })
    }
  }, [isStreaming]);

  useEffect(() => {
    if (videoRefs.current[username]?.current) {
      videoRefs.current[username].current.srcObject = stream;
    }
  }, [participants, isVideoMuted])

  // STEP 3: Setup Server-Sent Events (SSE) for real-time communication
  useEffect(() => {
    // Create an EventSource for SSE connection
    const eventSource = new EventSource(`/api/sse?code=${code}`)
    eventSource.onopen = (event) => console.log("SSE connected", event)
    eventSource.onerror = (event) => console.log("SSE disconnected", event)

    // Handle JOIN_ROOM event
    const handleJoinRoomEvent = async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as JoinRoomEventData

      // Create a new video reference for the joined user if it doesn't exist
      if (!videoRefs.current[data.userJoined]?.current) {
        videoRefs.current[data.userJoined] = createRef()
      }

      // If the current user joined, create and set a local offer
      if (data.userJoined === username) {
        const offer = await pcRef.current?.createOffer()
        await pcRef.current?.setLocalDescription(offer)
        console.log("offer", offer)
      }

      // Update the list of participants
      setParticipants(data.users)
    }

    // Handle LEAVE_ROOM event
    const handleLeaveRoomEvent = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as LeaveRoomEventData

      // Remove the video reference for the user who left
      delete videoRefs.current[data.userLeft]

      // Update the list of participants
      setParticipants(data.users)
    }

    // Add event listeners for JOIN_ROOM and LEAVE_ROOM events
    eventSource.addEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
    eventSource.addEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)

    return () => {
      // Send a LEAVE_ROOM event when the component unmounts
      sendEvent(EVENTS.LEAVE_ROOM, { code })

      // Remove event listeners and close the SSE connection
      eventSource.removeEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
      eventSource.removeEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)
      eventSource.close()
    }
  }, [code])

  const hangupCall = async () => {
    sendEvent(EVENTS.LEAVE_ROOM, { code })
    router.push("/")
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className={`flex-1 relative grid grid-cols-3 grid-rows-3 gap-4 ${participants.length <= 2 ? '' : 'p-4'}`}>
        {participants.map((participant) => {
          let className = ''
          const fullScreenClassName = 'col-span-3 row-span-3'
          if (participants.length === 1) {
            className = fullScreenClassName
          } else if (participants.length === 2) {
            className = participant === username ?
              'absolute rounded-lg top-4 right-4 w-80 h-1/4 z-10' :
              fullScreenClassName
          }

          return (
            <VideoTile
              key={participant}
              username={participant}
              videoRef={videoRefs.current[participant]}
              isVideoOn={participant === username ? !isVideoMuted : false}
              isAudioOn={participant === username ? !isAudioMuted : false}
              className={className}
            />
          )
        })}

        {participants.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-full">
            <p className="text-gray-500">Waiting for participants to join...</p>
          </div>
        )}
      </div>
      <MeetingControls
        isVideoOn={!isVideoMuted}
        isAudioOn={!isAudioMuted}
        toggleAudio={isAudioMuted ? unmuteAudio : muteAudio}
        toggleVideo={isVideoMuted ? unmuteVideo : muteVideo}
        hangupCall={hangupCall}
      />
    </div>
  )
}

