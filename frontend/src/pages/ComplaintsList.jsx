import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const STATUS_OPTIONS = ['Registered', 'Assigned', 'Material Ordered', 'Under Process', 'Waiting For Material', 'Inspection Pending', 'Completed', 'Closed'];
const PRIORITY_OPTIONS = ['Emergency', 'High', 'Medium', 'Normal'];

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints', { params: { ...filters, page, limit: 15 } });
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(1); }, [fetchComplaints]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">View Complaints</h1>

      <div className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          className="input-field sm:col-span-2"
          placeholder="Search name, complaint no., phone, quarter..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select className="input-field" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field" value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-3">Complaint No.</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && complaints.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No complaints found</td></tr>
            )}
            {complaints.map((c) => (
              <tr key={c._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3">
                  <Link to={`/complaints/${c._id}`} className="font-mono text-brand-600 hover:underline">
                    {c.complaintNumber}
                  </Link>
                </td>
                <td className="p-3">{c.complainantName}</td>
                <td className="p-3">{c.category}</td>
                <td className="p-3">{c.priority}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{new Date(c.date).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchComplaints(p)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${
                p === pagination.page ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
