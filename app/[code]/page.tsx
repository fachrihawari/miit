'use client'
import { useState } from "react";
import PreJoin from "./componets/pre-join";
import Call from "./componets/call";

type PageProps = {
  params: { code: string }
}

export default function Page({ params }: PageProps) {
  const [joined, setJoined] = useState(false);

  const handleJoin = ({ name, isVideoOn, isAudioOn }: { name: string, isVideoOn: boolean, isAudioOn: boolean }) => {
    console.log('handleJoin', name, isVideoOn, isAudioOn)
    localStorage.setItem('name', name)
    localStorage.setItem('isVideoOn', isVideoOn.toString())
    localStorage.setItem('isAudioOn', isAudioOn.toString())
    setJoined(true)
  }

  if (!joined) {
    return <PreJoin code={params.code} onJoin={handleJoin} />
  }
  return <Call />
}