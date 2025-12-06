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
            <h2 className="text-3xl font-bold mb-6">Управление постами</h2>

            <PostCreateForm authors={userOptions} cards={cardOptions} />

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f0eadd]">
                        <tr>
                            <th className="p-4 border-b font-semibold">ID</th>
                            <th className="p-4 border-b font-semibold">Заголовок</th>
                            <th className="p-4 border-b font-semibold">Автор</th>
                            <th className="p-4 border-b font-semibold">Квест</th>
                            <th className="p-4 border-b font-semibold">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b text-gray-600">#{post.id}</td>
                                <td className="p-4 border-b font-medium">{post.title}</td>
                                <td className="p-4 border-b text-sm">{post.author?.username}</td>
                                <td className="p-4 border-b text-sm text-gray-500">
                                    {post.attachedCard?.slug}
                                </td>
                                <td className="p-4 border-b">
                                    <DeletePostButton id={post.id} />
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">Постов нет.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
