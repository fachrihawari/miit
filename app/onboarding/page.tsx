import { FaUser, FaVideo } from 'react-icons/fa';
import { onboarding } from '@/app/actions';
import { TfiVideoCamera } from 'react-icons/tfi';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="fixed inset-0 bg-gray-100 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <TfiVideoCamera size={30} className="text-blue-600" />
          <h2 className="text-3xl font-semibold text-blue-600 text-center ml-2">Miit</h2>
        </div>
        <p className="text-center text-gray-600 mb-6">Experience seamless, high-quality video meetings with Miit. Join for free and connect with anyone, anywhere.</p>
        <form action={onboarding}>
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                name="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
                placeholder="Enter your username"
                required
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            <FaVideo className="mr-2" />
            Start Your Miit Journey
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">By joining, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}
