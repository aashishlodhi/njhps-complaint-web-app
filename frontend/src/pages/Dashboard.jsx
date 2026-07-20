import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const CARD_DEFS = [
  { key: 'totalComplaints', label: 'Total Complaints', color: 'text-brand-600' },
  { key: 'todaysComplaints', label: "Today's Complaints", color: 'text-indigo-600' },
  { key: 'pendingComplaints', label: 'Pending', color: 'text-amber-600' },
  { key: 'completedComplaints', label: 'Completed', color: 'text-emerald-600' },
  { key: 'closedComplaints', label: 'Closed', color: 'text-slate-600' },
  { key: 'emergencyComplaints', label: 'Emergency', color: 'text-red-600' },
  { key: 'highPriorityComplaints', label: 'High Priority', color: 'text-orange-600' },
  { key: 'overdueComplaints', label: 'Overdue', color: 'text-pink-600' },
];

const PIE_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export default function Dashboard() {
  const [cards, setCards] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then(({ data }) => {
        setCards(data.cards);
        setCharts(data.charts);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (!cards) return <p className="text-gray-500">No data available.</p>;

  const monthly = (charts.monthlyTrend || []).map((m) => ({
    name: `${m._id.month}/${m._id.year}`,
    count: m.count,
  }));

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Complaint Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {CARD_DEFS.map(({ key, label, color }) => (
          <div key={key} className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{cards[key]}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Monthly Complaints</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Category Wise Complaints</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.byCategory}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="_id" fontSize={10} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Status Wise Complaints</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.byStatus} dataKey="count" nameKey="_id" outerRadius={90} label>
                {charts.byStatus.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Priority Wise Complaints</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.byPriority} dataKey="count" nameKey="_id" outerRadius={90} label>
                {charts.byPriority.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Engineer Workload</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.engineerWorkload}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 flex flex-col items-center justify-center">
          <h3 className="font-semibold mb-2 text-sm self-start">Completion Percentage</h3>
          <p className="text-5xl font-bold text-emerald-600">{charts.completionPercentage}%</p>
          <p className="text-sm text-gray-500 mt-2">of all complaints completed or closed</p>
        </div>
      </div>
    </div>
  );
}
