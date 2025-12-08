import { getUsers } from '@/app/actions/users';
import UserCreateForm from './create-form';
import UserTable from './user-table';

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
            <UserTable users={users} />
        </div>
    );
}
