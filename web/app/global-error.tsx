"use client";

import { useEffect, useState } from "react";
import FeedbackModal from "@/components/modals/FeedbackModal";
import Link from "next/link";
import BackgroundGrid from "@/components/BackgroundGrid";


export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="ru">
            <body className="bg-[#f2e3bf] text-[#3c2415] min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
                <BackgroundGrid />

                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="rounded-3xl border-2 border-[#e28b82] bg-[#fff5f5] shadow-[0_8px_0_#d16a62,0_18px_30px_rgba(0,0,0,0.2)] p-10">
                        <h1 className="text-4xl font-extrabold text-[#d26d75] mb-4">
                            Критическая ошибка
                        </h1>
                        <p className="text-[#5e4632] mb-8 leading-relaxed">
                            Произошло что-то серьезное. Мы уже знаем об этом, но ваша помощь не помешает.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => reset()}
                                className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-6 py-3 text-lg font-semibold text-[#4a2c1f] shadow-[0_4px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c99063]"
                            >
                                Попробовать снова
                            </button>

                            <button
                                onClick={() => setIsFeedbackOpen(true)}
                                className="w-full rounded-xl border-2 border-[#e28b82] bg-[#d26d75] px-6 py-3 text-lg font-semibold text-[#fff9eb] shadow-[0_4px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#a9565d]"
                            >
                                Сообщить об ошибке
                            </button>

                            <Link href="/" className="w-full rounded-xl border-2 border-transparent hover:bg-[#fff9eb]/50 px-6 py-2 text-sm font-semibold text-[#d26d75] transition">
                                На главную
                            </Link>
                        </div>
                    </div>
                </div>

                {isFeedbackOpen && (
                    <FeedbackModal
                        onClose={() => setIsFeedbackOpen(false)}
                        context={`Global Error: ${error.message} (${error.digest || 'no digest'})`}
                    />
                )}
            </body>
        </html>
    );
}
