'use client'

import { useRouter } from "next/navigation"
import { createRef, RefObject, useEffect, useRef, useState } from "react"
import { sendEvent } from "@/app/actions"
import MeetingControls from "@/components/meeting-controls"
import VideoTile from "@/components/video-tile"
import { EVENTS } from "@/lib/events/constants"
import { CreateAnswerEventData, JoinRoomEventData, LeaveRoomEventData } from "@/app/[code]/types"
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
  const remoteStreamRefs = useRef<Record<string, MediaStream | undefined>>({});
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);

  // Participants in the room
  const username = getCookie('username')
  const isHost = getCookie("host") === code;
  const [participants, setParticipants] = useState<string[]>([])
  const opponent = participants.find((participant) => participant !== username);

  // Media stream
  const { start, stop, muteAudio, muteVideo, unmuteAudio, unmuteVideo, stream, isAudioMuted, isVideoMuted } = useMediaStream()

  // If user video muted, set video to current stream
  useEffect(() => {
    if (videoRefs.current[username]?.current) {
      videoRefs.current[username].current.srcObject = stream;
    }
  }, [participants, username, isVideoMuted, stream])

  useEffect(() => {
    console.log({ opponent, isHost })
    console.log(participants, "<<< participants");
    if (participants.length < 2) return
    if (!pcRef.current) return;
    if (!opponent) return

    console.log(
      remoteStreamRefs.current,
      "<<< remoteStreamRefs.current"
    );
    console.log(
      remoteStreamRefs.current[opponent],
      "<<< remoteStreamRefs.current[opponent]"
    );

    // Pull tracks from remote stream, add to video stream
    pcRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRefs.current[opponent]!.addTrack(track);
      });
      videoRefs.current[opponent]!.current!.srcObject = remoteStreamRefs.current[opponent]!;
    };

  }, [participants, isHost, opponent])

  useEffect(() => {
    if (participants.length === 2 && !isHost) {
      (async () => {
        console.log(!!offerRef.current, "<<< offerRef");
        // Set the remote description with the received offer
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(offerRef.current!))

        // Create an answer
        const answer = await pcRef.current!.createAnswer()
        await pcRef.current!.setLocalDescription(answer)
        sendEvent(EVENTS.CREATE_ANSWER, { code, answer });
      })()
    }
  }, [code, participants, isHost])



  // STEP 2: Setup WebRTC
  const setupRTC = (newStream: MediaStream | null) => {
    // Setup Peer Connection
    pcRef.current = new RTCPeerConnection(servers)
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) { // Check if there's a candidate
        // Send the candidate to the other peer
        const eventName = isHost
          ? EVENTS.OFFER_CANDIDATE
          : EVENTS.ANSWER_CANDIDATE;

        sendEvent(eventName, { candidate: event.candidate.toJSON(), code });
      }
    }

    // Add each track from our local stream to the peer connection
    if (newStream) {
      newStream!.getTracks().forEach((track) => {
        pcRef.current!.addTrack(track, newStream)
      })

      // Join current user to the room by sending a JOIN_ROOM event
      sendEvent(EVENTS.JOIN_ROOM, { code })
    }
  }

  // STEP 1: Start Media Stream & Setup Peer Connection
  // WebRTC needs a media stream/data channel to work
  useEffect(() => {
    // Start Media Stream
    start()
      .then(setupRTC)
      .catch(console.error);

    return () => {
      stop()
      pcRef.current!.close()
    }
  }, [isHost, code])

  // STEP 3: Setup Server-Sent Events (SSE) for real-time communication
  useEffect(() => {
    // Create an EventSource for SSE connection
    const eventSource = new EventSource(`/api/sse?code=${code}`)
    eventSource.onopen = (event) => console.log("SSE connected", event)
    eventSource.onerror = (event) => console.log("SSE disconnected", event)

    // Handle JOIN_ROOM event
    const handleJoinRoomEvent = async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as JoinRoomEventData

      // Create a new video reference for the joined users if it doesn't exist
      for (const user of data.users) {
        if (!videoRefs.current[user]) {
          videoRefs.current[user] = createRef<HTMLVideoElement>();
          remoteStreamRefs.current[user] = new MediaStream()
        }
      }

      // If the user is  a host, create and set a local offer
      if (data.userJoined === username && isHost) {
        const offer = await pcRef.current!.createOffer()
        await pcRef.current!.setLocalDescription(offer)
        sendEvent(EVENTS.CREATE_OFFER, { code, offer });
      }

      if (data.userJoined === username && !isHost) {
        offerRef.current = data.offer;
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

    // Handle CREATE_ANSWER event
    const handleCreateAnswerEvent = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as CreateAnswerEventData;

      if (isHost) {
        // Set the remote description with the received answer
        pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
      }

      data.answerCandidates.forEach((candidate) => {
        pcRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
      });
      data.offerCandidates.forEach((candidate) => {
        pcRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
      });
    }

    // Add event listeners
    eventSource.addEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
    eventSource.addEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)
    eventSource.addEventListener(EVENTS.CREATE_ANSWER, handleCreateAnswerEvent);

    return () => {
      // Send a LEAVE_ROOM event when the component unmounts
      sendEvent(EVENTS.LEAVE_ROOM, { code })

      // Remove event listeners and close the SSE connection
      eventSource.removeEventListener(EVENTS.JOIN_ROOM, handleJoinRoomEvent)
      eventSource.removeEventListener(EVENTS.LEAVE_ROOM, handleLeaveRoomEvent)
      eventSource.removeEventListener(EVENTS.CREATE_ANSWER, handleCreateAnswerEvent);
      eventSource.close()
    }
  }, [code, username, isHost])

  const hangupCall = () => {
    stop()
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
              // isVideoOn={participant === username ? !isVideoMuted : false}
              // isAudioOn={participant === username ? !isAudioMuted : false}
              isVideoOn
              isAudioOn
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

