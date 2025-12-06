import { getCategories } from '@/app/actions/categories';
import CategoryCreateForm from './create-form';
import DeleteCategoryButton from './delete-button';

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Управление категориями</h2>

            <CategoryCreateForm />

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f0eadd]">
                        <tr>
                            <th className="p-4 border-b font-semibold">ID</th>
                            <th className="p-4 border-b font-semibold">Название</th>
                            <th className="p-4 border-b font-semibold">Slug</th>
                            <th className="p-4 border-b font-semibold">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    Категорий пока нет. Создайте первую!
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="p-4 border-b text-gray-600">#{cat.id}</td>
                                    <td className="p-4 border-b font-medium">{cat.name}</td>
                                    <td className="p-4 border-b text-gray-600 bg-gray-100 rounded px-2 py-1 text-sm inline-block m-2">
                                        {cat.slug}
                                    </td>
                                    <td className="p-4 border-b">
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
