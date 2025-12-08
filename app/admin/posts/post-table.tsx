"use client";

import { useState, useTransition } from "react";
import DeletePostButton from "./delete-button";
import { updatePost } from "@/app/actions/posts";

type Option = { id: number; label: string };

type AdminPost = {
  id: number;
  title: string;
  content: string;
  isPublic: boolean;
  authorId: number | null;
  cardId: number | null;
  author?: { username?: string };
  attachedCard?: { slug?: string };
};

export default function PostTable({
  posts,
  authors,
  cards,
}: {
  posts: AdminPost[];
  authors: Option[];
  cards: Option[];
}) {
  if (!posts?.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/60 bg-[#fffaf1] p-8 text-center text-[#8c6b54]">
        Постов нет.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
          <tr>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Заголовок</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Автор</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Квест</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Статус</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eaddcf]">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} authors={authors} cards={cards} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PostRow({ post, authors, cards }: { post: AdminPost; authors: Option[]; cards: Option[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: post.title,
    content: post.content,
    authorId: post.authorId ? String(post.authorId) : "",
    cardId: post.cardId ? String(post.cardId) : "",
    isPublic: post.isPublic,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updatePost({
        id: post.id,
        title: form.title,
        content: form.content,
        authorId: Number(form.authorId),
        cardId: form.cardId ? Number(form.cardId) : null,
        isPublic: form.isPublic,
      });
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage("Сохранено");
        setIsEditing(false);
      }
    });
  };

  return (
    <>
      <tr className="hover:bg-[#fffdf5] transition-colors">
        <td className="p-4 text-[#8c6b54] font-mono text-sm">#{post.id}</td>
        <td className="p-4 font-medium text-[#3c2415]">{post.title}</td>
        <td className="p-4 text-sm text-[#5e4632]">{post.author?.username || "—"}</td>
        <td className="p-4 text-sm text-[#8c6b54] font-mono">{post.attachedCard?.slug || "—"}</td>
        <td className="p-4">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${post.isPublic ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-800"}`}>
            {post.isPublic ? "Публичный" : "Черновик"}
          </span>
        </td>
        <td className="p-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setMessage(null);
            }}
            className="w-full rounded-lg border-2 border-[#d2a06f] bg-white px-3 py-1 text-sm font-semibold text-[#5e4632] hover:bg-[#fbeed2]"
          >
            {isEditing ? "Скрыть" : "Редактировать"}
          </button>
          <DeletePostButton id={post.id} />
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={6} className="bg-[#fffdf5] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632] md:col-span-2">
                Заголовок
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632] md:col-span-2">
                Содержимое
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  rows={4}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Автор
                <select
                  value={form.authorId}
                  onChange={(event) => setForm((prev) => ({ ...prev, authorId: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                >
                  <option value="">—</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Карточка
                <select
                  value={form.cardId}
                  onChange={(event) => setForm((prev) => ({ ...prev, cardId: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                >
                  <option value="">Без карточки</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-[#5e4632] md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(event) => setForm((prev) => ({ ...prev, isPublic: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#d2a06f]"
                />
                Публично в ленте
              </label>
            </div>
            {message && (
              <p className="mt-4 text-sm text-[#5e4632] font-medium">{message}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-xl border-2 border-[#d2a06f] bg-[#d26d75] px-5 py-2 text-sm font-semibold text-[#fff9eb] shadow-[0_3px_0_#a9565d] disabled:opacity-60"
              >
                {isPending ? "Сохраняем..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    title: post.title,
                    content: post.content,
                    authorId: post.authorId ? String(post.authorId) : "",
                    cardId: post.cardId ? String(post.cardId) : "",
                    isPublic: post.isPublic,
                  });
                }}
                className="rounded-xl border-2 border-[#d2a06f] bg-white px-5 py-2 text-sm font-semibold text-[#5e4632]"
              >
                Отмена
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
