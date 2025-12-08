'use client';

import { deleteFragment } from '@/app/actions/fragments';

export default function DeleteFragmentButton({ id }: { id: number }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Удалить квест?')) {
                    await deleteFragment(id);
                }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            Удалить
        </button>
    );
}
