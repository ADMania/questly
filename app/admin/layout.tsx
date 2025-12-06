import Link from 'next/link';
import { ReactNode } from 'react';
import AdminNav from './admin-nav';
import BackgroundGrid from '@/components/BackgroundGrid';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex justify-center text-[#3c2415] p-6 lg:p-10 gap-6 lg:gap-10">
            <BackgroundGrid />

            {/* Sidebar (Floating) */}
            <aside className="hidden md:flex w-64 flex-col shrink-0 sticky top-10 h-[calc(100vh-5rem)]">
                <div className="flex flex-col h-full rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] shadow-[0_8px_0_#d2a06f,0_15px_20px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="p-6 border-b-2 border-[#eaddcf] bg-[#fffdf5] text-center">
                        <h1 className="text-2xl font-extrabold text-[#d26d75] tracking-tight" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
                            Questly Admin
                        </h1>
                        <p className="text-xs text-[#8c6b54] font-medium mt-1 uppercase tracking-widest">Control Panel</p>
                    </div>

                    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                        <AdminNav />
                    </div>

                    <div className="p-4 border-t-2 border-[#eaddcf] bg-[#fffdf5]">
                        <Link href="/" className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#eaddcf] text-[#5e4632] font-bold shadow-[0_3px_0_#c4b5a3] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c4b5a3] hover:bg-[#dccaae] transition-all duration-200 text-sm">
                            ← На сайт
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 max-w-5xl">
                <div className="animate-fadeIn pb-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
