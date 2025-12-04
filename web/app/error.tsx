"use client";

import { useEffect } from "react";
import BackgroundGrid from "@/components/BackgroundGrid";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center text-[#3c2415] px-6 overflow-hidden">
            <BackgroundGrid />

            <div className="relative z-10 w-full max-w-md text-center">
                <div className="rounded-3xl border-2 border-[#e28b82] bg-[#fff5f5] shadow-[0_8px_0_#d16a62,0_18px_30px_rgba(0,0,0,0.2)] p-10">
                    <h1 className="text-4xl font-extrabold text-[#d26d75] mb-4">
                        Упс! Ошибка
                    </h1>
                    <p className="text-[#5e4632] mb-8 leading-relaxed">
                        Что-то пошло не так. Мы уже знаем об этом и работаем над исправлением.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => reset()}
                            className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-6 py-3 text-lg font-semibold text-[#4a2c1f] shadow-[0_4px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c99063]"
                        >
                            Попробовать снова
                        </button>
                        <a
                            href="/"
                            className="w-full rounded-xl border-2 border-[#e28b82] bg-[#d26d75] px-6 py-3 text-lg font-semibold text-[#fff9eb] shadow-[0_4px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#a9565d]"
                        >
                            На главную
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
