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
            className="w-full rounded-lg border-2 border-transparent px-3 py-1 text-sm font-semibold text-[#b73d3d] hover:border-[#f5c0c0] hover:bg-[#fff1f1]"
        >
            Удалить
        </button>
    );
}
