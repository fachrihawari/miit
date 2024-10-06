type MeetingParticipantsProps = {
  participants: {
    id: string
    name: string
  }[]
  isParticipantListOpen: boolean
}

export default function MeetingParticipants({ participants, isParticipantListOpen }: MeetingParticipantsProps) {
  return (
    <aside className={`w-72 z-50 absolute h-[calc(100vh-64px)] -right-72 top-16 bg-white shadow-md p-4 overflow-y-auto transition-all duration-300 ${isParticipantListOpen ? '-translate-x-72' : 'translate-x-0'}`}>
      <h2 className="text-lg font-semibold mb-4">Participants ({participants.length + 1})</h2>
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
  )
}