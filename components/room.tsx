'use client'

import { useRouter } from "next/navigation"
import { MutableRefObject, useEffect, useRef, useState } from "react"
import { sendEvent } from "@/app/actions"
import MeetingControls from "@/components/meeting-controls"
import VideoTile from "@/components/video-tile"
import { EVENTS } from "@/lib/events/constants"
import { JoinRoomEventData, LeaveRoomEventData } from "../app/[code]/types"
import { getCookie } from "@/lib/cookie"

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
  const [participants, setParticipants] = useState<string[]>([])
  const videoRefs = useRef<Record<string, MutableRefObject<HTMLVideoElement>>>({})
  const username = getCookie('username')
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const otherParticipants = participants.filter(participant => participant !== username)

  useEffect(() => {
    pcRef.current = new RTCPeerConnection(servers)

    const eventSource = new EventSource(`/api/sse?code=${code}`)
    eventSource.onopen = (event) => console.log("SSE connected", event)
    eventSource.onerror = (event) => console.log("SSE disconnected", event)

    // Setup a listener for join room events
    const handleJoinRoomEvent = async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as JoinRoomEventData
      console.log(data.userJoined, "joined")
      setParticipants(data.users)
    }
    const handleLeaveRoomEvent = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as LeaveRoomEventData
      console.log(data.userLeft, "left")
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

  let content = null
  if (otherParticipants.length === 0) {
    content = (
      <VideoTile
        username={username}
        videoRef={videoRefs.current[username]}
        isVideoOn={false}
        isAudioOn={false}
        fullScreen
      />
    )
  } else if (otherParticipants.length === 1) {
    const opponent = otherParticipants[0]
    content = (
      <>
        <VideoTile
          username={opponent}
          videoRef={videoRefs.current[opponent]}
          isVideoOn={false}
          isAudioOn={false}
          fullScreen
        />

        <div className="absolute top-4 right-4">
          <VideoTile
            username={username}
            videoRef={videoRefs.current[username]}
            isVideoOn={false}
            isAudioOn={false}
          />
        </div>
      </>
    )
  } else {
    content = participants.map((participant, index) => (
      <VideoTile
        key={index}
        username={participant}
        videoRef={videoRefs.current[participant]}
        isVideoOn={false}
        isAudioOn={false}
      />
    ))
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${otherParticipants.length <= 1 ? 'p-0' : 'p-4'}`}>
        {content}

        {participants.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-full">
            <p className="text-gray-500">Waiting for participants to join...</p>
          </div>
        )}
      </div>
      <MeetingControls
        isVideoOn={false}
        isAudioOn={false}
        toggleAudio={() => { }}
        toggleVideo={() => { }}
        hangupCall={hangupCall}
      />
    </div>
  )
}

