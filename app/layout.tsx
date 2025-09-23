import "../styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Questly",
  icons: {
    icon: "/favicon.png",
  },
  description: "Генератор случайных приключений",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900">
        {/* Плавающий островок-хедер */}
        <header className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <nav className="flex items-center gap-12 px-10 py-3 rounded-full bg-white/60 backdrop-blur-md shadow-md">
            <Link
              href="/"
              className="text-lg font-medium text-gray-600 hover:text-[#FF91A4] transition-colors"
            >
              Главная
            </Link>
            <Link
              href="/about"
              className="text-lg font-medium text-gray-600 hover:text-[#A3D5FF] transition-colors text-center"
            >
              О проекте
            </Link>
          </nav>
        </header>

        {/* Контент */}
        <main>{children}</main>
      </body>
    </html>
  );
}
