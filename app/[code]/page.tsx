'use client'

import dynamic from "next/dynamic";
import { useCallback } from "react";
import { joinRoom } from "@/app/actions";
import CallLoading from "@/components/call-loading";
import useJoined from "@/hooks/use-joined";

const Call = dynamic(() => import("@/components/call"), {
  ssr: false,
  loading: () => <CallLoading />
})
const PreJoin = dynamic(() => import("@/components/pre-join"), {
  ssr: false,
  loading: () => <CallLoading />
})

type PageProps = {
  params: { code: string }
}
export default function Page({ params }: PageProps) {
  const { ready, joined, username, host, setJoined } = useJoined(params.code)

  const handleJoin = useCallback(async () => {
    const err = await joinRoom(params.code)
    if (err) return alert(err)
    setJoined(true)
  }, [params.code])

  if (!ready) {
    return <CallLoading />
  }

  if (joined) {
    return <Call code={params.code} username={username} host={host} />;
  }

  return <PreJoin code={params.code} username={username} onJoin={handleJoin} />;
}

