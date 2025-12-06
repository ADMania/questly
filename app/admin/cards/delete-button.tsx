'use client';

import { deleteCard } from '@/app/actions/cards';

export default function DeleteCardButton({ id }: { id: number }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Вы уверены? Это действие нельзя отменить.')) {
                    await deleteCard(id);
                }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            Удалить
        </button>
    );
}
