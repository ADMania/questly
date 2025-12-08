"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/quests", label: "Квесты" },
    { href: "/admin/cards", label: "Карточки" },
    { href: "/admin/posts", label: "Посты" },
    { href: "/admin/users", label: "Пользователи" },
    { href: "/admin/media", label: "Медиа" },
    { href: "/admin/feedbacks", label: "Обратная связь" },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex-1 px-4 space-y-3 py-6">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm
              ${isActive
                                ? "bg-[#d26d75] text-[#fff9eb] shadow-[0_2px_0_#a9565d] translate-y-[1px]"
                                : "text-[#5e4632] hover:bg-[#eaddcf] hover:text-[#3c2415]"
                            }
            `}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
