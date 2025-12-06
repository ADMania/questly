import { getFragments } from '@/app/actions/fragments';
import { getCategories } from '@/app/actions/categories';
import FragmentCreateForm from './create-form';
import DeleteFragmentButton from './delete-button';

export default async function AdminFragmentsPage() {
    const [fragments, categories] = await Promise.all([
        getFragments(),
        getCategories(),
    ]);

    const categoryOptions = categories.map((c) => ({ id: c.id, label: c.name }));

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Управление фрагментами
                </h2>
                <p className="text-[#5e4632]">Генерируйте уникальные квесты, добавляя новые части речи.</p>
            </header>

            <FragmentCreateForm categories={categoryOptions} />

            <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Текст</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Слот</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Категории</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Вес</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaddcf]">
                        {(fragments as any[]).map((frag) => (
                            <tr key={`${frag.slot}-${frag.id}`} className="hover:bg-[#fffdf5] transition-colors">
                                <td className="p-4 text-[#8c6b54] font-mono text-sm">#{frag.id}</td>
                                <td className="p-4 font-medium text-[#3c2415]">{frag.text}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border ${frag.slot === 'action' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        frag.slot === 'place' ? 'bg-green-100 text-green-800 border-green-200' :
                                            'bg-purple-100 text-purple-800 border-purple-200'
                                        }`}>
                                        {frag.slot}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-[#5e4632]">
                                    {frag.categories.map((c: any) => c.name).join(', ') || '-'}
                                </td>
                                <td className="p-4 text-[#8c6b54]">{frag.weight}</td>
                                <td className="p-4">
                                    <DeleteFragmentButton id={frag.id} type={frag.slot} />
                                </td>
                            </tr>
                        ))}
                        {fragments.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-[#8c6b54]">Фрагментов нет.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
