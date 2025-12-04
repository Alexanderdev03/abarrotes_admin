import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';

// Lazy loaded components
const AdminRouter = React.lazy(() => import('./components/admin/AdminRouter').then(module => ({ default: module.AdminRouter })));

import { AuthProvider, useAuth } from './context/auth.jsx';

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginModal />;
  }

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <Routes>
        <Route path="/*" element={<AdminRouter />} />
      </Routes>
    </Suspense>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default AppWrapper;
