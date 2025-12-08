'use client';

import { createCard } from '@/app/actions/cards';
import { generateQuestAction } from '@/app/actions/quest-generation';
import { CATEGORY_LABELS } from '@/lib/categories';
import { useRef, useState, useEffect } from 'react';

const categoryOptions = Object.entries(CATEGORY_LABELS);

export default function CardCreateForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [questText, setQuestText] = useState('');
    const [slug, setSlug] = useState('');
    const [symbolSeed, setSymbolSeed] = useState('');
    const [category, setCategory] = useState('');

    // Auto-slug
    useEffect(() => {
        if (questText) {
            const newSlug = questText
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 50);
            // Only auto-update if slug is empty or looks like auto-generated
            if (!slug || slug.startsWith(newSlug.slice(0, 10))) {
                setSlug(newSlug);
            }
        }
    }, [questText]);


    async function clientAction(formData: FormData) {
        const result = await createCard(formData);
        if (result?.success) {
            formRef.current?.reset();
            setQuestText('');
            setSlug('');
            setSymbolSeed('');
            setCategory('');
        } else if (result?.error) {
            alert(result.error);
        }
    }

    async function handleGenerate() {
        const result = await generateQuestAction({
            difficulty: difficulty as any,
            categorySlug: category || undefined
        });

        if (result) {
            setQuestText(result.questText);
            setSymbolSeed(result.symbolSeed);
        }
    }

    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mb-8">
            <h3 className="text-xl font-extrabold mb-6 text-[#d26d75]">Добавить карточку (квест)</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">
                        Текст задания
                        <button
                            type="button"
                            onClick={handleGenerate}
                            className="ml-2 text-xs bg-[#eaddcf] text-[#5e4632] px-2 py-1 rounded-lg hover:bg-[#dccaae] transition border border-[#d2a06f]"
                        >
                            ✨ Сгенерировать
                        </button>
                    </label>
                    <textarea
                        name="questText"
                        required
                        rows={3}
                        value={questText}
                        onChange={e => setQuestText(e.target.value)}
                        placeholder="Сфотографируй самый старый дом на улице..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Slug (URL)</label>
                    <input
                        type="text"
                        name="slug"
                        required
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                        placeholder="old-house-photo"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Сложность</label>
                    <select
                        name="difficulty"
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    >
                        <option value="easy">Easy (Лёгкий)</option>
                        <option value="medium">Medium (Средний)</option>
                        <option value="hard">Hard (Сложный)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Symbol Seed (для иконки)</label>
                    <input
                        type="text"
                        name="symbolSeed"
                        value={symbolSeed}
                        onChange={e => setSymbolSeed(e.target.value)}
                        placeholder="house"
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    />
                    <p className="text-xs text-[#8c6b54] mt-2">Используется для генерации уникальной пиктограммы.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Категория</label>
                    <select
                        name="category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415]"
                    >
                        <option value="">Без категории</option>
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
                        Создать карточку
                    </button>
                    <p className="text-xs text-[#8c6b54] mt-3">
                        Совет: Выберите категорию и сложность перед генерацией, чтобы получить более подходящий квест.
                    </p>
                </div>
            </form>
        </div>
    );
}
