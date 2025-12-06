'use client';

import { createPost } from '@/app/actions/posts';
import { useRef } from 'react';

type Option = { id: number; label: string };

export default function PostCreateForm({ authors, cards }: { authors: Option[]; cards: Option[] }) {
    const formRef = useRef<HTMLFormElement>(null);

    async function clientAction(formData: FormData) {
        const result = await createPost(formData);
        if (result?.success) {
            formRef.current?.reset();
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">Создать пост</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Заголовок</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Содержание</label>
                    <textarea
                        name="content"
                        required
                        rows={4}
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Автор</label>
                    <select name="authorId" required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none">
                        <option value="">Выберите автора...</option>
                        {authors.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Квест (Карточка)</label>
                    <select name="cardId" required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none">
                        <option value="">Выберите квест...</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="bg-[#d2a06f] text-white px-6 py-2 rounded hover:bg-[#b8865c] transition font-medium"
                    >
                        Опубликовать
                    </button>
                </div>
            </form>
        </div>
    );
}
