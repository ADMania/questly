'use client';

import { deletePost } from '@/app/actions/posts';

export default function DeletePostButton({ id }: { id: number }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Удалить пост?')) {
                    await deletePost(id);
                }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            Удалить
        </button>
    );
}
