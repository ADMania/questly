import { listMediaFiles } from '@/lib/media';
import MediaManager from './media-manager';

export default async function AdminMediaPage() {
    const files = await listMediaFiles();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Медиафайлы
                </h2>
                <p className="text-[#5e4632]">Просматривайте загруженные изображения и очищайте хранилище от лишних файлов.</p>
            </header>

            <MediaManager files={files} />
        </div>
    );
}
