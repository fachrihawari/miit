import { emitter } from "@/lib/events/emitter";
import { EVENTS } from "@/lib/events/constants";
import { NextResponse } from "next/server";
import { randomUUID } from 'node:crypto'

export async function POST() {
  emitter.emit(EVENTS.USER_JOINED, randomUUID(), new Date());
  return NextResponse.json({ userId: randomUUID() });
}

export async function GET(req: Request) {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder();
  const writer = responseStream.writable.getWriter();

  req.signal.onabort = () => {
    console.log('abort');
    writer.close();
  };

  // Ping to open connection
  writer.write(encoder.encode(`event: ping\n\n`))

  emitter.on(EVENTS.USER_JOINED, (userId, createdAt) => {
    console.log('user joined', userId, createdAt);
    writer.write(encoder.encode(`event: ${EVENTS.USER_JOINED}\n`))
    writer.write(encoder.encode(`data: ${JSON.stringify({ userId, createdAt })}\n\n`));
  })

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache, no-transform"
    },
  });
}
