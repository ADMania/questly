'use client';

import { createQuest } from '@/app/actions/quests';
import { CATEGORY_LABELS } from '@/lib/categories';
import { useRef, useState } from 'react';

const categoryOptions = Object.entries(CATEGORY_LABELS);

export default function QuestCreateForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function clientAction(formData: FormData) {
        const result = await createQuest(formData);
        if (result?.success) {
            formRef.current?.reset();
            setFeedback({ type: 'success', text: 'Квест добавлен.' });
        } else if (result?.error) {
            setFeedback({ type: 'error', text: result.error });
        }
    }

    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mb-8">
            <h3 className="text-xl font-extrabold mb-6 text-[#d26d75]">Добавить квест</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Текст</label>
                    <textarea
                        name="text"
                        required
                        rows={3}
                        placeholder="Например: устроить дружеский пикник во дворе"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af] resize-none"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Сложность</label>
                    <select
                        name="difficulty"
                        defaultValue="medium"
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Вес (Вероятность)</label>
                    <input
                        type="number"
                        name="weight"
                        defaultValue={1}
                        min={1}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Категория</label>
                    <select
                        name="category"
                        defaultValue={categoryOptions[0]?.[0]}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    >
                        {categoryOptions.map(([slug, label]) => (
                            <option key={slug} value={slug}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] text-[#fff9eb] font-bold shadow-[0_3px_0_#a9565d] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] active:translate-y-[1px] active:shadow-[0_2px_0_#a9565d] transition-all"
                    >
                        Создать квест
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
