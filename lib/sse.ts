import { randomUUID } from "crypto";

const encoder = new TextEncoder();

export const buildEvent = (event: string, data?: unknown) => {
  const oneNewLine = '\n'
  const twoNewLine = '\n\n'

  const eventNewLine = data ? oneNewLine : twoNewLine
  const payload = [
    `id: ${randomUUID()}` + oneNewLine,
    `event: ${event}` + eventNewLine
  ]
  if (data) {
    payload.push(`data: ${JSON.stringify(data)}${twoNewLine}`)
  }

  return encoder.encode(payload.join(''))
}
