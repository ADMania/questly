import { getCategories } from '@/app/actions/categories';
import CategoryCreateForm from './create-form';
import DeleteCategoryButton from './delete-button';

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Управление категориями
                </h2>
                <p className="text-[#5e4632]">Сгруппируйте квесты по настроению или месту.</p>
            </header>

            <CategoryCreateForm />

            <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Название</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Slug</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaddcf]">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[#8c6b54]">
                                    Категорий пока нет. Создайте первую!
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-[#fffdf5] transition-colors">
                                    <td className="p-4 text-[#8c6b54] font-mono text-sm">#{cat.id}</td>
                                    <td className="p-4 font-medium text-[#3c2415]">{cat.name}</td>
                                    <td className="p-4">
                                        <span className="bg-[#eaddcf] text-[#5e4632] rounded px-2 py-1 text-sm font-mono border border-[#d2a06f]">
                                            {cat.slug}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <DeleteCategoryButton id={cat.id} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
