'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaUsers } from 'react-icons/fa';
import useMediaStream from './use-media-stream';
import MeetingControls from './meeting-controls';
import { EVENTS } from '@/lib/events/constants';
import VideoTile from './video-tile';
import MeetingParticipants from './meeting-participants';
import Navbar from '@/components/Navbar';

type CallProps = {
  code: string
}

export default function Call({ code }: CallProps) {
  const { isVideoOn, setIsVideoOn, isAudioOn, setIsAudioOn, error, isLoading, videoRef } = useMediaStream();
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const router = useRouter();

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

  const leaveCall = () => {
    router.push('/');
  };

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

          {
            [...Array(10)].map((_, index) => (
              <VideoTile
                key={index}
                name={`Participant ${index + 1}`}
                isVideoOn={isVideoOn}
                isAudioOn={isAudioOn}
                videoRef={videoRef}
                isLoading={isLoading}
              />
            ))
          }

          {participants.map((participant) => (
            <VideoTile
              key={participant.id}
              name={participant.name}
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              videoRef={videoRef}
              isLoading={isLoading}
            />
          ))}
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
          leaveCall={leaveCall}
        />
      </footer>
    </div>
  );
};
