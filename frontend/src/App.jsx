import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RegisterComplaint from './pages/RegisterComplaint.jsx';
import ComplaintStatus from './pages/ComplaintStatus.jsx';
import ComplaintsList from './pages/ComplaintsList.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import Reports from './pages/Reports.jsx';
import ComplaintHistoryPage from './pages/ComplaintHistoryPage.jsx';
import Settings from './pages/Settings.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute restrictedRoles={['citizen']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterComplaint />} />
        <Route path="/track" element={<ComplaintStatus />} />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute restrictedRoles={['citizen']}>
              <ComplaintsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute restrictedRoles={['citizen']}>
              <ComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute restrictedRoles={['citizen']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute restrictedRoles={['citizen']}>
              <ComplaintHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute adminOnly>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/users"
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
