"use client";

// TODO: Настроить вёрстку под телефоны

import { useState } from "react";
import AdventureCard from "@/components/cards/AdventureCard";
import { motion } from "framer-motion";

type FeedDifficulty = "easy" | "medium" | "hard";

export type FeedPost = {
    id: number | string;
    documentId?: string;
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
        symbolSeed?: string;
    };
    votes: number;
    userVote?: "up" | "down" | null;
};

interface PostCardProps {
    post: FeedPost;
    onDelete?: (id: number | string) => void;
    readOnly?: boolean;
}

export default function PostCard({ post, onDelete, readOnly = false }: PostCardProps) {
    const [votes, setVotes] = useState(parseInt(String(post.votes || 0)));
    const [userVote, setUserVote] = useState<"up" | "down" | null>(post.userVote || null);
    const [isVoting, setIsVoting] = useState(false);

    // Comments state
    const [comments, setComments] = useState<any[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleVote = async (type: "up" | "down") => {
        if (readOnly || isVoting) return;

        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            alert("Войдите, чтобы голосовать");
            return;
        }

        setIsVoting(true);

        // Optimistic update
        const previousVotes = votes;
        const previousUserVote = userVote;

        let newVotes = votes;
        let newUserVote = userVote;

        if (userVote === type) {
            // Cancel vote
            newUserVote = null;
            newVotes = type === "up" ? votes - 1 : votes + 1;
        } else {
            // Change or new vote
            if (userVote === "up") {
                newVotes = votes - 2;
            } else if (userVote === "down") {
                newVotes = votes + 2;
            } else {
                newVotes = type === "up" ? votes + 1 : votes - 1;
            }
            newUserVote = type;
        }

        setVotes(newVotes);
        setUserVote(newUserVote);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${post.id}/vote`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({ type }),
            });

            if (!res.ok) {
                throw new Error("Vote failed");
            }

            const data = await res.json();
            if (data.votes !== undefined) {
                setVotes(parseInt(data.votes));
            }
        } catch (error) {
            console.error("Vote error:", error);
            setVotes(previousVotes);
            setUserVote(previousUserVote);
        } finally {
            setIsVoting(false);
        }
    };

    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            // Use documentId if available, otherwise fallback to id
            const identifier = post.documentId || post.id;
            const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments/post/${identifier}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log("[PostCard] Comments data:", data);
            if (data.data) {
                console.log("[PostCard] First comment:", data.data[0]);
                setComments(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const toggleComments = () => {
        if (!showComments) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsPostingComment(true);
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                alert("Пожалуйста, войдите, чтобы оставить комментарий.");
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: {
                        content: commentText,
                        post: post.id,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to post comment");
            }

            const newComment = await response.json();

            // Refresh comments
            fetchComments();
            setCommentText("");
        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Не удалось отправить комментарий.");
        } finally {
            setIsPostingComment(false);
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

                    {/* Post Content */}
                    <div className="relative rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063]">
                        <div className="absolute top-6 -left-[18px] w-0 h-0 border-t-[10px] border-t-transparent border-r-[18px] border-r-[#d2a06f] border-b-[10px] border-b-transparent hidden lg:block" />
                        <div className="absolute top-6 -left-[15px] w-0 h-0 border-t-[7px] border-t-transparent border-r-[15px] border-r-[#fff9eb] border-b-[7px] border-b-transparent hidden lg:block" />

                        <h2 className="text-xl font-extrabold text-[#d26d75] mb-3">{post.title}</h2>
                        <p className="text-[#5e4632] leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>

                    {/* Actions & Comments */}
                    <div className="mt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Voting */}
                            <div className={`flex items-center gap-2 rounded-xl border-2 border-[#d2a06f]/50 bg-white/60 p-1.5 ${readOnly ? 'opacity-80' : ''}`}>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleVote("up")}
                                        disabled={isVoting}
                                        className={`p-2 rounded-lg transition-all ${userVote === "up"
                                            ? "bg-[#8ab58a] text-white shadow-sm"
                                            : "hover:bg-[#8ab58a]/20 text-[#5e4632]"
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m18 15-6-6-6 6" />
                                        </svg>
                                    </button>
                                )}
                                <span className={`font-bold min-w-[24px] text-center px-2 ${userVote === "up" ? "text-[#6a956a]" : userVote === "down" ? "text-[#d06767]" : "text-[#5e4632]"
                                    }`}>
                                    {votes > 0 ? `+${votes}` : votes}
                                </span>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleVote("down")}
                                        disabled={isVoting}
                                        className={`p-2 rounded-lg transition-all ${userVote === "down"
                                            ? "bg-[#d06767] text-white shadow-sm"
                                            : "hover:bg-[#d06767]/20 text-[#5e4632]"
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Comments Toggle */}
                            <button
                                onClick={toggleComments}
                                className="flex-1 w-full sm:w-auto h-12 rounded-xl border-2 border-[#d2a06f]/40 bg-[#fff9eb]/50 hover:bg-[#fff9eb] hover:border-[#d2a06f] transition-all flex items-center justify-center px-4 text-sm font-semibold text-[#5e4632]"
                            >
                                {showComments ? "Скрыть комментарии" : "Показать комментарии"}
                            </button>
                        </div>

                        {/* Comments Section */}
                        {showComments && (
                            <div className="mt-6 space-y-6 pl-2 sm:pl-0">
                                {/* Comment Form */}
                                <form onSubmit={handlePostComment} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Написать комментарий..."
                                        className="flex-1 rounded-xl border-2 border-[#d2a06f]/30 bg-white/80 px-4 py-2.5 text-sm text-[#3c2415] placeholder:text-[#5e4632]/40 focus:border-[#d2a06f] focus:outline-none focus:ring-0"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPostingComment || !commentText.trim()}
                                        className="rounded-xl bg-[#d2a06f] px-4 py-2.5 font-bold text-white transition hover:bg-[#c59060] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPostingComment ? "..." : "➤"}
                                    </button>
                                </form>

                                {/* Comments List */}
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {isLoadingComments ? (
                                        <div className="text-center text-sm text-[#5e4632]/60 py-4">Загрузка комментариев...</div>
                                    ) : comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="relative bg-[#fff9eb] rounded-xl p-4 border-2 border-[#d2a06f]/20 shadow-sm hover:border-[#d2a06f]/40 transition-colors">
                                                <div className="absolute top-3 left-0 w-1 h-full rounded-r-full" />

                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded-full border border-[#d2a06f] bg-[#f2e3bf] overflow-hidden flex-shrink-0">
                                                        {comment.author?.avatar?.url ? (
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${comment.author.avatar.url}`}
                                                                alt={comment.author.username}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#c57758]">
                                                                {comment.author?.username?.slice(0, 1).toUpperCase() ?? "?"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-xs text-[#3c2415]">
                                                        {comment.author?.username || "Неизвестный путник"}
                                                    </span>
                                                </div>

                                                <p className="text-[#5e4632] text-sm leading-relaxed pl-2">{comment.content}</p>
                                                <div className="mt-2 text-[10px] uppercase tracking-wider font-bold text-[#d2a06f] text-right">
                                                    {new Date(comment.createdAt).toLocaleDateString("ru-RU", {
                                                        day: "numeric",
                                                        month: "long",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-[#5e4632]/40 py-4 italic bg-[#fff9eb]/30 rounded-xl border border-dashed border-[#d2a06f]/20">
                                            Тишина... Будьте первым, кто нарушит её!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
