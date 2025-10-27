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
  name: "",
  email: "",
  password: "",
  confirm: "",
};

const inputClasses =
  "w-full rounded-xl border-2 border-[#d2a06f] bg-white/90 px-4 py-3 text-base shadow-[0_3px_0_#c99063] outline-none transition focus:-translate-y-0.5 focus:shadow-[0_5px_0_#c99063] placeholder:text-[#9b7b5c]";

export default function RegisterPage() {
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

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setMessage({ type: "error", text: "Заполните все поля, чтобы продолжить." });
      return;
    }

    if (form.password !== form.confirm) {
      setMessage({ type: "error", text: "Пароли не совпадают." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || "Ошибка регистрации. Попробуйте позже.";
        throw new Error(errorMsg);
      }

      // Сохраняем токен, если нужно
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("questly-auth-change"));

      setMessage({ type: "success", text: `Добро пожаловать, ${data.user.username}!` });

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
                Присоединяйтесь к приключению
              </span>
              <h1 className="text-4xl font-extrabold leading-snug text-[#d26d75]" style={{ textShadow: "0 3px 6px rgba(0,0,0,0.18)" }}>
                Создайте аккаунт в Questly
              </h1>
              <p className="text-[#5e4632] text-lg">
                Подбирайте личные квесты, выходите из привычной рутины и коллекционируйте впечатления. Регистрация займет всего пару минут.
              </p>
              <ul className="space-y-3 text-[#5e4632]">
                {[
                  "Получайте персональные подборки квестов под настроение.",
                  "Коллекционируйте выполненные задания и отмечайте ключевые моменты.",
                  "Ведите заметки о впечатлениях, чтобы возвращаться к любимым прогулкам.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#d2a06f] bg-white text-sm font-semibold text-[#d26d75] shadow-[0_2px_0_#c99063]">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto rounded-2xl border-2 border-dashed border-[#d2a06f]/70 bg-white/70 p-5 text-sm text-[#5e4632]">
                Уже зарегистрированы?{" "}
                <Link href="/login" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                  Войдите в аккаунт.
                </Link>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3 border-b-2 border-[#d2a06f] p-8 md:p-12">
              <div className="mx-auto w-full max-w-lg">
                <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-[#d26d75]" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
                    Регистрация
                  </h2>
                  <p className="mt-2 text-sm text-[#5e4632]/80">
                    Заполните данные, и мы подготовим ваш портал героя. Все поля обязательны.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold uppercase tracking-wide text-[#5e4632]">
                      Имя (никнейм)
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange("name")}
                      className={inputClasses}
                      placeholder="Например, Иванов Иван, либо vancho"
                    />
                  </div>

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
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange("password")}
                      className={inputClasses}
                      placeholder="Минимум 8 символов"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm" className="block text-sm font-semibold uppercase tracking-wide text-[#5e4632]">
                      Подтверждение пароля
                    </label>
                    <input
                      id="confirm"
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      value={form.confirm}
                      onChange={handleChange("confirm")}
                      className={inputClasses}
                      placeholder="Повторите пароль"
                    />
                  </div>

                  <div className="rounded-2xl border-2 border-[#d2a06f]/60 bg-white/80 p-4 text-xs text-[#5e4632]/80">
                    Регистрируясь, вы соглашаетесь с нашей{" "}
                    <Link href="/legal/terms" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                      политикой использования
                    </Link>{" "}
                    и{" "}
                    <Link href="/legal/privacy" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                      политикой конфиденциальности
                    </Link>
                    .
                  </div>

                  {message && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className={`rounded-2xl border-2 px-4 py-3 text-sm font-medium shadow-[0_3px_0_#c99063] ${
                        message.type === "success"
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
                    {isLoading ? "Подготавливаем портал..." : "Создать аккаунт"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#5e4632]/80 lg:text-left">
                  Уже есть аккаунт?{" "}
                  <Link href="/login" className="font-semibold text-[#d26d75] underline-offset-4 hover:underline">
                    Войти
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
