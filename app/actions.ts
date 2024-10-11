'use server'

import { EVENTS } from "@/lib/events/constants"
import nanoid from "@/lib/nanoid"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export async function getUsername() {
  return cookies().get('username')?.value ?? ''
}

export async function goToRoom(formData: FormData) {
  const code = formData.get('code')?.toString()
  redirect(`/${code}`)
}

export async function joinRoom(code: string) {
  const username = cookies().get('username')!.value
  await fetch(`${baseUrl}/api/sse`, {
    method: 'POST',
    body: JSON.stringify({
      name: EVENTS.JOIN_ROOM,
      data: { username, code }
    }),
  })
}
export async function leaveRoom(code: string) {
  const username = cookies().get('username')!.value
  await fetch(`${baseUrl}/api/sse`, {
    method: 'POST',
    body: JSON.stringify({
      name: EVENTS.LEAVE_ROOM,
      data: { username, code }
    }),
  })
}

export async function createRoom() {
  const code = nanoid(8)
  redirect(`/${code}`)
}

export async function onboarding(formData: FormData) {
  const username = formData.get('username')
  cookies().set('username', username as string, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
  })
  redirect('/')
}