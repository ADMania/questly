import { getUsers } from '@/app/actions/users';
import UserCreateForm from './create-form';
import DeleteUserButton from './delete-button';

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Управление пользователями</h2>

            <UserCreateForm />

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f0eadd]">
                        <tr>
                            <th className="p-4 border-b font-semibold">ID</th>
                            <th className="p-4 border-b font-semibold">Username</th>
                            <th className="p-4 border-b font-semibold">Email</th>
                            <th className="p-4 border-b font-semibold">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b text-gray-600">#{user.id}</td>
                                <td className="p-4 border-b font-medium">{user.username}</td>
                                <td className="p-4 border-b text-gray-600">{user.email}</td>
                                <td className="p-4 border-b">
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
