'use client';

import { EVENTS } from '@/lib/events/constants';
import { useState, useEffect } from 'react';
import { FaMicrophone, FaVideo, FaVideoSlash, FaPhoneSlash, FaMicrophoneSlash, FaTimes, FaUsers } from 'react-icons/fa';

const Call = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
      });
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Video Call</h1>
        <button
          onClick={() => setIsParticipantListOpen(!isParticipantListOpen)}
          className="p-2 bg-gray-200 rounded-full"
        >
          {isParticipantListOpen ? <FaTimes /> : <FaUsers />}
        </button>
      </header>
      <main className="flex-grow flex">
        <div className="flex-grow p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {localStream && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  ref={video => {
                    if (video) {
                      video.srcObject = localStream;
                      video.play();
                    }
                  }}
                  muted
                  playsInline
                />
                <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded-md text-sm">
                  You {isMuted && '(Muted)'} {isVideoOff && '(Video Off)'}
                </div>
              </div>
            )}
            {participants.map((participant) => (
              <div key={participant.id} className="bg-gray-300 rounded-lg aspect-video flex items-center justify-center">
                <span className="text-gray-600">{participant.name}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className={`w-72 bg-white shadow-md p-4 overflow-y-auto transition-all duration-300 ${isParticipantListOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <h2 className="text-lg font-semibold mb-4 mt-10">Participants ({participants.length + 1})</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                You
              </div>
              <span className="text-gray-800">You (Host)</span>
            </li>
            {participants.map((participant) => (
              <li key={participant.id} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800">{participant.name}</span>
              </li>
            ))}
          </ul>
        </aside>
      </main>
      <footer className="bg-white shadow-md p-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            {isMuted ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
          </button>
          <button
            onClick={leaveCall}
            className="bg-red-500 text-white p-3 rounded-full"
          >
            <FaPhoneSlash size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Call;
