import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const STATUS_COLORS = {
  Registered: 'bg-slate-100 text-slate-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'Material Ordered': 'bg-purple-100 text-purple-700',
  'Under Process': 'bg-amber-100 text-amber-700',
  'Waiting For Material': 'bg-orange-100 text-orange-700',
  'Inspection Pending': 'bg-cyan-100 text-cyan-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-gray-200 text-gray-700',
};

export default function ComplaintStatus() {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setComplaint(null);
    try {
      const { data } = await api.get(`/complaints/track/${complaintNumber.trim()}`);
      setComplaint(data.complaint);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Complaint not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Check Complaint Status</h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          className="input-field"
          placeholder="e.g. NJHPS-2026-000001"
          value={complaintNumber}
          onChange={(e) => setComplaintNumber(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {complaint && (
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono font-bold text-brand-600">{complaint.complaintNumber}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[complaint.status] || ''}`}>
              {complaint.status}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Name" value={complaint.complainantName} />
            <Field label="Category" value={complaint.category} />
            <Field label="Date" value={new Date(complaint.date).toLocaleDateString('en-IN')} />
            <Field label="Priority" value={complaint.priority} />
            <Field label="Assigned Engineer" value={complaint.assignedEngineer?.name || '-'} />
            <Field label="Assigned Contractor" value={complaint.assignedContractor?.name || '-'} />
            <Field label="Target Date" value={complaint.targetDate ? new Date(complaint.targetDate).toLocaleDateString('en-IN') : '-'} />
            <Field label="Completion Date" value={complaint.completionDate ? new Date(complaint.completionDate).toLocaleDateString('en-IN') : '-'} />
          </dl>
          {complaint.engineerRemarks && (
            <div>
              <p className="label-text mb-0">Engineer Remarks</p>
              <p className="text-sm">{complaint.engineerRemarks}</p>
            </div>
          )}
        </div>
      )}
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
