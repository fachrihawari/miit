import CallLoading from '@/components/call-loading'
import dynamic from 'next/dynamic'

const Room = dynamic(() => import('@/components/room'), { ssr: false, loading: () => <CallLoading /> })

export default function Page({ params }: { params: { code: string } }) {
  return <Room code={params.code} />
}