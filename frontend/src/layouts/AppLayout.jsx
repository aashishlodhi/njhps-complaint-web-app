import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, FilePlus2, Search, List, FileBarChart,
  History, Settings, LogOut, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, restricted: ['citizen'] },
  { to: '/register', label: 'Register Complaint', icon: FilePlus2 },
  { to: '/track', label: 'Check Status', icon: Search },
  { to: '/complaints', label: 'View Complaints', icon: List, restricted: ['citizen'] },
  { to: '/reports', label: 'Reports', icon: FileBarChart, restricted: ['citizen'] },
  { to: '/history', label: 'Complaint History', icon: History, restricted: ['citizen'] },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) / top bar (mobile) */}
      <aside className="md:w-64 w-full md:min-h-screen bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex md:flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
            NJ
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm">NJHPS</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Civil Complaint Cell</p>
          </div>
        </div>

        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1 flex-1">
          {NAV_ITEMS.filter((item) => {
            if (item.adminOnly && !isAdmin) return false;
            if (item.restricted && item.restricted.includes(user?.role)) return false;
            return true;
          }).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm py-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
