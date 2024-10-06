import { z } from "zod";
import { db } from "./client";

export const RoomSchema = z.object({
  code: z.string(),
  createdAt: z.date().default(new Date()),
});

export type RoomForm = z.infer<typeof RoomSchema>

export const roomsCollection = db.collection<RoomForm>("rooms");
