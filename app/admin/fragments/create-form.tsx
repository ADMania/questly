'use client';

import { createFragment } from '@/app/actions/fragments';
import { useRef, useState } from 'react';

type Option = { id: number; label: string };

export default function FragmentCreateForm({ categories }: { categories: Option[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedCats, setSelectedCats] = useState<number[]>([]);

    async function clientAction(formData: FormData) {
        const result = await createFragment(formData);
        if (result?.success) {
            formRef.current?.reset();
            setSelectedCats([]);
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mb-8">
            <h3 className="text-xl font-extrabold mb-6 text-[#d26d75]">Добавить фрагмент</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Текст</label>
                    <input
                        type="text"
                        name="text"
                        required
                        placeholder="Например: 'исследовать пещеру'"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Слот (Тип)</label>
                    <select
                        name="slot"
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    >
                        <option value="action">Action (Действие)</option>
                        <option value="place">Place (Место)</option>
                        <option value="object">Object (Объект)</option>
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

                <div className="md:col-span-2 border-t border-[#eaddcf] pt-6 mt-2">
                    <label className="block text-sm font-bold text-[#5e4632] mb-3">Категории</label>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((c) => (
                            <label key={c.id} className={`
                                cursor-pointer px-3 py-2 rounded-lg border-2 transition select-none flex items-center gap-2
                                ${selectedCats.includes(c.id)
                                    ? 'bg-[#d26d75] border-[#d26d75] text-white shadow-[0_2px_0_#a9565d] translate-y-[1px]'
                                    : 'bg-white border-[#d2a06f] text-[#5e4632] hover:bg-[#fff9eb]'}
                            `}>
                                <input
                                    type="checkbox"
                                    name="categories"
                                    value={c.id}
                                    checked={selectedCats.includes(c.id)}
                                    onChange={e => {
                                        const id = parseInt(e.target.value);
                                        if (e.target.checked) setSelectedCats([...selectedCats, id]);
                                        else setSelectedCats(selectedCats.filter(x => x !== id));
                                    }}
                                    className="hidden"
                                />
                                <span className="text-sm font-bold">{c.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] text-[#fff9eb] font-bold shadow-[0_3px_0_#a9565d] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] active:translate-y-[1px] active:shadow-[0_2px_0_#a9565d] transition-all"
                    >
                        Создать фрагмент
                    </button>
                </div>
            </form>
        </div>
    );
}
