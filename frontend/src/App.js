// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';

import theme from './theme/theme';
import { AuthProvider }         from './context/AuthContext';
import { CartProvider }         from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import HomePage        from './pages/HomePage';
import FishDetailPage  from './pages/FishDetailPage';
import CartPage        from './pages/CartPage';
import CheckoutPage    from './pages/CheckoutPage';
import OrdersPage      from './pages/OrdersPage';
import AdminDashboard  from './pages/AdminDashboard';

// Load Outfit font
const fontLink   = document.createElement('link');
fontLink.rel     = 'stylesheet';
fontLink.href    = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap';
document.head.appendChild(fontLink);

function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main">{children}</Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3500}
      >
        <BrowserRouter>
          {/*
            Context order matters:
            AuthProvider must wrap CartProvider (cart depends on user.id)
            CartProvider must wrap NotificationProvider (both need auth)
          */}
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <Routes>

                  {/* ── Public auth pages (no Navbar) ──────────────────── */}
                  <Route path="/login"    element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* ── Public pages (with Navbar) ──────────────────────── */}
                  <Route path="/"
                    element={<AppLayout><HomePage /></AppLayout>} />
                  <Route path="/fish/:id"
                    element={<AppLayout><FishDetailPage /></AppLayout>} />

                  {/* ── Customer-only protected pages ───────────────────── */}
                  <Route path="/cart" element={
                    <AppLayout>
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    </AppLayout>
                  } />

                  <Route path="/checkout" element={
                    <AppLayout>
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    </AppLayout>
                  } />

                  {/* My Orders — customers see only their own orders */}
                  <Route path="/orders" element={
                    <AppLayout>
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    </AppLayout>
                  } />

                  {/* ── Admin-only protected page ────────────────────────── */}
                  <Route path="/admin" element={
                    <AppLayout>
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    </AppLayout>
                  } />

                  {/* ── Catch-all ────────────────────────────────────────── */}
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
