'use client';

import { deleteFragment } from '@/app/actions/fragments';

export default function DeleteFragmentButton({ id, type }: { id: number, type: string }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Удалить фрагмент?')) {
                    await deleteFragment(id, type);
                }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            Удалить
        </button>
    );
}
