'use client';

import { createPost } from '@/app/actions/posts';
import { useRef, useState } from 'react';

type Option = { id: number; label: string };

export default function PostCreateForm({ authors, cards }: { authors: Option[]; cards: Option[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function clientAction(formData: FormData) {
        const result = await createPost(formData);
        if (result?.success) {
            formRef.current?.reset();
            setFeedback({ type: 'success', text: 'Пост опубликован.' });
        } else if (result?.error) {
            setFeedback({ type: 'error', text: result.error });
        }
    }

    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063] mb-8">
            <h3 className="text-xl font-extrabold mb-6 text-[#d26d75]">Создать пост</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-[#5e4632] mb-2">Заголовок</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af] resize-none"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Содержание</label>
                    <textarea
                        name="content"
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af] resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Автор</label>
                    <select name="authorId" required className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af] resize-none">
                        <option value="">Выберите автора...</option>
                        {authors.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Квест (Карточка)</label>
                    <select name="cardId" required className="w-full px-4 py-3 rounded-xl border-2 border-[#d2a06f] bg-white focus:bg-[#fffcf5] outline-none transition text-[#3c2415] placeholder-[#9ca3af] resize-none">
                        <option value="">Выберите квест...</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] text-[#fff9eb] font-bold shadow-[0_3px_0_#a9565d] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#a9565d] active:translate-y-[1px] active:shadow-[0_2px_0_#a9565d] transition-all"
                    >
                        Опубликовать
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
