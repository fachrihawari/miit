

export type JoinRoomEventData = {
  userJoined: string
  users: string[]
}

export type LeaveRoomEventData = {
  userLeft: string
  users: string[]
}