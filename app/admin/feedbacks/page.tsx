import { type FeedbackStatus, getFeedbacks } from "@/app/actions/feedbacks";
import FeedbackStatusControl from "./status-control";

const typeLabels: Record<string, string> = {
  bug: "Ошибка",
  suggestion: "Идея",
  other: "Другое",
};

const statusStyles: Record<string, string> = {
  new: "border-[#facc15] bg-[#fff8d1] text-[#7c6000]",
  in_progress: "border-[#60a5fa] bg-[#e0f0ff] text-[#1d4ed8]",
  resolved: "border-[#77c97e] bg-[#e3f8e7] text-[#2f7a3b]",
};

export default async function AdminFeedbacksPage() {
  const items = await getFeedbacks();

  return (
    <div>
      <header className="mb-8">
        <h2
          className="text-3xl font-extrabold text-[#d26d75] mb-2"
          style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}
        >
          Обратная связь
        </h2>
        <p className="text-[#5e4632]">
          Все сообщения пользователей из приложения и страницы ошибок.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/60 bg-[#fffaf1] p-8 text-center text-[#8c6b54]">
          Сообщений пока нет.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-5 shadow-[0_4px_0_#c99063]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span
                      className={`inline-flex items-center rounded-full border-2 px-3 py-1 ${statusStyles[item.status] ?? "border-[#d2a06f] text-[#5e4632]"}`}
                    >
                      {item.type ? typeLabels[item.type] ?? item.type : "Неизвестно"}
                    </span>
                    {item.pageContext && (
                      <span className="rounded-full border px-3 py-1 text-xs text-[#5e4632] bg-white">
                        {item.pageContext}
                      </span>
                    )}
                    <span className="text-xs text-[#8c6b54]">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#3c2415] whitespace-pre-line">
                    {item.message}
                  </p>
                  <div className="text-sm text-[#5e4632]/80 space-y-1">
                    {item.userName && <p>От: {item.userName}</p>}
                    {item.userEmail && (
                      <p>
                        Email:{" "}
                        <a
                          href={`mailto:${item.userEmail}`}
                          className="text-[#d26d75] underline"
                        >
                          {item.userEmail}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                <FeedbackStatusControl
                  id={item.id}
                  initialStatus={item.status as FeedbackStatus}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
