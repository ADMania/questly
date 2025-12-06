'use client';

import { createUser } from '@/app/actions/users';
import { useRef } from 'react';

export default function UserCreateForm() {
    const formRef = useRef<HTMLFormElement>(null);

    async function clientAction(formData: FormData) {
        const result = await createUser(formData);
        if (result?.success) {
            formRef.current?.reset();
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">Добавить пользователя</h3>
            <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                        type="text"
                        name="username"
                        required
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#d2a06f] outline-none"
                    />
                </div>
                <div className="md:col-span-3">
                    <button
                        type="submit"
                        className="bg-[#d2a06f] text-white px-6 py-2 rounded hover:bg-[#b8865c] transition font-medium"
                    >
                        Создать
                    </button>
                </div>
            </form>
        </div>
    );
}
