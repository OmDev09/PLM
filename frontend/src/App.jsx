import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import ApproverDashboard from './pages/ApproverDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import { useAuth } from './context/AuthContext';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'Admin': return <AdminDashboard />;
    case 'Engineer': return <EngineerDashboard />;
    case 'Approver': return <ApproverDashboard />;
    case 'Operations': return <OperationsDashboard />;
    default: return <AdminDashboard />;
  }
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-bold">Initializing Subsystems...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<RoleBasedDashboard />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default App;
