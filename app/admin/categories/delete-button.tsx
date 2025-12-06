'use client';

import { deleteCategory } from '@/app/actions/categories';

export default function DeleteCategoryButton({ id }: { id: number }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Вы уверены?')) {
                    await deleteCategory(id);
                }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            Удалить
        </button>
    );
}
