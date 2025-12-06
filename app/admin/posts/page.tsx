import { getAdminPosts } from '@/app/actions/posts';
import { getCards } from '@/app/actions/cards';
import { getUsers } from '@/app/actions/users';
import PostCreateForm from './create-form';
import DeletePostButton from './delete-button';

export default async function AdminPostsPage() {
    const [posts, cards, users] = await Promise.all([
        getAdminPosts(),
        getCards(),
        getUsers(),
    ]);

    const cardOptions = cards.map(c => ({ id: c.id, label: `${c.questText.slice(0, 30)}... (${c.slug})` }));
    const userOptions = users.map(u => ({ id: u.id, label: u.username }));

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Управление постами
                </h2>
                <p className="text-[#5e4632]">Модерируйте контент, созданный пользователями.</p>
            </header>

            <PostCreateForm authors={userOptions} cards={cardOptions} />

            <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Заголовок</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Автор</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Квест</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaddcf]">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-[#fffdf5] transition-colors">
                                <td className="p-4 text-[#8c6b54] font-mono text-sm">#{post.id}</td>
                                <td className="p-4 font-medium text-[#3c2415]">{post.title}</td>
                                <td className="p-4 text-sm font-semibold text-[#5e4632]">{post.author?.username}</td>
                                <td className="p-4 text-sm text-[#8c6b54] font-mono">
                                    {post.attachedCard?.slug || '—'}
                                </td>
                                <td className="p-4">
                                    <DeletePostButton id={post.id} />
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-[#8c6b54]">Постов нет.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
