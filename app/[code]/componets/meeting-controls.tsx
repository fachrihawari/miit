import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from "react-icons/fa"

type MeetingControlsProps = {
  isVideoOn: boolean
  setIsVideoOn: React.Dispatch<React.SetStateAction<boolean>>
  isAudioOn: boolean
  setIsAudioOn: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean
  error: string
  leaveCall?: () => void
}
export default function MeetingControls({ error, setIsVideoOn, isVideoOn, isLoading, setIsAudioOn, isAudioOn, leaveCall }: MeetingControlsProps) {
  return (
    <div className="my-6">
      <div className="flex justify-center items-center space-x-4">
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


        {leaveCall && (
          <button onClick={leaveCall} className="bg-red-500 text-white p-3 rounded-full">
            <FaPhoneSlash size={20} />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
    </div>
  )
}

