

export type JoinRoomEventData = {
  userJoined: string
  users: string[]
  offer: RTCSessionDescriptionInit;
}

export type LeaveRoomEventData = {
  userLeft: string
  users: string[]
}

export type CreateAnswerEventData = {
  users: string[];
  answer: RTCSessionDescriptionInit;
  offer: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidateInit[];
  answerCandidates: RTCIceCandidateInit[];
};
