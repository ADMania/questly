"use client";

import { useMemo, useState } from "react";
import BackgroundGrid from "@/components/BackgroundGrid";
import PostCard, { FeedPost } from "@/components/feed/PostCard";

const filters = [
    { key: "all", label: "Все" },
    { key: "day", label: "Дневные" },
    { key: "night", label: "Ночные" },
    { key: "creative", label: "Творчество" },
    { key: "social", label: "Социальные" },
    { key: "home", label: "Дом" },
];

export default function FeedClient({ initialPosts }: { initialPosts: FeedPost[] }) {
    const [active, setActive] = useState<string>("all");
    const posts = initialPosts;

    const visiblePosts = useMemo(() => {
        if (active === "all") return posts;
        return posts.filter((post) => post.card.categorySlugs.includes(active));
    }, [posts, active]);

    return (
        <main className="relative min-h-screen flex flex-col items-center text-[#3c2415] px-6 pb-16 overflow-hidden">
            <BackgroundGrid />

            <section className="relative z-10 w-full max-w-6xl pt-8 md:pt-12">
                <header className="mb-8 text-center">
                    <h1
                        className="text-4xl md:text-5xl font-extrabold"
                        style={{ color: "#d26d75", textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
                    >
                        Лента приключений
                    </h1>
                    <p className="mt-2 text-[#5e4632] max-w-2xl mx-auto">
                        Делимся историями участников, которые прошли задания из коллекции Questly.
                    </p>
                </header>

                <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible justify-start md:justify-center gap-3 mb-10 pb-4 md:pb-0 px-2 md:px-0 scrollbar-hide">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActive(filter.key)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 border-[#d2a06f] bg-[#fff9eb] text-sm md:text-base font-medium transition-all duration-200 shadow-[0_3px_0_#c99063,0_4px_6px_rgba(0,0,0,0.15)]
              ${active === filter.key ? "scale-105 bg-[#f2e3bf]" : "opacity-85 hover:opacity-100 hover:-translate-y-0.5"}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {visiblePosts.length > 0 ? (
                    <div className="space-y-4">
                        {visiblePosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/70 bg-[#fff9eb]/70 px-6 py-10 text-center text-[#5e4632]/80 max-w-2xl mx-auto">
                        Пока нет постов в этой категории. Станьте первым и поделитесь своим приключением!
                    </div>
                )}
            </section>
        </main>
    );
}
