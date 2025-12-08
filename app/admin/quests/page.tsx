import { getQuests } from '@/app/actions/quests';
import QuestCreateForm from './create-form';
import QuestTable from './quest-table';

export default async function AdminQuestsPage() {
    const quests = await getQuests();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Квесты
                </h2>
                <p className="text-[#5e4632]">Создайте библиотеку заданий, управляйте текстами и балансируйте категории.</p>
            </header>

            <QuestCreateForm />
            <QuestTable quests={quests} />
        </div>
    );
}
