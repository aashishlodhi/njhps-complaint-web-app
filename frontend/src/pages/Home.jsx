import { Link } from 'react-router-dom';
import {
  FilePlus2, LayoutDashboard, Search, List, FileBarChart, History, Settings, Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const CARDS = [
  { to: '/register', label: 'Register Complaint', desc: 'Log a new civil maintenance complaint', icon: FilePlus2, color: 'bg-brand-600' },
  { to: '/dashboard', label: 'Complaint Dashboard', desc: 'View stats and analytics', icon: LayoutDashboard, color: 'bg-indigo-600', restricted: ['citizen'] },
  { to: '/track', label: 'Check Complaint Status', desc: 'Track by complaint number', icon: Search, color: 'bg-emerald-600' },
  { to: '/complaints', label: 'View Complaints', desc: 'Search, filter and manage complaints', icon: List, color: 'bg-amber-600', restricted: ['citizen'] },
  { to: '/reports', label: 'Reports', desc: 'Export PDF, Excel, CSV reports', icon: FileBarChart, color: 'bg-rose-600', restricted: ['citizen'] },
  { to: '/history', label: 'Complaint History', desc: 'Full audit trail of updates', icon: History, color: 'bg-cyan-600', restricted: ['citizen'] },
  { to: '/settings', label: 'Settings', desc: 'Manage categories, engineers, contractors', icon: Settings, color: 'bg-slate-600', adminOnly: true },
];

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">NJHPS CIVIL COMPLAINT CELL</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.filter((c) => {
          if (c.adminOnly && !isAdmin) return false;
          if (c.restricted && c.restricted.includes(user?.role)) return false;
          return true;
        }).map(({ to, label, desc, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="card p-6 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <div className={`h-12 w-12 rounded-xl ${color} text-white flex items-center justify-center`}>
              <Icon size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-base">{label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
