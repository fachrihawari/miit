'use client'
import { EVENTS } from "@/lib/events/constants";
import { useEffect, useState } from "react"

export default function RoomPage() {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.onopen = () => {
      console.log('open');
    }
    eventSource.onerror = (event) => {
      console.log('error', event);
    }

    const userJoined =  (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data) as { userId: string, createdAt: string }
      console.log(EVENTS.USER_JOINED, data)
      setDate(data.createdAt)
    }
    eventSource.addEventListener(EVENTS.USER_JOINED, userJoined)

    return () => {
      eventSource.removeEventListener(EVENTS.USER_JOINED, userJoined)
      eventSource.close();
      console.log(eventSource)
    };
  }, []);
  return <div>Date: {date}</div>
}
