'use client'
import { useState } from "react";
import PreJoin from "./componets/pre-join";
import Call from "./componets/call";

type PageProps = {
  params: { code: string }
}

export default function Page({ params }: PageProps) {
  const [joined, setJoined] = useState(false);

  const handleJoin = (name: string) => {
    localStorage.setItem('name', name)
    setJoined(true)
  }

  if (!joined) {
    return <PreJoin code={params.code} onJoin={handleJoin} />
  }
  return <Call code={params.code} />
}