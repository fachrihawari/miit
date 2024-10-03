import { EventEmitter } from "node:events";
import { EVENTS } from "./constants";

type EventMap = {
  [EVENTS.USER_JOINED]: [string, Date]
};

export const emitter = new EventEmitter<EventMap>();
