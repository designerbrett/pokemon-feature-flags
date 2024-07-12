// AppRouter.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import PassReset from './pages/PassReset';
import ProjectionTable from './components/ProjectionTable';
import RetirementChart from './components/RetirementChart';
import Layout from './Layout';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/password-reset" element={<PassReset />} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/edit" 
            element={
              <PrivateRoute>
                <ProfileEdit />
              </PrivateRoute>
            } 
          />
          <Route path="/projections" element={<ProjectionTable />} />
          <Route path="/chart" element={<RetirementChart />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRouter;