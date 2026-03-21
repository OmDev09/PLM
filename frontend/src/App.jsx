import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UnifiedDashboard from './pages/UnifiedDashboard';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-bold">Initializing Subsystems...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={
        user ? <UnifiedDashboard /> : <Navigate to="/login" />
      } />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default App;
