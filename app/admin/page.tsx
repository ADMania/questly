import { db } from '@/lib/db';
import { users, posts, cards, questTemplates } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function getCounts() {
    try {
        const [usersCount, postsCount, cardsCount, templatesCount] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(users),
            db.select({ count: sql<number>`count(*)` }).from(posts),
            db.select({ count: sql<number>`count(*)` }).from(cards),
            db.select({ count: sql<number>`count(*)` }).from(questTemplates),
        ]);
        return {
            users: usersCount[0].count,
            posts: postsCount[0].count,
            cards: cardsCount[0].count,
            templates: templatesCount[0].count
        };
    } catch (e) {
        return { users: 0, posts: 0, cards: 0, templates: 0 };
    }
}

export default async function AdminDashboard() {
    const counts = await getCounts();

    return (
        <div>
            <header className="mb-10 text-center">
                <h2 className="text-4xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Панель управления
                </h2>
                <p className="text-lg text-[#5e4632]">Добро пожаловать в центр управления Questly.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Пользователи" count={counts.users} icon="👤" color="bg-blue-100 text-blue-800" />
                <DashboardCard title="Квесты (Cards)" count={counts.cards} icon="🃏" color="bg-orange-100 text-orange-800" />
                <DashboardCard title="Посты" count={counts.posts} icon="📝" color="bg-green-100 text-green-800" />
                <DashboardCard title="Шаблоны квестов" count={counts.templates} icon="📚" color="bg-purple-100 text-purple-800" />
            </div>

            <div className="mt-12 rounded-3xl border-2 border-[#d2a06f] bg-[#fff9eb] p-8 shadow-[0_8px_0_#c99063,0_18px_30px_rgba(0,0,0,0.1)] text-center">
                <h3 className="text-2xl font-bold mb-4 text-[#3c2415]">Быстрые действия</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="/admin/cards" className="px-6 py-3 rounded-xl border-2 border-[#d2a06f] bg-white text-[#5e4632] font-semibold hover:bg-[#f2e3bf] transition shadow-sm">
                        + Создать квест
                    </a>
                    <a href="/admin/fragments" className="px-6 py-3 rounded-xl border-2 border-[#d2a06f] bg-white text-[#5e4632] font-semibold hover:bg-[#f2e3bf] transition shadow-sm">
                        + Добавить шаблон
                    </a>
                </div>
            </div>
        </div>
    );
}

function DashboardCard({ title, count, icon, color }: { title: string, count: number, icon: string, color: string }) {
    return (
        <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] p-6 shadow-[0_4px_0_#c99063,0_6px_8px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_6px_0_#c99063,0_10px_14px_rgba(0,0,0,0.15)] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{icon}</span>
                {/* <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>Active</span> */}
            </div>
            <h3 className="text-lg font-semibold text-[#5e4632] mb-1">{title}</h3>
            <p className="text-4xl font-extrabold text-[#d26d75]">{count}</p>
        </div>
    );
}
