type Room = {
  members: Set<string>
  host: string,
  offer: RTCSessionDescriptionInit
  answer: RTCSessionDescriptionInit
  offerCandidates: RTCIceCandidateInit[]
  answerCandidates: RTCIceCandidateInit[]
}
const rooms = new Map<string, Room>();

export const getRoom = (code: string) => {
  let room = rooms.get(code)
  if (!room) {
    const newRoom: Room = {
      members: new Set(),
      host: "",
      offer: { sdp: '', type: 'offer' },
      answer: { sdp: '', type: 'answer' },
      offerCandidates: [],
      answerCandidates: [],
    }
    rooms.set(code, newRoom)
    room = newRoom
  }

  return room
}
