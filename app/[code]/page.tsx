'use client'

import { MutableRefObject, useEffect, useRef, useState } from "react"
import { EVENTS } from "@/lib/events/constants"
import { joinRoom, leaveRoom } from "@/app/actions"
import MeetingControls from "@/components/meeting-controls"
import VideoTile from "@/components/video-tile"

type PageProps = {
  params: {
    code: string
  }
}

type JoinRoomEventData = {
  userJoined: string
  users: string[]
}

type LeaveRoomEventData = {
  userLeft: string
  users: string[]
}

export default function Page(props: PageProps) {
  const { params } = props
  const code = params.code
  const [participants, setParticipants] = useState<string[]>([])
  const videoRefs = useRef<Record<string, MutableRefObject<HTMLVideoElement>>>({})

  console.log(videoRefs.current)

  useEffect(() => {
    const eventSource = new EventSource(`/api/sse?code=${code}`)
    eventSource.onopen = (event) => console.log("SSE connected", event)
    eventSource.onerror = (event) => console.log("SSE disconnected", event)

    // Setup a listener for join room events
    const handleJoinRoomEvent = (event: MessageEvent) => {
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
    joinRoom(code)

    return () => {
      leaveRoom(code)
      eventSource.removeEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
      eventSource.removeEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)
      eventSource.close()
    }
  }, [code])

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {participants.map((participant, index) => (
          <VideoTile 
            key={index}
            username={participant}
            videoRef={videoRefs.current[participant]}
            isVideoOn={false}
            isAudioOn={false}
          />
        ))}
        {participants.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-full">
            <p className="text-gray-500">Waiting for participants to join...</p>
          </div>
        )}
      </div>
      <MeetingControls 
        isVideoOn={false}
        isAudioOn={false}
        toggleAudio={() => {}}
        toggleVideo={() => {}}
        leaveCall={() => {}}
      />
    </div>
  )
}

