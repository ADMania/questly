import { getCards } from '@/app/actions/cards';
import CardTable from './card-table';

export default async function AdminCardsPage() {
    const cards = await getCards();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Карточки
                </h2>
                <p className="text-[#5e4632]">Карточки создаются пользователями. Здесь можно скорректировать текст, сложность и категорию.</p>
            </header>

            <CardTable cards={cards} />
        </div>
    );
}
