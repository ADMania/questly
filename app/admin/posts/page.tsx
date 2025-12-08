import { getAdminPosts } from '@/app/actions/posts';
import { getCards } from '@/app/actions/cards';
import { getUsers } from '@/app/actions/users';
import PostCreateForm from './create-form';
import PostTable from './post-table';

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
            <PostTable posts={posts} authors={userOptions} cards={cardOptions} />
        </div>
    );
}
