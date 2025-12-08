'use client';

import { createFragment } from '@/app/actions/fragments';
import { CATEGORY_LABELS } from '@/lib/categories';
import { useRef } from 'react';

const categoryOptions = Object.entries(CATEGORY_LABELS);

export default function FragmentCreateForm() {
    const formRef = useRef<HTMLFormElement>(null);

    async function clientAction(formData: FormData) {
        const result = await createFragment(formData);
        if (result?.success) {
            formRef.current?.reset();
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mb-8">
            <h3 className="text-xl font-extrabold mb-6 text-[#d26d75]">Добавить квест</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Текст</label>
                    <input
                        type="text"
                        name="text"
                        required
                        placeholder="Например: 'устроить дружеский пикник во дворе'"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af]"
                    />
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
                </div>
            </form>
        </div>
    );
}
