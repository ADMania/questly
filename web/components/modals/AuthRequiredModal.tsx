"use client";

import { useRouter } from "next/navigation";

interface AuthRequiredModalProps {
  onClose: () => void;
}

export default function AuthRequiredModal({ onClose }: AuthRequiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
      <div className="w-full max-w-md rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#3c2415] shadow-[0_6px_0_#c99063,0_16px_28px_rgba(0,0,0,0.18)] p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#d26d75]" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.12)" }}>
          Нужен вход в аккаунт
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#5e4632]">
          Карточки добавляются в личную коллекцию. Войдите или зарегистрируйтесь, чтобы сохранять свои приключения и отслеживать прогресс.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-5 py-2.5 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063]"
          >
            Позже
          </button>
          <button
            type="button"
            onClick={handleLogin}
            className="w-full sm:w-auto rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2.5 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d]"
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}
