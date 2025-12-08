"use client";

import { useMemo, useState, useTransition } from "react";
import type { MediaFile } from "@/lib/media";
import { deleteMediaFile } from "@/app/actions/media";

export default function MediaManager({ files }: { files: MediaFile[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byFolder: Record<string, MediaFile[]> = {};
    files.forEach((file) => {
      const folder = file.relativePath.includes("/")
        ? file.relativePath.split("/").slice(0, -1).join("/")
        : "Корень";
      byFolder[folder] = byFolder[folder] || [];
      byFolder[folder].push(file);
    });
    return Object.entries(byFolder).sort(([a], [b]) => a.localeCompare(b));
  }, [files]);

  const handleDelete = (path: string) => {
    if (!confirm("Удалить файл?")) return;
    startTransition(async () => {
      const result = await deleteMediaFile(path);
      if (result?.error) {
        setMessage(result.error);
      } else {
        setSelected(null);
        setMessage("Файл удалён. Перезагрузите страницу, чтобы увидеть изменения.");
      }
    });
  };

  if (!files?.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d2a06f]/60 bg-[#fffaf1] p-8 text-center text-[#8c6b54]">
        В библиотеке пока нет файлов.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([folder, folderFiles]) => (
        <div key={folder} className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-5 shadow-[0_4px_0_#c99063]">
          <h3 className="text-lg font-bold text-[#d26d75] mb-4">{folder}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folderFiles.map((file) => (
              <article
                key={file.id}
                className={`rounded-xl border-2 p-4 transition shadow-inner shadow-[#f3ead9] ${selected === file.id ? "border-[#d26d75]" : "border-[#d2a06f]/50"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#3c2415]">{file.name}</p>
                    <p className="text-xs text-[#8c6b54]">{formatSize(file.size)}</p>
                    <p className="text-xs text-[#8c6b54]">
                      {new Date(file.modifiedAt).toLocaleString()}
                    </p>
                  </div>
                  {file.name.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                    <img
                      src={`/uploads/${file.relativePath}`}
                      alt={file.name}
                      className="w-16 h-16 rounded-lg object-cover border border-[#eaddcf]"
                    />
                  ) : (
                    <span className="text-3xl" aria-hidden>
                      📄
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`/uploads/${file.relativePath}`);
                      setSelected(file.id);
                      setMessage("Путь скопирован");
                    }}
                    className="flex-1 rounded-xl border-2 border-[#d2a06f] bg-white px-3 py-2 text-sm font-semibold text-[#5e4632]"
                  >
                    Скопировать путь
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.relativePath)}
                    disabled={pending}
                    className="rounded-xl border-2 border-transparent bg-[#ffe5e5] px-3 py-2 text-sm font-semibold text-[#b73d3d] hover:border-[#f5c0c0] disabled:opacity-60"
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
      {message && <p className="text-sm text-[#5e4632] font-medium">{message}</p>}
    </div>
  );
}

const formatSize = (size: number) => {
  if (size > 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
  if (size > 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${size} Б`;
};
