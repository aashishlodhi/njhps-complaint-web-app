import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_OPTIONS = ['Registered', 'Assigned', 'Material Ordered', 'Under Process', 'Waiting For Material', 'Inspection Pending', 'Completed', 'Closed'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canUpdateStatus = user?.role !== 'citizen';
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setHistory(data.history);
      setNewStatus(data.complaint.status);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus, remarks });
      toast.success('Status updated');
      setRemarks('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!complaint) return <p className="text-gray-500">Complaint not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-mono font-bold text-lg text-brand-600">{complaint.complaintNumber}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            {complaint.status}
          </span>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Field label="Complainant" value={complaint.complainantName} />
          <Field label="Quarter No." value={complaint.quarterNumber} />
          <Field label="Phone" value={complaint.phoneNumber} />
          <Field label="Category" value={complaint.category} />
          <Field label="Priority" value={complaint.priority} />
          <Field label="Colony Type" value={complaint.colonyType} />
          <Field label="Location" value={complaint.location || '-'} />
          <Field label="Target Date" value={complaint.targetDate ? new Date(complaint.targetDate).toLocaleDateString('en-IN') : '-'} />
          <Field label="Estimated Cost" value={complaint.estimatedCost ? `Rs. ${complaint.estimatedCost}` : '-'} />
        </dl>
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Description</p>
          <p className="text-sm">{complaint.description}</p>
        </div>
      </div>

      {canUpdateStatus && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-sm">Update Status</h3>
          <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-1">
              <label className="label-text">New Status</label>
              <select className="input-field" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="label-text">Remarks</label>
              <input className="input-field" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary sm:col-span-1">Update Status</button>
          </form>
        </div>
      )}

      <div className="card p-6">
        <h3 className="font-semibold mb-4 text-sm">Complaint History</h3>
        <ul className="space-y-3">
          {history.map((h) => (
            <li key={h._id} className="text-sm border-l-2 border-brand-500 pl-3">
              <p className="font-medium">
                {h.previousStatus ? `${h.previousStatus} -> ${h.newStatus}` : h.newStatus}
              </p>
              <p className="text-gray-500 text-xs">
                {h.updatedBy?.name} · {new Date(h.createdAt).toLocaleString('en-IN')}
              </p>
              {h.remarks && <p className="text-gray-600 dark:text-gray-400 mt-0.5">{h.remarks}</p>}
            </li>
          ))}
          {history.length === 0 && <p className="text-gray-500 text-sm">No history yet.</p>}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-gray-500 dark:text-gray-400 text-xs">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
