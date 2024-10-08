'use server'

import { roomsCollection } from "@/lib/db/room_collection"
import { nanoid } from "nanoid"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function onboarding(formData: FormData) {
    const username = formData.get('username')
    cookies().set('username', username as string)
    redirect('/')
}

export async function getRoom(code: string) {
    return await roomsCollection.findOne({ code })
}

export async function joinRoom(code: string) {
    cookies().set('joined', code)

    const room = await getRoom(code)
    if (!room) {
        return 'Room is not exists'
    }
    if (room.createdBy === await getCookieValue('username')) {
        cookies().set('host', code)
    }
}

export async function leaveRoom() {
    cookies().delete('joined')
    cookies().delete('host')
    redirect('/')
}   

export async function createRoom() {
    const code = nanoid()
    const username = cookies().get('username')!.value // guaranteed by middleware
    await roomsCollection.insertOne({ createdBy: username, code, createdAt: new Date(), offerCandidates: [], answerCandidates: [] })
    cookies().set('joined', code)
    redirect('/' + code)
}

export async function setOffer(code: string, type: string, sdp: string) {
    await roomsCollection.updateOne({ code }, { $set: { offer: { type, sdp } } })
}

export async function setAnswer(code: string, type: string, sdp: string) {
    await roomsCollection.updateOne({ code }, { $set: { answer: { type, sdp } } })
}

export async function addOfferCandidates(code: string, candidate: RTCIceCandidateInit) {
    await roomsCollection.updateOne({ code }, { $push: { offerCandidates: candidate } })
}

export async function addAnswerCandidates(code: string, candidate: RTCIceCandidateInit) {
    await roomsCollection.updateOne({ code }, { $push: { answerCandidates: candidate } })
}

export async function goToPreJoin(_: string, formData: FormData) {
    await new Promise(resolve => setTimeout(resolve, 500))

    const code = formData.get('code') ?? ''
    if (!code) {
        return 'Room code is required'
    }

    const roomExists = await getRoom(code.toString())
    if (!roomExists) {
        return 'Room is not exists'
    }

    redirect('/' + code)
}

export async function getCookieValue(cookieName: string) {
    if (cookies().has(cookieName)) {
        return cookies().get(cookieName)!.value
    }
    return ''
}