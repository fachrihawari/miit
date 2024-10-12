'use server'

import { EventMap } from "@/lib/events/emitter"
import nanoid from "@/lib/nanoid"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export async function goToRoom(formData: FormData) {
  const code = formData.get('code')?.toString()
  redirect(`/${code}`)
}

export async function sendEvent<T extends keyof EventMap>(name: T, data: EventMap[T][0]) {
  await fetch(`${baseUrl}/api/sse`, {
    method: 'POST',
    body: JSON.stringify({ name, data }),
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies().toString(),
    },
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
    sameSite: 'strict',
    priority: 'high',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    secure: process.env.NODE_ENV !== 'development',
  })
  redirect('/')
}