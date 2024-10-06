import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import PreJoin from "@/components/pre-join";

function CallLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading Meeting</h2>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">
          Please wait while we set up your meeting room...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a few moments depending on your connection.
        </p>
      </div>
    </div>
  );
}

const Call = dynamic(() => import("@/components/call"), { 
  ssr: false,
  loading: () => <CallLoading />
})

type PageProps = {
  params: { code: string }
}

export default function Page({ params }: PageProps) {
  const joined = cookies().get('joined')
  const username = cookies().get('username')! // it's guaranteed to be here by the middleware

  if (!joined || joined.value !== params.code) {
    return <PreJoin code={params.code} username={username.value} />
  }
  return <Call code={params.code} username={username.value} />
}