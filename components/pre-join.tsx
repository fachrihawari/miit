'use client'

import VideoTile from './video-tile';
import MeetingCode from './meeting-code';
import MeetingControls from './meeting-controls';
import useMediaStream from '../hooks/use-media-stream';
import { joinRoom } from '@/app/actions';

type PreJoinProps = {
  code: string
  username: string
}
function PreJoin({ code, username }: PreJoinProps) {
  const { isVideoOn, setIsVideoOn, isAudioOn, setIsAudioOn, error, isLoading, videoRef } = useMediaStream();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <header>
          <h1 className="text-2xl font-semibold text-center mb-6">Join the Meeting</h1>
        </header>
        
        {/* Meeting code display and copy button */}
        <MeetingCode code={code} />

        {/* Video preview */}
        <VideoTile username={username} isAudioOn={isAudioOn} isVideoOn={isVideoOn} videoRef={videoRef} isLoading={isLoading} />

        {/* Media control buttons */}
        <MeetingControls error={error} setIsVideoOn={setIsVideoOn} isVideoOn={isVideoOn} isLoading={isLoading} setIsAudioOn={setIsAudioOn} isAudioOn={isAudioOn} />

        {/* Join meeting button */}
        <button
          onClick={() => joinRoom(code)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400 disabled:text-gray-50 disabled:cursor-not-allowed"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}

export default PreJoin;

