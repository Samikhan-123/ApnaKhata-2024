// src/components/NotFoundRedirect.jsx
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotFoundRedirect = () => {
  useEffect(() => {
    toast.warning("No route found, redirecting to home.");
  }, []);

  return <Navigate to="/" replace />;
};

export default NotFoundRedirect;
