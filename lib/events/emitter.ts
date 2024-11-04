import { EventEmitter } from "node:events";
import { EVENTS } from "./constants";
import nanoid from "../nanoid";

export type EventMap = {
  [EVENTS.JOIN_ROOM]: [data: { code: string }, username: string]
  [EVENTS.LEAVE_ROOM]: [data: { code: string }, username: string]
  [EVENTS.CREATE_OFFER]: [data: { code: string, offer: RTCSessionDescriptionInit }, username: string]
  [EVENTS.CREATE_ANSWER]: [data: { code: string, answer: RTCSessionDescriptionInit }, username: string]
  [EVENTS.OFFER_CANDIDATE]: [data: { code: string; candidate: RTCIceCandidateInit }, username: string]
  [EVENTS.ANSWER_CANDIDATE]: [data: { code: string; candidate: RTCIceCandidateInit }, username: string]
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
