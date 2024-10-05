import { emitter } from "@/lib/events/emitter";
import { EVENTS } from "@/lib/events/constants";
import { buildEvent } from "@/lib/sse";
import { randomUUID } from 'node:crypto'
import { NextResponse } from "next/server";

export async function POST() {
  emitter.emit(EVENTS.USER_JOINED, randomUUID(), new Date());
  return NextResponse.json({ userId: randomUUID() });
}

export async function GET(req: Request) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  req.signal.onabort = () => {
    console.log('SSE connection abroted!');
    writer.close();
  };

  // Ping to open connection
  writer.write(buildEvent(EVENTS.PING))

  // Broadcast user joined event
  emitter.on(EVENTS.USER_JOINED, (userId, createdAt) => {
    writer.write(buildEvent(EVENTS.USER_JOINED, { userId, createdAt }))
  })

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache, no-transform"
    },
  });
}
