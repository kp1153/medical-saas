import Link from "next/link";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Expired() {
  const session = await getSession();
  const email = session?.email || "";
  const hubUrl = `https://nishantsoftwares.in/clinic${email ? `?email=${encodeURIComponent(email)}` : ""}`;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ट्रायल समाप्त
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            आपका ७ दिन का निःशुल्क ट्रायल समाप्त हो गया है। ClinicOS आगे चलाने के लिए कृपया लाइसेंस खरीदें।
          </p>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-1">ClinicOS लाइसेंस</p>
            <p className="text-2xl font-extrabold text-blue-700 mb-1">
              ₹४,९९९ <span className="text-sm font-normal text-blue-500">/ साल</span>
            </p>
            <p className="text-xs text-blue-500">नवीनीकरण: ₹१,९९९ / साल</p>
          </div>

          <a
            href={hubUrl}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition mb-3"
          >
            अभी खरीदें
          </a>

          <a
            href="https://wa.me/919996865069"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition mb-6"
          >
            WhatsApp सहायता
          </a>

          <Link
            href="/login"
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            लॉगिन पर वापस
          </Link>
        </div>
      </div>
    </main>
  );
}