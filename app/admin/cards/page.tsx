import { getCards } from '@/app/actions/cards';
import { getCategories } from '@/app/actions/categories';
import CardCreateForm from './create-form';
import DeleteCardButton from './delete-button';

export default async function AdminCardsPage() {
    const [cards, categories] = await Promise.all([
        getCards(),
        getCategories(),
    ]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Управление карточками (Квестами)</h2>

            <CardCreateForm categories={categories} />

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f0eadd]">
                        <tr>
                            <th className="p-4 border-b font-semibold">ID</th>
                            <th className="p-4 border-b font-semibold">Задание</th>
                            <th className="p-4 border-b font-semibold">Сложность</th>
                            <th className="p-4 border-b font-semibold">Категории</th>
                            <th className="p-4 border-b font-semibold">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Карточек пока нет. Создайте первую!
                                </td>
                            </tr>
                        ) : (
                            cards.map((card) => (
                                <tr key={card.id} className="hover:bg-gray-50">
                                    <td className="p-4 border-b text-gray-600">#{card.id}</td>
                                    <td className="p-4 border-b font-medium max-w-md truncate" title={card.questText}>
                                        {card.questText}
                                    </td>
                                    <td className="p-4 border-b">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold
                      ${card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {card.difficulty}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b text-sm text-gray-600">
                                        {card.categories.map(c => c.name).join(', ')}
                                    </td>
                                    <td className="p-4 border-b">
                                        <DeleteCardButton id={card.id} />
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
