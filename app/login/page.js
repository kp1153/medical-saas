"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session-check")
      .then((r) => r.json())
      .then((d) => { if (d.ok) router.replace("/dashboard"); });
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-4 backdrop-blur">
            <span className="text-4xl">⚕️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ClinicOS</h1>
          <p className="text-blue-300 text-sm mt-1">Smart Clinic Management</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <p className="text-white/70 text-sm text-center mb-6">
            Sign in with your Google account to access the dashboard
          </p>

          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Continue with Google
          </a>

          <p className="text-white/40 text-xs text-center mt-6">
            Only authorized accounts can access this system
          </p>
        </div>

        <p className="text-white/30 text-xs text-center mt-6">
          ClinicOS · Nishant Softwares
        </p>
      </div>
    </main>
  );
}