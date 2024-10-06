import { z } from "zod";
import { db } from "./client";

const CandidateSchema = z.object({
  sdpMLineIndex: z.number().nullable().optional(),
  sdpMid: z.string().nullable().optional(),
  candidate: z.string().optional(),
  usernameFragment: z.string().nullable().optional(),
})

const OfferAnswerSchema = z.object({
  type: z.string(),
  sdp: z.string(),
})

export const RoomSchema = z.object({
  code: z.string(),
  offer: OfferAnswerSchema.optional(),
  answer: OfferAnswerSchema.optional(),
  offerCandidates: z.array(CandidateSchema).default([]),
  answerCandidates: z.array(CandidateSchema).default([]),
  createdAt: z.date().default(new Date()),
});

export type RoomForm = z.infer<typeof RoomSchema>

export const roomsCollection = db.collection<RoomForm>("rooms");
