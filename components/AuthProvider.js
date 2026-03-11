"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = pathname === "/login";
    const isAuth = localStorage.getItem("auth") === "1";

    if (!isPublic && !isAuth) {
      router.replace("/login");
    }
  }, [pathname]);

  return children;
}