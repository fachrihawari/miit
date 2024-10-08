import { useEffect, useState } from "react"
import { getCookieValue } from "@/app/actions"

export default function useJoined(code: string) {
  const [username, setUsername] = useState('')
  const [ready, setReady] = useState(false)
  const [joined, setJoined] = useState(false)
  const [host, setHost] = useState(false)

  useEffect(() => {
    const checkCookie = async () => {
      setUsername(await getCookieValue('username'))
      setJoined(await getCookieValue('joined') === code)
      setHost(await getCookieValue('host') === code)
      setReady(true)
    }
    checkCookie()
  }, [code])

  return { ready, joined, username, host, setJoined }
}