'use client';

import { createCard } from '@/app/actions/cards';
import { useRef } from 'react';

type CategoryOption = {
    id: number;
    name: string;
};

export default function CardCreateForm({ categories }: { categories: CategoryOption[] }) {
    const formRef = useRef<HTMLFormElement>(null);

    async function clientAction(formData: FormData) {
        const result = await createCard(formData);
        if (result?.success) {
            formRef.current?.reset();
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">Добавить карточку (квест)</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Текст задания</label>
                    <textarea
                        name="questText"
                        required
                        rows={3}
                        placeholder="Сфотографируй самый старый дом на улице..."
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                    <input
                        type="text"
                        name="slug"
                        required
                        placeholder="old-house-photo"
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Сложность</label>
                    <select name="difficulty" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none">
                        <option value="easy">Easy (Лёгкий)</option>
                        <option value="medium">Medium (Средний)</option>
                        <option value="hard">Hard (Сложный)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Symbol Seed (для иконки)</label>
                    <input
                        type="text"
                        name="symbolSeed"
                        placeholder="house"
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Используется для генерации уникальной пиктограммы.</p>
                </div>

                <div className="md:col-span-2 border-t pt-4 mt-2">
                    <label className="block text-sm font-medium mb-2">Категории</label>
                    <div className="flex flex-wrap gap-4">
                        {categories.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="categories" value={cat.id} className="w-4 h-4 text-[#d2a06f] focus:ring-[#d2a06f]" />
                                <span className="text-sm">{cat.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="bg-[#d2a06f] text-white px-6 py-2 rounded hover:bg-[#b8865c] transition font-medium w-full md:w-auto"
                    >
                        Создать карточку
                    </button>
                </div>
            </form>
        </div>
    );
}
