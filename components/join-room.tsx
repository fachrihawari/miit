'use client'

import { goToPreJoin } from "@/app/actions";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-r-md border border-gray-300 border-l-0 transition duration-200">
      {pending && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-800 mr-2"></div>
        </div>
      )}
      {!pending && 'Join'}
    </button>
  )
}

export default function JoinRoom() {
  const [error, formAction] = useFormState(goToPreJoin, '')

  return (
    <form className="relative" action={formAction}>
      <div className="flex w-full sm:w-auto">
        <input
          type="text"
          placeholder="Enter a code or link"
          name="code"
          className="flex-grow border border-gray-300 rounded-l-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <SubmitButton />
      </div>
      {error && (
        <p 
          className={`text-red-500 transition-all duration-1000 absolute translate-y-2`}
        >
          {error}
        </p>
      )}
    </form>
  )
}