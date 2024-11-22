/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!user && !redirecting) {
      toast.error("Please enter an email and password");
      setRedirecting(true); // Prevent repeated toasts
    }
  }, [user, redirecting]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
