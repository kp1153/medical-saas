import Link from "next/link";

export default function Expired() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Trial Expired
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Your 7-day free trial has ended. Please purchase a license to continue using ClinicOS.
          </p>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-1">ClinicOS License</p>
            <p className="text-2xl font-extrabold text-blue-700 mb-1">₹4,999 <span className="text-sm font-normal text-blue-500">/ year</span></p>
            <p className="text-xs text-blue-500">Renewal: ₹1,999/year</p>
          </div>

          <a
            href="https://www.web-developer-kp.com/clinic"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition mb-3"
          >
            Buy License
          </a>

          <a
            href="https://wa.me/919996865069"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition mb-6"
          >
            WhatsApp Support
          </a>

          <Link
            href="/login"
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}