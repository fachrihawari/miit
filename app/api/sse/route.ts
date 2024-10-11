import { emitter } from "@/lib/events/emitter";
import { EVENTS } from "@/lib/events/constants";
import { eventBuilder } from "@/lib/events/emitter";
import { NextResponse } from "next/server";
import { getRoomUsers, addUserToRoom, removeUserFromRoom } from "@/lib/cache";
export async function POST(req: Request) {
  const { name, data } = await req.json()
  emitter.emit(name, data)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const roomCode = searchParams.get('code')

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  req.signal.onabort = () => {
    console.log('SSE connection abroted!');
    writer.close();
  };

  // Broadcast user joined event
  emitter.on(EVENTS.JOIN_ROOM, ({ username, code }) => {
    if (roomCode !== code) return

    // Update room users cache
    addUserToRoom(code, username)

    // Broadcast user joined event
    writer.write(eventBuilder(EVENTS.JOIN_ROOM, { userJoined: username, users: getRoomUsers(code) }))
  })

  // Broadcast user left event
  emitter.on(EVENTS.LEAVE_ROOM, ({ username, code }) => {
    if (roomCode !== code) return

    // Update room users cache
    removeUserFromRoom(code, username)

    // Broadcast user left event
    writer.write(eventBuilder(EVENTS.LEAVE_ROOM, { userLeft: username, users: getRoomUsers(code) }))
  })

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache, no-transform"
    },
  });
}
