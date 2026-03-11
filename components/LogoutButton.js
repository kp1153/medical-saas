"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("auth");
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