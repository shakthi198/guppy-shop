// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * ProtectedRoute
 *
 * Props:
 *   requireAdmin (bool) — if true, only users with role=admin may enter
 *   children            — page to render when access is granted
 *
 * Behaviour:
 *   • Loading  → spinner
 *   • No user  → redirect to /login  (remembers intended destination)
 *   • Non-admin accessing admin route → redirect to /
 *   • Otherwise → render children
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', gap: 2,
      }}>
        <CircularProgress color="primary" size={48} />
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  // Not logged in → send to login, preserving the intended page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged-in but not admin → send to home
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
