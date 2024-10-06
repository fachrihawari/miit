import { useState, useCallback } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

type MeetingCodeProps = {
  code: string
}
export default function MeetingCode({ code }: MeetingCodeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [code]);

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Meeting Code:</p>
          <p className="text-lg font-semibold">{code}</p>
        </div>
        <button
          onClick={copyCode}
          className={`p-2 ${isCopied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md  transition duration-200`}
          aria-label={isCopied ? "Code copied" : "Copy meeting code"}
        >
          {isCopied ? <FaCheck size={16} /> : <FaCopy size={16} />}
        </button>
      </div>
    </div>
  )
}
