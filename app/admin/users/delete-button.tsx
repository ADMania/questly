'use client';

import { deleteUser } from '@/app/actions/users';

export default function DeleteUserButton({ id }: { id: number }) {
    return (
        <button
            onClick={async () => {
                if (confirm('Вы уверены?')) {
                    await deleteUser(id);
                }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
            Удалить
        </button>
    );
}
