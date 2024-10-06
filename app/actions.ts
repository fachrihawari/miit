'use server'

import { roomsCollection } from "@/lib/db/room_collection"
import { nanoid } from "nanoid"
import { redirect } from "next/navigation"

export async function createRoom() {
    const code = nanoid()
    await roomsCollection.insertOne({ code, createdAt: new Date() })
    redirect('/' + code)
}

export async function joinRoom(formData: FormData) {
    const code = formData.get('code')
    redirect('/' + code)
}