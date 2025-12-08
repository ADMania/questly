import { getCards } from '@/app/actions/cards';
import CardCreateForm from './create-form';
import DeleteCardButton from './delete-button';

export default async function AdminCardsPage() {
    const cards = await getCards();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Управление карточками (Квестами)
                </h2>
                <p className="text-[#5e4632]">Создавайте и редактируйте квесты для пользователей.</p>
            </header>

            <CardCreateForm />

            <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Задание</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Сложность</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Категория</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaddcf]">
                        {cards.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-[#8c6b54]">
                                    Карточек пока нет. Создайте первую!
                                </td>
                            </tr>
                        ) : (
                            cards.map((card) => (
                                <tr key={card.id} className="hover:bg-[#fffdf5] transition-colors">
                                    <td className="p-4 text-[#8c6b54] font-mono text-sm">#{card.id}</td>
                                    <td className="p-4 font-medium text-[#3c2415] max-w-md truncate" title={card.questText}>
                                        {card.questText}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs uppercase font-bold border
                      ${card.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-200' :
                                                card.difficulty === 'medium' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                    'bg-red-100 text-red-800 border-red-200'}`}>
                                            {card.difficulty}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[#5e4632]">
                                        {card.categoryLabel}
                                    </td>
                                    <td className="p-4">
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
