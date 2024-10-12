import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from "react-icons/fa"

type MeetingControlsProps = {
  isVideoOn: boolean
  isAudioOn: boolean
  toggleAudio: () => void
  toggleVideo: () => void
  hangupCall?: () => void
}
export default function MeetingControls({ isVideoOn, isAudioOn, toggleAudio, toggleVideo, hangupCall }: MeetingControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center space-x-4 py-8">
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
        aria-label={isVideoOn ? "Turn off video" : "Turn on video"}
      >
        {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
      </button>
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-full ${!isAudioOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
        aria-label={isAudioOn ? "Turn off microphone" : "Turn on microphone"}
      >
        {isAudioOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
      </button>

      {hangupCall && (
        <button onClick={hangupCall} className="bg-red-500 text-white p-3 rounded-full">
          <FaPhoneSlash size={20} />
        </button>
      )}
    </div>
  )
}

