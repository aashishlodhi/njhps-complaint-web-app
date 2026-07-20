import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const TABS = [
  { key: 'categories', label: 'Categories', endpoint: '/categories', fields: ['name'] },
  { key: 'engineers', label: 'Engineers', endpoint: '/engineers', fields: ['name', 'phone', 'specialization'] },
  { key: 'contractors', label: 'Contractors', endpoint: '/contractors', fields: ['name', 'firmName', 'phone', 'tradeType'] },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  const tab = TABS.find((t) => t.key === activeTab);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(tab.endpoint);
      setItems(data.items);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab.endpoint]);

  useEffect(() => { setForm({}); load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(tab.endpoint, form);
      toast.success(`${tab.label.slice(0, -1)} added`);
      setForm({});
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.delete(`${tab.endpoint}/${id}`);
      toast.success('Deactivated');
      load();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        <Link to="/settings/users" className="text-sm text-brand-600 hover:underline">Manage Users →</Link>
      </div>

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === t.key ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleAdd} className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        {tab.fields.map((f) => (
          <div key={f}>
            <label className="label-text capitalize">{f}</label>
            <input
              className="input-field"
              value={form[f] || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
              required={f === 'name'}
            />
          </div>
        ))}
        <button type="submit" className="btn-primary sm:col-span-1">Add {tab.label.slice(0, -1)}</button>
      </form>

      <div className="card divide-y divide-gray-100 dark:divide-gray-800">
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {!loading && items.length === 0 && <p className="p-6 text-center text-gray-500">Nothing added yet.</p>}
        {items.map((item) => (
          <div key={item._id} className="p-3 flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{item.name} {item.firmName ? `(${item.firmName})` : ''}</p>
              <p className="text-gray-500 text-xs">{[item.phone, item.specialization, item.tradeType].filter(Boolean).join(' · ')}</p>
            </div>
            {item.isActive === false ? (
              <span className="text-xs text-gray-400">Inactive</span>
            ) : (
              <button onClick={() => handleDeactivate(item._id)} className="text-xs text-red-500 hover:underline">
                Deactivate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
