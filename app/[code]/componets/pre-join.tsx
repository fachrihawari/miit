'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaUser, FaVideo, FaMicrophone, FaVideoSlash, FaMicrophoneSlash, FaCheck, FaCopy } from 'react-icons/fa';

// Define the props for the PreJoin component
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
        <VideoPreview isVideoOn={isVideoOn} videoRef={videoRef} isLoading={isLoading} />

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

type VideoPreviewProps = {
  isVideoOn: boolean
  videoRef: React.RefObject<HTMLVideoElement>
  isLoading: boolean
}
function VideoPreview({ isVideoOn, videoRef, isLoading }: VideoPreviewProps) {
  return (
    <div className="mb-6">
      <div className="relative w-full h-48 bg-black rounded-md overflow-hidden">
        {isVideoOn && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover" />
        )}
        {!isVideoOn && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <FaUser size={48} className="text-gray-400" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}

type MeetingControlsProps = {
  isVideoOn: boolean
  setIsVideoOn: React.Dispatch<React.SetStateAction<boolean>>
  isAudioOn: boolean
  setIsAudioOn: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean
  error: string
}
function MeetingControls({ error, setIsVideoOn, isVideoOn, isLoading, setIsAudioOn, isAudioOn }: MeetingControlsProps) {
  return (
    <>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setIsVideoOn(prev => !prev)}
          className={`p-3 rounded-full ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          aria-label={isVideoOn ? "Turn off video" : "Turn on video"}
          disabled={isLoading}
        >
          {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </button>
        <button
          onClick={() => setIsAudioOn(prev => !prev)}
          className={`p-3 rounded-full ${!isAudioOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          aria-label={isAudioOn ? "Turn off microphone" : "Turn on microphone"}
          disabled={isLoading}
        >
          {isAudioOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
    </>
  )
}


type MeetingCodeProps = {
  code: string
}
function MeetingCode({ code }: MeetingCodeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Meeting Code:</p>
          <p className="text-lg font-semibold">{code}</p>
        </div>
        <button
          onClick={copyCode}
          className={`p-2 ${isCopied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md  transition duration-200`}
          aria-label={isCopied ? "Code copied" : "Copy meeting code"}
        >
          {isCopied ? <FaCheck size={16} /> : <FaCopy size={16} />}
        </button>
      </div>
    </div>
  )
}


function useMediaStream() {
  // State for user input and media settings
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for managing media streams
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopStream = useCallback((kind: 'video' | 'audio' | 'all') => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        if (track.kind === kind || kind === 'all') {
          track.stop();
          streamRef.current!.removeTrack(track);
        }
      }
    }
    if ((kind === 'all' || kind === 'video') && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startStream = useCallback(async (kind: 'video' | 'audio') => {
    setError('');

    if (kind === 'video') {
      setIsLoading(true);
    }

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
      setError(`Unable to access ${kind} device. Please check your permissions.`);
    } finally {
      setIsLoading(false);
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
  }, [stopStream]);

  return { isVideoOn, setIsVideoOn, isAudioOn, setIsAudioOn, error, isLoading, streamRef, videoRef, stopStream, startStream };
}