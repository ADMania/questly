'use client';

import { createCategory } from '@/app/actions/categories';
import { useRef } from 'react';

export default function CategoryCreateForm() {
    const formRef = useRef<HTMLFormElement>(null);

    async function clientAction(formData: FormData) {
        const result = await createCategory(formData);
        if (result?.success) {
            formRef.current?.reset();
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">Добавить категорию</h3>
            <form ref={formRef} action={clientAction} className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Название</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Например: Творчество"
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                    <input
                        type="text"
                        name="slug"
                        required
                        placeholder="creative"
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-[#d2a06f] text-white px-6 py-2 rounded hover:bg-[#b8865c] transition font-medium"
                >
                    Создать
                </button>
            </form>
        </div>
    );
}
