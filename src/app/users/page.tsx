'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { UserRole, Department } from '@/types';

interface IUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export default function UsersPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<{
    username: string;
    password: string;
    name: string;
    email: string;
    role: UserRole;
    department: Department;
  }>({ username: '', password: '', name: '', email: '', role: UserRole.EMPLOYEE, department: Department.MANAGEMENT });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;
    
    if (user.role !== UserRole.ADMIN) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setError('Требуется авторизация');
          setLoading(false);
          return;
        }

        console.log('Fetching users with token:', token.substring(0, 10) + '...');
        
        const response = await fetch('/api/users', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch users:', response.status, errorText);
          setError(`Ошибка получения пользователей: ${response.status}`);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} users:`, data);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Ошибка при загрузке пользователей');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, mounted, router]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка');
        return;
      }
      const newUser = await res.json();
      setUsers(prev => [...prev, newUser]);
      setForm({ username: '', password: '', name: '', email: '', role: UserRole.EMPLOYEE, department: Department.MANAGEMENT });
    } catch (err) {
      setError('Ошибка при создании');
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${id}`, { 
      method: 'DELETE', 
      headers: { 
        Authorization: token ? `Bearer ${token}` : '' 
      } 
    });
    
    if (response.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      setError('Ошибка при удалении пользователя');
    }
  };

  // During server rendering or before mounting, return a placeholder
  if (!mounted) {
    return (
      <div className="p-4">
        <h1 className="text-2xl mb-4">Управление пользователями</h1>
        <div className="h-screen"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Управление пользователями</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <div>
          <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Логин" required className="input" />
        </div>
        <div>
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Пароль" required className="input" />
        </div>
        <div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя" required className="input" />
        </div>
        <div>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" required className="input" />
        </div>
        <div>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="input">
            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <select
            value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value as Department }))}
            required
            className="input"
          >
            {Object.values(Department).map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="btn">Создать</button>
      </form>

      {loading ? (
        <div className="text-center py-4">Загрузка пользователей...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="p-2">Логин</th><th>Имя</th><th>Email</th><th>Роль</th><th>Отдел</th><th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Пользователи не найдены</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id || u.username} className="border-t">
                  <td className="p-2">{u.username}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.department}</td>
                  <td><button onClick={() => handleDelete(u.id)} className="btn-danger">Удалить</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 