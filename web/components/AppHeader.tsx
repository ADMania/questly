"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      try {
        const token = localStorage.getItem("jwt");
        setHasToken(Boolean(token));
      } catch {
        setHasToken(false);
      }
    };

    checkToken();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "jwt") {
        checkToken();
      }
    };

    const handleFocus = () => checkToken();
    const handleAuthChange: EventListener = () => {
      checkToken();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("questly-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("questly-auth-change", handleAuthChange);
    };
  }, []);

  return (
    <header className="w-full flex justify-center mt-4 mb-6">
      <nav
        className="flex items-center gap-4 md:gap-10 px-6 md:px-10 py-3 rounded-[16px]
        border-2 border-[#d2a06f] bg-[#fff9eb]
        shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.15)]
        text-[#4a2c1f]"
      >
        <Link
          href="/"
          className="text-base md:text-lg font-medium hover:text-[#c57758] transition-colors"
        >
          Главная
        </Link>
        <Link
          href="/feed"
          className="text-base md:text-lg font-medium hover:text-[#c57758] transition-colors"
        >
          Лента
        </Link>
        {hasToken ? (
          <Link
            href="/profile"
            className="text-base md:text-lg font-medium hover:text-[#c57758] transition-colors"
          >
            Профиль
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-base md:text-lg font-medium hover:text-[#c57758] transition-colors"
          >
            Войти
          </Link>
        )}
      </nav>
    </header>
  );
}
