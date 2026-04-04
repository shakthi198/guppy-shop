// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Link as MuiLink
} from '@mui/material';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff, Waves } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      enqueueSnackbar('Account created! Welcome to Vasan Guppy Farm 🐟', { variant: 'success' });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
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
      <Card sx={{ width: '100%', maxWidth: 440, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 120, height: 90, borderRadius: '50%',
              // bgcolor: 'white', 
              mb: 2,
              // boxShadow: '0 8px 24px rgba(10,79,110,0.15)',
              overflow: 'hidden', p: 1
            }}>
              <Box component="img" src="/logo.png" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">Create Account</Typography>
            <Typography color="text.secondary" mt={0.5}>Join Vasan Guppy Farm today</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name" name="name" required fullWidth
              value={form.name} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person color="primary" /></InputAdornment> }}
            />
            <TextField
              label="Email Address" name="email" type="email" required fullWidth
              value={form.email} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment> }}
            />
            <TextField
              label="Phone Number" name="phone" fullWidth
              value={form.phone} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="primary" /></InputAdornment> }}
            />
            <TextField
              label="Password" name="password" type={showPass ? 'text' : 'password'} required fullWidth
              value={form.password} onChange={handleChange}
              helperText="At least 6 characters"
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
              type="submit" variant="contained" color="secondary" fullWidth size="large"
              disabled={loading} sx={{ mt: 1, py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" fontWeight={700} color="primary.main">Sign in</MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
