import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = false }) => {
  const { user } = useAuth();
  const pinVerified = localStorage.getItem('pinVerified') === 'true';

  // If PIN is not verified, redirect to PIN verification
  if (!pinVerified) {
    return <Navigate to="/pin" />;
  }

  // If authentication is required and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
