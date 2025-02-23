import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';
import AdminRoute from './components/routing/AdminRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Activate from './pages/user/Activate';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Videos from './pages/user/Videos';
import Referrals from './pages/user/Referrals';
import Withdraw from './pages/user/Withdraw';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import VideoManagement from './pages/admin/VideoManagement';
import WithdrawalManagement from './pages/admin/WithdrawalManagement';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register/*" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected User Routes */}
      <Route path="/app/*" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="videos" element={<Videos />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="activate" element={<Activate />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="videos" element={<VideoManagement />} />
        <Route path="withdrawals" element={<WithdrawalManagement />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;