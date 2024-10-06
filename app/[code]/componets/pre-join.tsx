'use client'

import { useState, useEffect, useCallback } from 'react';
import { FaUser } from 'react-icons/fa';
import VideoTile from './video-tile';
import MeetingCode from './meeting-code';
import MeetingControls from './meeting-controls';
import useMediaStream from './use-media-stream';

type PreJoinProps = {
  onJoin: (name: string) => void
  code: string
}
function PreJoin({ onJoin, code }: PreJoinProps) {
  const [name, setName] = useState('');
  const { isVideoOn, setIsVideoOn, isAudioOn, setIsAudioOn, error, isLoading, videoRef } = useMediaStream();

  useEffect(() => {
    setName(localStorage.getItem('name') ?? '');
  }, []);

  const handleJoin = useCallback(() => {
    onJoin(name);
  }, [name, onJoin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <header>
          <h1 className="text-2xl font-semibold text-center mb-6">Join the Meeting</h1>
        </header>
        {/* Meeting code display and copy button */}
        <MeetingCode code={code} />

        {/* Name input field */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Video preview */}
        <VideoTile name={name} isAudioOn={isAudioOn} isVideoOn={isVideoOn} videoRef={videoRef} isLoading={isLoading} />

        {/* Media control buttons */}
        <MeetingControls error={error} setIsVideoOn={setIsVideoOn} isVideoOn={isVideoOn} isLoading={isLoading} setIsAudioOn={setIsAudioOn} isAudioOn={isAudioOn} />

        {/* Join meeting button */}
        <button
          onClick={handleJoin}
          disabled={!name.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400 disabled:text-gray-50 disabled:cursor-not-allowed"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}

export default PreJoin;

