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

  useEffect(() => {
    start()
    return () => {
      stop()
    }
  }, [])

  useEffect(() => {
    if (isStreaming && !isVideoMuted && videoRefs.current[username]?.current) {
      videoRefs.current[username].current.srcObject = stream;
    }
  }, [isStreaming, isVideoMuted]);


  useEffect(() => {
    pcRef.current = new RTCPeerConnection(servers)

    const eventSource = new EventSource(`/api/sse?code=${code}`)
    eventSource.onopen = (event) => console.log("SSE connected", event)
    eventSource.onerror = (event) => console.log("SSE disconnected", event)

    // Setup a listener for join room events
    const handleJoinRoomEvent = async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as JoinRoomEventData
      if (!videoRefs.current[data.userJoined]?.current) {
        videoRefs.current[data.userJoined] = createRef()
      }
      setParticipants(data.users)
    }
    const handleLeaveRoomEvent = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as LeaveRoomEventData
      delete videoRefs.current[data.userLeft]
      setParticipants(data.users)
    }
    eventSource.addEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
    eventSource.addEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)

    // Join current user to the room
    sendEvent(EVENTS.JOIN_ROOM, { code })

    return () => {
      sendEvent(EVENTS.LEAVE_ROOM, { code })
      eventSource.removeEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
      eventSource.removeEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)
      eventSource.close()

      pcRef.current?.close()
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

