import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EngineerDashboard from './pages/EngineerDashboard';
import ApproverDashboard from './pages/ApproverDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import AdminDashboard from './pages/AdminDashboard';

const RoleRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Engineer': return <EngineerDashboard />;
    case 'Approver': return <ApproverDashboard />;
    case 'Operations': return <OperationsDashboard />;
    case 'Admin': return <AdminDashboard />;
    default: return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<RoleRouter />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
