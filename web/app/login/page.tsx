"use client";

import Link from "next/link";
import { FormEvent, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import BackgroundGrid from "@/components/BackgroundGrid";

type MessageState = {
  type: "success" | "error" | "info";
  text: string;
};

const initialForm = {
  email: "",
  password: "",
};

const inputClasses =
  "w-full rounded-xl border-2 border-[#d2a06f] bg-white/90 px-4 py-3 text-base shadow-[0_3px_0_#c99063] outline-none transition focus:-translate-y-0.5 focus:shadow-[0_5px_0_#c99063] placeholder:text-[#9b7b5c]";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  const handleChange = (field: keyof typeof initialForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Введите email и пароль." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || "Не удалось войти. Повторите попытку.";
        throw new Error(errorMsg);
      }

      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("questly-auth-change"));

      setMessage({
        type: "success",
        text: `С возвращением, ${data.user.username}!`,
      });

      router.push("/profile");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-12 text-[#3c2415]">
      <BackgroundGrid />

      <section className="relative z-10 w-full max-w-6xl">
        <div className="w-full rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb]/95 shadow-[0_6px_0_#c99063,0_14px_24px_rgba(0,0,0,0.18)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="relative col-span-2 hidden lg:flex flex-col gap-6 border-b-2 border-r-2 border-[#d2a06f] bg-[#fdf3dd] p-10">
              <span className="inline-flex items-center gap-2 w-fit rounded-full border-2 border-[#d2a06f] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#d26d75] shadow-[0_3px_0_#c99063]">
                Добро пожаловать обратно
              </span>
              <h1 className="text-4xl font-extrabold leading-snug text-[#d26d75]" style={{ textShadow: "0 3px 6px rgba(0,0,0,0.18)" }}>
                Продолжайте свою коллекцию квестов
              </h1>
              <p className="text-[#5e4632] text-lg">
                Возвращайтесь к сохраненным маршрутам, отмечайте новые впечатления и отслеживайте прогресс по активным заданиям.
              </p>
              <div className="space-y-4 text-[#5e4632]">
                <div className="rounded-2xl border-2 border-[#d2a06f] bg-white/80 p-4 shadow-[0_3px_0_#c99063]">
                  <h2 className="text-lg font-semibold text-[#d26d75]">
                    Новые идеи в одном месте
                  </h2>
                  <p className="mt-1 text-sm">
                    Сформируйте подборку на неделю, ищите вдохновение по тегам и возвращайтесь к любимым маршрутам, как к коллекционным карточкам.
                  </p>
                </div>
                <ul className="space-y-3 text-sm">
                  {[
                    "Сохраняйте выполненные задания и добавляйте заметки о впечатлениях.",
                    "Делитесь подборками с друзьями ссылкой, не создавая общий аккаунт.",
                    "Получайте напоминания о квестах, которые почти завершены.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#d2a06f] bg-white text-sm font-semibold text-[#d26d75] shadow-[0_2px_0_#c99063]">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto rounded-2xl border-2 border-dashed border-[#d2a06f]/70 bg-white/70 p-5 text-sm text-[#5e4632]">
                Еще нет аккаунта?{" "}
                <Link href="/register" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                  Зарегистрируйтесь за минуту.
                </Link>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3 border-b-2 border-[#d2a06f] p-6 md:p-12">
              <div className="mx-auto w-full max-w-lg">
                <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-[#d26d75]" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
                    Вход
                  </h2>
                  <p className="mt-2 text-sm text-[#5e4632]/80">
                    Используйте электронную почту и пароль, указанные при регистрации. Все поля обязательны.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-wide text-[#5e4632]">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      className={inputClasses}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-wide text-[#5e4632]">
                      Пароль
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange("password")}
                      className={inputClasses}
                      placeholder="Введите пароль"
                    />
                    <div className="text-right text-xs">
                      <Link href="/restore" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                        Забыли пароль?
                      </Link>
                    </div>
                  </div>

                  {message && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className={`rounded-2xl border-2 px-4 py-3 text-sm font-medium shadow-[0_3px_0_#c99063] ${message.type === "success"
                          ? "border-[#77c97e] bg-[#e3f8e7] text-[#2f7a3b]"
                          : "border-[#e28b82] bg-[#fde7e5] text-[#b73d3d]"
                        }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-2xl border-2 border-[#d2a06f] bg-[#d26d75] px-6 py-3 text-lg font-semibold text-[#fff9eb] shadow-[0_5px_0_#a9565d] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#a9565d] disabled:opacity-70 disabled:hover:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? "Открываем дневник..." : "Войти"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#5e4632]/80 lg:text-left">
                  Впервые в Questly?{" "}
                  <Link href="/register" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                    Создайте аккаунт.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
