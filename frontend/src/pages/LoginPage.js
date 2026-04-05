// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Divider, Link as MuiLink
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Waves } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      enqueueSnackbar(`Welcome back, ${userData.name}! 🐟`, { variant: 'success' });
      navigate(userData.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #062F42 0%, #0A4F6E 50%, #00C8A0 100%)',
      p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 440, borderRadius: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 120, height: 90, borderRadius: '50%',
              // bgcolor: 'white',
              mb: 2,
              //boxShadow: '0 8px 24px rgba(10,79,110,0.15)',
              overflow: 'hidden', p: 1
            }}>
              <Box component="img" src="/logo1.png" sx={{ width: '100%', height: '100%', objectFit: 'containr' }} />
            </Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              Vasan Guppy Farm
            </Typography>
            <Typography color="text.secondary" mt={0.5}>Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment>,
              }}
            />
            <TextField
              label="Password"
              type={showPass ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register" fontWeight={700} color="secondary.main">
                Create one free
              </MuiLink>
            </Typography>
          </Box>

          {/* Demo credentials hint */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F0F7FA', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              🔑 Admin demo: <strong>admin@guppyshop.com</strong> / <strong>Admin@123</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
