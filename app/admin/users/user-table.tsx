"use client";

import { useState, useTransition } from "react";
import DeleteUserButton from "./delete-button";
import { updateUser } from "@/app/actions/users";

type AdminUser = {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean | number;
};

export default function UserTable({ users }: { users: AdminUser[] }) {
  if (!users?.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/60 bg-[#fffaf1] p-8 text-center text-[#8c6b54]">
        Пользователей пока нет.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
          <tr>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Имя</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Email</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Роль</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eaddcf]">
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    password: "",
    isAdmin: Boolean(user.isAdmin),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = {
        id: user.id,
        username: form.username,
        email: form.email,
        isAdmin: form.isAdmin,
        password: form.password.trim() ? form.password.trim() : undefined,
      };
      const result = await updateUser(payload);
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
        <td className="p-4 text-[#8c6b54] font-mono text-sm">#{user.id}</td>
        <td className="p-4 font-medium text-[#3c2415]">{user.username}</td>
        <td className="p-4 text-sm text-[#5e4632]">{user.email}</td>
        <td className="p-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${form.isAdmin ? "bg-[#fde7e5] text-[#b73d3d]" : "bg-[#e5f2ff] text-[#28568f]"}`}>
            {form.isAdmin ? "Админ" : "Пользователь"}
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
          <DeleteUserButton id={user.id} />
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={5} className="bg-[#fffdf5] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Имя пользователя
                <input
                  type="text"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#5e4632]">
                Новый пароль (опционально)
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="rounded-xl border-2 border-[#d2a06f] bg-white px-4 py-3 text-sm"
                  placeholder="Оставьте пустым, чтобы не менять"
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-[#5e4632]">
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(event) => setForm((prev) => ({ ...prev, isAdmin: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#d2a06f]"
                />
                Администратор
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
                    username: user.username,
                    email: user.email,
                    password: "",
                    isAdmin: Boolean(user.isAdmin),
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
