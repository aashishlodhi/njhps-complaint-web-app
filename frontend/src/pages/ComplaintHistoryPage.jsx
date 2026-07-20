import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

export default function ComplaintHistoryPage() {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints/history/all', { params: { page, limit: 25 } });
      setEntries(data.entries);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Complaint History</h1>
      <p className="text-sm text-gray-500 mb-6">A read-only audit trail of every status change. This log can never be edited or deleted.</p>

      <div className="card divide-y divide-gray-100 dark:divide-gray-800">
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {!loading && entries.length === 0 && <p className="p-6 text-center text-gray-500">No history entries yet.</p>}
        {entries.map((h) => (
          <div key={h._id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <Link to={`/complaints/${h.complaint?._id}`} className="font-mono text-brand-600 hover:underline text-sm">
                {h.complaint?.complaintNumber || 'Deleted complaint'}
              </Link>
              <p className="text-sm">
                {h.previousStatus ? `${h.previousStatus} -> ${h.newStatus}` : h.newStatus}
                {h.remarks && <span className="text-gray-500"> — {h.remarks}</span>}
              </p>
            </div>
            <p className="text-xs text-gray-500 whitespace-nowrap">
              {h.updatedBy?.name} · {new Date(h.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p)}
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
