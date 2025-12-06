import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f8f5f2] text-[#3c2415] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#3c2415] text-[#f2e3bf] flex flex-col fixed h-full">
                <div className="p-6 border-b border-[#5e4632]">
                    <h1 className="text-2xl font-bold">Questly Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="block px-4 py-2 rounded hover:bg-[#5e4632] transition">
                        Dashboard
                    </Link>
                    <Link href="/admin/categories" className="block px-4 py-2 rounded hover:bg-[#5e4632] transition">
                        Категории
                    </Link>
                    <Link href="/admin/cards" className="block px-4 py-2 rounded hover:bg-[#5e4632] transition">
                        Карточки (Quests)
                    </Link>
                    <Link href="/admin/posts" className="block px-4 py-2 rounded hover:bg-[#5e4632] transition">
                        Посты
                    </Link>
                    <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-[#5e4632] transition">
                        Пользователи
                    </Link>
                </nav>
                <div className="p-4 border-t border-[#5e4632]">
                    <Link href="/" className="block px-4 py-2 rounded bg-[#d26d75] text-white text-center hover:bg-[#b54e56] transition">
                        Вернуться на сайт
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
