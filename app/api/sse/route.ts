import { emitter } from "@/lib/events/emitter";
import { EVENTS } from "@/lib/events/constants";
import { eventBuilder } from "@/lib/events/emitter";
import { NextResponse } from "next/server";
import { getRoom } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { name, data } = await req.json()
  const username = cookies().get('username')
  if (!username) return

  emitter.emit(name, data, username.value)

  return NextResponse.json({}, { status: 202 });
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
  emitter.on(EVENTS.JOIN_ROOM, async ({ code }, username) => {
    if (roomCode !== code) return

    // Addd user to room
    const room = getRoom(code)
    if (room.members.size === 0) {
      room.host = username;
    }
    room.members.add(username)

    // Broadcast user joined event
    await writer.write(eventBuilder(EVENTS.JOIN_ROOM, {
      userJoined: username,
      users: Array.from(room.members),
      offer: room.offer,
    }))
  })

  // Broadcast user left event
  emitter.on(EVENTS.LEAVE_ROOM, async ({ code }, username) => {
    if (roomCode !== code) return

    // FIXME: Handle if host leave call, meeting should be ended

    // Remove user from room
    const room = getRoom(code)
    room.members.delete(username)

    // Broadcast user left event
    await writer.write(eventBuilder(EVENTS.LEAVE_ROOM, { userLeft: username, users: Array.from(room.members) }))
  })

  // Broadcast create offer event
  emitter.on(EVENTS.CREATE_OFFER, async ({ code, offer }, _username) => {
    if (roomCode !== code) return

    // Update offer in room
    const room = getRoom(code)
    room.offer = { sdp: offer.sdp, type: offer.type }

    // Broadcast user left event
    await writer.write(eventBuilder(EVENTS.CREATE_OFFER, room.offer))
  })

  // Broadcast create answer event
  emitter.on(EVENTS.CREATE_ANSWER, async ({ code, answer }, _username) => {
    if (roomCode !== code) return

    // Update answer in room
    const room = getRoom(code)
    room.answer = { sdp: answer.sdp, type: answer.type }

    // Broadcast user left event
    await writer.write(eventBuilder(EVENTS.CREATE_ANSWER, {
      users: Array.from(room.members),
      offer: room.offer,
      answer: room.answer,
      offerCandidates: room.offerCandidates,
      answerCandidates: room.answerCandidates,
    }))
  })

  // FIXME: move to POST method handle
  // Broadcast offer candidate event
  emitter.on(EVENTS.ANSWER_CANDIDATE, async ({ code, candidate }, _username) => {
    if (roomCode !== code) return

    // Update answerCandidates in room
    const room = getRoom(code)
    room.answerCandidates.push(candidate)

    await writer.write(eventBuilder(EVENTS.ANSWER_CANDIDATE, candidate))
  })

  // FIXME: move to POST method handle
  // Broadcast offer candidate event
  emitter.on(EVENTS.OFFER_CANDIDATE, async ({ code, candidate }, _username) => {
    if (roomCode !== code) return

    // Update offerCandidates in room
    const room = getRoom(code)
    room.offerCandidates.push(candidate)

    await writer.write(eventBuilder(EVENTS.OFFER_CANDIDATE, candidate))
  })


  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      Cookie: cookies().toString(),
    },
  });
}
