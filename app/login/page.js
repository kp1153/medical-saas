export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/dashboard");
    } else {
      setError(data.message || "Wrong password");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-green-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">💊</span>
          <h1 className="text-2xl font-bold text-blue-900 mt-2">
            Medical SaaS
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your store</p>
        </div>
        <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
          <input type="text" name="username" autoComplete="username"
            value="admin" readOnly className="hidden" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg"
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            Login →
          </button>
        </form>
      </div>
    </main>
  );
}
