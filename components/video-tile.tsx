import { FaVideoSlash, FaMicrophoneSlash } from "react-icons/fa"

type VideoTileProps = {
  username: string
  isVideoOn?: boolean
  isAudioOn?: boolean
  videoRef: React.RefObject<HTMLVideoElement> | undefined
  isLoading?: boolean
  className?: string
}
export default function VideoTile({ className, username, isVideoOn = false, isAudioOn = false, videoRef, isLoading = false }: VideoTileProps) {
  return (
    <div className={`${className} bg-black overflow-hidden`}>
      {isVideoOn && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover" />
      )}
      {
        !isVideoOn && (
          <div className={`flex flex-col h-full items-center justify-center`}>
            <p className="text-white text-2xl font-bold mb-4">{username}</p>
            <div className="flex gap-4">
              <FaVideoSlash size={24} className="text-gray-400" />
              {!isAudioOn && (
                <FaMicrophoneSlash size={24} className="text-gray-400" />
              )}
            </div>
          </div>
        )
      }

      {isVideoOn && !isAudioOn && (
        <div className="absolute top-2 right-2 bg-gray-500/50 rounded-full p-2">
          <FaMicrophoneSlash size={18} className="text-white" />
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}
