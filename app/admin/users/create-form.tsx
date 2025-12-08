'use client';

import { createUser } from '@/app/actions/users';
import { useRef, useState } from 'react';

export default function UserCreateForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function clientAction(formData: FormData) {
        const result = await createUser(formData);
        if (result?.success) {
            formRef.current?.reset();
            setFeedback({ type: 'success', text: 'Пользователь создан.' });
        } else if (result?.error) {
            setFeedback({ type: 'error', text: result.error });
        }
    }

    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mb-8">
            <h3 className="text-xl font-extrabold mb-4 text-[#d26d75]">Добавить пользователя</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                    Username
                    <input
                        type="text"
                        name="username"
                        required
                        className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                    />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                    Email
                    <input
                        type="email"
                        name="email"
                        required
                        className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                    />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                    Пароль
                    <input
                        type="password"
                        name="password"
                        required
                        className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                    />
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold text-[#5e4632]">
                    <input
                        type="checkbox"
                        name="isAdmin"
                        className="h-4 w-4 rounded border-[#d2a06f]"
                    />
                    Администратор
                </label>

                <div className="md:col-span-4">
                    <button
                        type="submit"
                        className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-6 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d]"
                    >
                        Создать
                    </button>
                    {feedback && (
                        <p className={`mt-3 text-sm font-medium ${feedback.type === 'error' ? 'text-[#b73d3d]' : 'text-[#2f7a3b]'}`}>
                            {feedback.text}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
