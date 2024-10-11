const rooms = new Map<string, Set<string>>()

export function addUserToRoom(code: string, username: string) {
  const roomUsers = rooms.get(code) || new Set()
  roomUsers.add(username)
  rooms.set(code, roomUsers)
}

export function removeUserFromRoom(code: string, username: string) {
  const roomUsers = rooms.get(code) || new Set()
  roomUsers.delete(username)
  rooms.set(code, roomUsers)
}

export function getRoomUsers(code: string) {
  return Array.from(rooms.get(code) || [])
}