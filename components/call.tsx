'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaUsers } from 'react-icons/fa';
import useMediaStream from '../hooks/use-media-stream';
import MeetingControls from './meeting-controls';
import { EVENTS } from '@/lib/events/constants';
import VideoTile from './video-tile';
import MeetingParticipants from './meeting-participants';
import Navbar from '@/components/navbar';
import { addOfferCandidates, leaveRoom, setOffer } from '@/app/actions';

type CallProps = {
  code: string
  username: string
}

const servers = {
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


export default function Call({ code, username }: CallProps) {
  const { isVideoOn, setIsVideoOn, isAudioOn, setIsAudioOn, error, isLoading, videoRef: localVideoRef, streamRef: localStreamRef } = useMediaStream();
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const pcRef = useRef(new RTCPeerConnection(servers))
  const remoteStreamRef = useRef(new MediaStream())
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Listen when there is a track on PeerConnection
    pcRef.current.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStreamRef.current.addTrack(track);
      });
    };

    pcRef.current.onicecandidate = event => {
      const candidate = event.candidate
      if (candidate) {
        addOfferCandidates(code, candidate)
      }
    };

    async function createOffer() {
      const offerDescription = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offerDescription);
      setOffer(code, offerDescription.type, offerDescription.sdp ?? '')
    }
    createOffer();

    // Attach remoteStreamRef from PeerConnection to remoteVideoRef
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }

    // Add localStream to the PeerConnection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        // Add each track from the local stream to the PeerConnection
        pcRef.current.addTrack(track, localStreamRef.current!);
      });
    }
  }, [localStreamRef.current])

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.onopen = (event) => {
      console.log('SSE connection opened', event);
    }
    eventSource.onerror = (event) => {
      console.log('SSE connection error', event);
    }

    const handleUserJoined = (event: MessageEvent) => {
      console.log('User joined', event.data);
    }
    eventSource.addEventListener(EVENTS.USER_JOINED, handleUserJoined);

    return () => {
      eventSource.removeEventListener(EVENTS.USER_JOINED, handleUserJoined);
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar
        headerRight={
          <button
            onClick={() => setIsParticipantListOpen(!isParticipantListOpen)}
            className="p-2 bg-gray-200 rounded-full"
          >
            {isParticipantListOpen ? <FaTimes size={20} /> : <FaUsers size={20} />}
          </button>
        }
      />
      <MeetingParticipants
        participants={participants}
        isParticipantListOpen={isParticipantListOpen}
      />
      <main className="flex flex-grow justify-center items-center p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 w-full">
          {/* Local Video Tile */}
          <VideoTile
            username={username}
            isVideoOn={isVideoOn}
            isAudioOn={isAudioOn}
            videoRef={localVideoRef}
            isLoading={isLoading}
          />

          {/* Remote Video Tile */}
          <VideoTile
            username={"Remote"}
            videoRef={remoteVideoRef}
          />
        </div>
      </main>
      <footer className="bg-white shadow-md flex items-center justify-center space-x-4">
        <MeetingControls
          isVideoOn={isVideoOn}
          setIsVideoOn={setIsVideoOn}
          isAudioOn={isAudioOn}
          setIsAudioOn={setIsAudioOn}
          isLoading={isLoading}
          error={error}
          leaveCall={() => leaveRoom()} // have to do this because of NextJS server actions
        />
      </footer>
    </div>
  );
};
