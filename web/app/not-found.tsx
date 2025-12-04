"use client";

import Link from "next/link";
import BackgroundGrid from "@/components/BackgroundGrid";
import { useState } from "react";
import FeedbackModal from "@/components/modals/FeedbackModal";

export default function NotFound() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center text-[#3c2415] px-6 overflow-hidden">
            <BackgroundGrid />

            <div className="relative z-10 w-full max-w-md text-center">
                <div className="rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_8px_0_#c99063,0_18px_30px_rgba(0,0,0,0.2)] p-10">
                    <h1 className="text-6xl font-extrabold text-[#d26d75] mb-4" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-[#4a2c1f] mb-4">
                        Страница потерялась
                    </h2>
                    <p className="text-[#5e4632] mb-8 leading-relaxed">
                        Похоже, это приключение завело вас куда-то не туда. Такой страницы не существует или она была перемещена.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="inline-block w-full rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-6 py-3 text-lg font-semibold text-[#fff9eb] shadow-[0_4px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#a9565d]"
                        >
                            Вернуться домой
                        </Link>
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="w-full rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-6 py-3 text-lg font-semibold text-[#4a2c1f] shadow-[0_4px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c99063]"
                        >
                            Сообщить об ошибке
                        </button>
                    </div>
                </div>
            </div>

            {isFeedbackOpen && (
                <FeedbackModal
                    onClose={() => setIsFeedbackOpen(false)}
                    context="404 Not Found"
                />
            )}
        </main>
    );
}
