'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaUser, FaVideo, FaMicrophone, FaLink, FaVideoSlash, FaMicrophoneSlash } from 'react-icons/fa';

// Define the props for the PreJoin component
type PreJoinProps = {
  onJoin: (data: { name: string, isVideoOn: boolean, isAudioOn: boolean }) => void
  code: string
}

function PreJoin({ onJoin, code }: PreJoinProps) {
  // State for user input and media settings
  const [name, setName] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  
  // Refs for managing media streams
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Function to stop media streams
  const stopStream = useCallback((kind: 'video' | 'audio' | 'all') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        if (track.kind === kind || kind === 'all') {
          track.stop();
        }
      });
    }
    if ((kind === 'all' || kind === 'video') && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Function to start media streams
  const startStream = useCallback(async (kind: 'video' | 'audio') => {
    try {
      const constraints = kind === 'video' ? { video: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (streamRef.current) {
        for (const track of stream.getTracks()) {
          streamRef.current.addTrack(track);
        }
      } else {
        streamRef.current = stream;
      }

      if (kind === 'video' && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    } catch (error) {
      console.error(`Error accessing ${kind} device:`, error);
    }
  }, []);

  // Effect to manage video stream
  useEffect(() => {
    if (isVideoOn) {
      startStream('video');
    } else {
      stopStream('video');
    }
  }, [isVideoOn, startStream, stopStream]);

  // Effect to manage audio stream
  useEffect(() => {
    if (isAudioOn) {
      startStream('audio');
    } else {
      stopStream('audio');
    }
  }, [isAudioOn, startStream, stopStream]);

  // Cleanup effect to stop all streams when component unmounts
  useEffect(() => {
    return () => {
      stopStream('all');
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Join the Meeting</h1>
        {/* Meeting code display and copy button */}
        <div className="mb-6 bg-gray-100 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Meeting Code:</p>
              <p className="text-lg font-semibold">{code}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
              title="Copy meeting code"
            >
              <FaLink size={16} />
            </button>
          </div>
        </div>
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
        <div className="mb-6">
          <div className="relative w-full h-48 bg-black rounded-md overflow-hidden">
            {isVideoOn && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            )}
            {!isVideoOn && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <FaUser size={48} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
        {/* Media control buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setIsVideoOn(prev => !prev)}
            className={`p-3 rounded-full ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
          </button>
          <button
            onClick={() => setIsAudioOn(prev => !prev)}
            className={`p-3 rounded-full ${!isAudioOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            {isAudioOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </button>
        </div>
        {/* Join meeting button */}
        <button
          onClick={() => onJoin({ name, isVideoOn, isAudioOn })}
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
