'use client';

import { deleteQuest } from '@/app/actions/quests';

export default function DeleteQuestButton({ id }: { id: number }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Удалить квест?')) {
                    await deleteQuest(id);
                }
            }}
            className="w-full rounded-lg border-2 border-transparent px-3 py-1 text-sm font-semibold text-[#b73d3d] hover:border-[#f5c0c0] hover:bg-[#fff1f1]"
        >
            Удалить
        </button>
    );
}
