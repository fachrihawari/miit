import Image from "next/image";
import { cookies } from "next/headers";
import { TfiPlus } from "react-icons/tfi";
import { createRoom, goToRoom } from "./actions";
import Navbar from "@/components/navbar";

export default function Page() {
  const username = cookies().get('username')! // it's guaranteed to be here by the middleware

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 xl:px-0 flex items-center">
        <div className="mx-auto flex flex-col-reverse lg:flex-row items-center justify-between">
          <div className="w-full lg:w-4/7 xl:w-1/2 mb-8">
            <h1 className="text-4xl font-normal mb-4 text-gray-900">Welcome to Miit, {username.value}!</h1>
            <p className="text-lg mb-8 text-gray-700">Experience seamless, high-quality video meetings with Miit, now accessible to everyone, completely free.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <form action={createRoom}>
                <button className="bg-blue-600 w-full hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md flex items-center transition duration-200">
                  <TfiPlus size={18} className="mr-2" />
                  New meeting
                </button>
              </form>

              <form className="relative" action={goToRoom}>
                <div className="flex w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Enter a code or link"
                    name="code"
                    className="flex-grow border border-gray-300 rounded-l-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-r-md border border-gray-300 border-l-0 transition duration-200">
                    Join
                  </button>
                </div>

              </form>
            </div>
          </div>
          <div className="w-full md:w-4/5 lg:w-3/7 xl:w-1/2 flex justify-center mb-12 lg:mb-0 lg:justify-end">
            <div>
              <Image
                src="/img/hero-image.png"
                alt="Miit in action"
                width={928}
                height={534}
                className="rounded-lg"
              />
              <p className="text-sm text-center text-gray-500 mt-2">Designed by: Freepik</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
