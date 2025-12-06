import { getUsers } from '@/app/actions/users';
import UserCreateForm from './create-form';
import DeleteUserButton from './delete-button';

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#d26d75] mb-2" style={{ textShadow: "0 2px 3px rgba(0,0,0,0.15)" }}>
                    Управление пользователями
                </h2>
                <p className="text-[#5e4632]">Список всех зарегистрированных искателей приключений.</p>
            </header>

            <UserCreateForm />

            <div className="rounded-2xl border-2 border-[#d2a06f] bg-[#fff9eb] overflow-hidden shadow-[0_4px_0_#c99063]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f2e3bf] text-[#5e4632] border-b-2 border-[#d2a06f]">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">ID</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Username</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Email</th>
                            <th className="p-4 font-bold uppercase text-xs tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaddcf]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[#fffdf5] transition-colors">
                                <td className="p-4 text-[#8c6b54] font-mono text-sm">#{user.id}</td>
                                <td className="p-4 font-medium text-[#3c2415]">{user.username}</td>
                                <td className="p-4 text-[#5e4632]">{user.email}</td>
                                <td className="p-4">
                                    <DeleteUserButton id={user.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
