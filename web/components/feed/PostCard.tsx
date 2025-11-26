"use client";

import { useState } from "react";
import AdventureCard from "@/components/cards/AdventureCard";
import { motion } from "framer-motion";

type FeedDifficulty = "easy" | "medium" | "hard";

export type FeedPost = {
    id: number | string;
    title: string;
    content: string;
    createdAt: string | null;
    author: {
        username: string;
        avatarUrl: string | null;
    };
    card: {
        quest: string;
        categoryLabel: string;
        categorySlugs: string[];
        difficulty: FeedDifficulty;
        symbolSeed?: string; // Added symbolSeed
    };
};

interface PostCardProps {
    post: FeedPost;
    onDelete?: (id: number | string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    const [votes, setVotes] = useState(0);
    const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

    const handleVote = (type: "up" | "down") => {
        if (userVote === type) {
            // Toggle off
            setUserVote(null);
            setVotes((prev) => (type === "up" ? prev - 1 : prev + 1));
        } else {
            // Switch vote or new vote
            if (userVote === "up") {
                setVotes((prev) => prev - 2); // +1 -> -1
            } else if (userVote === "down") {
                setVotes((prev) => prev + 2); // -1 -> +1
            } else {
                setVotes((prev) => (type === "up" ? prev + 1 : prev - 1));
            }
            setUserVote(type);
        }
    };

    const formatPostDate = (value?: string | null) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const publishedAt = formatPostDate(post.createdAt);

    return (
        <article className="w-full max-w-5xl mx-auto mb-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left Column: Card */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                    <div className="origin-top-left scale-[0.85] sm:scale-100">
                        <AdventureCard
                            quest={{
                                quest: post.card.quest,
                                category: post.card.categoryLabel,
                                difficulty: post.card.difficulty,
                                symbolSeed: post.card.symbolSeed || String(post.id),
                            }}
                            isClosing={false}
                        />
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="flex-1 min-w-0 w-full">
                    {/* Author Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full border-2 border-[#d2a06f] bg-[#f2e3bf] overflow-hidden flex-shrink-0">
                                {post.author.avatarUrl ? (
                                    <img
                                        src={post.author.avatarUrl}
                                        alt={post.author.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#c57758]">
                                        {post.author.username.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#3c2415]">{post.author.username}</h3>
                                {publishedAt && <p className="text-sm text-[#5e4632]/70">{publishedAt}</p>}
                            </div>
                        </div>

                        {onDelete && (
                            <button
                                onClick={() => onDelete(post.id)}
                                className="p-2 rounded-lg text-[#d26d75] hover:bg-[#d26d75]/10 transition-colors"
                                title="Удалить пост"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Post Content (Comment) */}
                    <div className="relative rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063]">
                        {/* Speech bubble tail */}
                        <div className="absolute top-6 -left-[18px] w-0 h-0 border-t-[10px] border-t-transparent border-r-[18px] border-r-[#d2a06f] border-b-[10px] border-b-transparent hidden lg:block" />
                        <div className="absolute top-6 -left-[15px] w-0 h-0 border-t-[7px] border-t-transparent border-r-[15px] border-r-[#fff9eb] border-b-[7px] border-b-transparent hidden lg:block" />

                        <h2 className="text-xl font-extrabold text-[#d26d75] mb-3">{post.title}</h2>
                        <p className="text-[#5e4632] leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>

                    {/* Actions & Comments Placeholder */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Voting */}
                        <div className="flex items-center gap-2 rounded-xl border-2 border-[#d2a06f]/50 bg-white/60 p-1.5">
                            <button
                                onClick={() => handleVote("up")}
                                className={`p-2 rounded-lg transition-all ${userVote === "up"
                                    ? "bg-[#8ab58a] text-white shadow-sm"
                                    : "hover:bg-[#8ab58a]/20 text-[#5e4632]"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m18 15-6-6-6 6" />
                                </svg>
                            </button>
                            <span className={`font-bold min-w-[24px] text-center ${userVote === "up" ? "text-[#6a956a]" : userVote === "down" ? "text-[#d06767]" : "text-[#5e4632]"
                                }`}>
                                {votes > 0 ? `+${votes}` : votes}
                            </span>
                            <button
                                onClick={() => handleVote("down")}
                                className={`p-2 rounded-lg transition-all ${userVote === "down"
                                    ? "bg-[#d06767] text-white shadow-sm"
                                    : "hover:bg-[#d06767]/20 text-[#5e4632]"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>
                        </div>

                        {/* Comments Placeholder */}
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="w-full h-12 rounded-xl border-2 border-dashed border-[#d2a06f]/40 bg-[#fff9eb]/50 flex items-center px-4 text-sm text-[#5e4632]/60 cursor-not-allowed">
                                Комментарии пока недоступны...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
