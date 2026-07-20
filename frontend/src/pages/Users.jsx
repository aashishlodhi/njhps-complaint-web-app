import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'operator' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', form);
      toast.success('User created');
      setForm({ name: '', username: '', password: '', role: 'operator' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/auth/users/${user._id}`, { isActive: !user.isActive });
      load();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Manage Users</h1>

      <form onSubmit={handleCreate} className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-text">Full Name</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label-text">Username</label>
          <input className="input-field" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input type="password" className="input-field" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
        </div>
        <div>
          <label className="label-text">Role</label>
          <select className="input-field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="operator">Complaint Entry Operator</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button type="submit" className="btn-primary sm:col-span-2">Create User</button>
      </form>

      <div className="card divide-y divide-gray-100 dark:divide-gray-800">
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {users.map((u) => (
          <div key={u._id} className="p-3 flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{u.name} <span className="text-gray-400">@{u.username}</span></p>
              <p className="text-xs text-gray-500 capitalize">{u.role} · {u.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <button onClick={() => toggleActive(u)} className="text-xs text-brand-600 hover:underline">
              {u.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
