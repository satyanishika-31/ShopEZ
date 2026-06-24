import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  if (!user || !['SELLER', 'ADMIN'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
