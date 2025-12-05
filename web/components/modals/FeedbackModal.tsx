"use client";

import { useState } from "react";

interface FeedbackModalProps {
    onClose: () => void;
    context?: string;
}

export default function FeedbackModal({ onClose, context }: FeedbackModalProps) {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"bug" | "suggestion" | "other">("bug");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        setError(null);

        const jwt = localStorage.getItem("jwt");
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;

        try {
            const payload = {
                data: {
                    message,
                    type,
                    page_context: context || window.location.pathname,
                },
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || ""}/api/feedbacks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Feedback submission error:", errorData);
                throw new Error(errorData?.error?.message || "Failed to submit feedback");
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Не удалось отправить сообщение. Попробуйте позже.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                <div className="relative w-full max-w-md rounded-3xl border-2 border-[#77c97e] bg-[#e3f8e7] text-[#2f7a3b] shadow-[0_8px_0_#5da662,0_18px_30px_rgba(0,0,0,0.2)] p-8 text-center animate-bounce-slow">
                    <h2 className="text-2xl font-bold mb-2">Спасибо!</h2>
                    <p>Ваше сообщение успешно отправлено.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6">
            <div className="relative w-full max-w-md rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb] text-[#3c2415] shadow-[0_8px_0_#c99063,0_18px_30px_rgba(0,0,0,0.2)] p-6 sm:p-8">
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 text-3xl font-semibold text-[#d26d75] transition hover:scale-110 disabled:opacity-50"
                >
                    ×
                </button>

                <h2 className="text-2xl font-extrabold text-[#d26d75] mb-2">Обратная связь</h2>
                <p className="text-sm text-[#5e4632] mb-6">
                    Нашли баг или есть идея? Расскажите нам!
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#5e4632] mb-1">Тип сообщения</label>
                        <div className="flex gap-2">
                            {(["bug", "suggestion", "other"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                    ${type === t
                                            ? "border-[#d26d75] bg-[#d26d75] text-white shadow-[0_2px_0_#a9565d]"
                                            : "border-[#d2a06f] bg-white text-[#5e4632] hover:bg-[#fffdf5]"
                                        }
                  `}
                                >
                                    {t === "bug" ? "Ошибка" : t === "suggestion" ? "Идея" : "Другое"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#5e4632] mb-1">Сообщение</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={4}
                            placeholder="Опишите подробно, что случилось..."
                            className="w-full rounded-xl border-2 border-[#d2a06f]/70 bg-white/80 px-4 py-3 text-base font-normal text-[#3c2415] shadow-inner shadow-[#f3ead9] focus:outline-none focus:border-[#d26d75]"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border-2 border-[#e28b82] bg-[#fde7e5] px-4 py-2 text-sm text-[#b73d3d]">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border-2 border-[#d2a06f] bg-[#fff9eb] px-5 py-2 text-sm font-semibold text-[#4a2c1f] shadow-[0_3px_0_#c99063] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c99063]"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Отправка..." : "Отправить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
