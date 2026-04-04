"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-red-300 hover:text-white text-sm transition"
    >
      Logout
    </button>
  );
}