// Need to separate because will be used in client and server

export const EVENTS = {
  PING: 'ping',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  CREATE_OFFER: 'create_offer',
  CREATE_ANSWER: 'create_answer',
} as const;