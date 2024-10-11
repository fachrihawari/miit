import { EventEmitter } from "node:events";
import { EVENTS } from "./constants";
import nanoid from "../nanoid";

type EventMap = {
  [EVENTS.PING]: [unknown],
  [EVENTS.JOIN_ROOM]: [{ username: string, code: string }],
  [EVENTS.LEAVE_ROOM]: [{ username: string, code: string }],
};

export const emitter = new EventEmitter<EventMap>();

const encoder = new TextEncoder();
export const eventBuilder = (event: string, data?: unknown) => {
  const oneNewLine = '\n'
  const twoNewLine = '\n\n'

  const eventNewLine = data ? oneNewLine : twoNewLine
  const payload = [
    `id: ${nanoid(12)}` + oneNewLine,
    `event: ${event}` + eventNewLine
  ]
  if (data) {
    payload.push(`data: ${JSON.stringify(data)}${twoNewLine}`)
  }

  return encoder.encode(payload.join(''))
}