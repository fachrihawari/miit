import { useState, useRef, useCallback, useEffect } from "react";

export default function useMediaStream() {
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