// frontend/src/pages/CheckoutPage.js — Cash on Delivery only
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, TextField, Button, Paper,
  Divider, Alert, CircularProgress, Chip, Avatar,
  Stepper, Step, StepLabel, InputAdornment
} from '@mui/material';
import {
  ArrowBack, CheckCircle, LocalShipping, ShoppingCart,
  Phone, Home, Person, PinDrop, Payments
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart }  from '../context/CartContext';
import { useAuth }  from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import { useSnackbar } from 'notistack';

const steps = ['Delivery Details', 'Review Order', 'Confirmed'];

export default function CheckoutPage() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user }            = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate            = useNavigate();

  const [step,       setStep]       = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [orderId,    setOrderId]    = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    name:    user?.name || '',
    phone:   user?.phone || '',
    address: '',
    pincode: '',
  });

  useEffect(() => {
    if (cartItems.length === 0 && step !== 2) navigate('/cart');
  }, [cartItems, navigate, step]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.phone.trim())   errs.phone   = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) { setError(''); setStep(1); window.scrollTo(0, 0); }
  };

  // Place Order — sends authenticated request (JWT in header)
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderAPI.create({
        items: cartItems.map((item) => ({
          fish_id:  item.id,
          quantity: item.quantity,
          price:    item.price,
        })),
        total_amount:     totalAmount,
        shipping_name:    form.name,
        shipping_phone:   form.phone,
        shipping_address: form.address,
        shipping_pincode: form.pincode,
      });
      setOrderId(res.data.order_id);
      clearCart();           // removes user-specific cart from localStorage
      setStep(2);
      window.scrollTo(0, 0);
      enqueueSnackbar('Order placed! Admin will contact you soon 🐟', { variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {/* ── Step 0: Delivery Details ───────────────────────────────────────── */}
      {step === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping color="primary" /> Delivery Details
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleNext}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Full Name" name="name" required fullWidth
                  value={form.name} onChange={handleChange}
                  error={!!formErrors.name} helperText={formErrors.name}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start"><Person sx={{ color: 'primary.main' }} /></InputAdornment>
                  )}}
                />
                <TextField
                  label="Phone Number" name="phone" required fullWidth
                  value={form.phone} onChange={handleChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone || 'Admin will call you on this number'}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start"><Phone sx={{ color: 'secondary.main' }} /></InputAdornment>
                  )}}
                />
                <TextField
                  label="Delivery Address" name="address" required fullWidth
                  multiline rows={3} value={form.address} onChange={handleChange}
                  error={!!formErrors.address} helperText={formErrors.address}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <Home sx={{ color: '#F59E0B' }} />
                    </InputAdornment>
                  )}}
                />
                <TextField
                  label="Pincode" name="pincode" required fullWidth
                  value={form.pincode} onChange={handleChange}
                  error={!!formErrors.pincode} helperText={formErrors.pincode}
                  inputProps={{ maxLength: 6 }}
                  InputProps={{ startAdornment: (
                    <InputAdornment position="start"><PinDrop sx={{ color: '#E84040' }} /></InputAdornment>
                  )}}
                />

                {/* COD badge */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 2,
                  bgcolor: 'rgba(0,200,160,0.08)', borderRadius: 2,
                  border: '1px solid rgba(0,200,160,0.3)',
                }}>
                  <Payments sx={{ color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="secondary.main">
                      💵 Payment will handle By admin
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You will receive a call to confirm the payment, and delivery date will be scheduled.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button startIcon={<ArrowBack />} onClick={() => navigate('/cart')} color="inherit">
                    Back to Cart
                  </Button>
                  <Button type="submit" variant="contained" size="large" sx={{ flex: 1, py: 1.5, fontWeight: 700 }}>
                    Review Order →
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <OrderSummaryPanel cartItems={cartItems} totalAmount={totalAmount} />
          </Grid>
        </Grid>
      )}

      {/* ── Step 1: Review & Place ─────────────────────────────────────────── */}
      {step === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Review Your Order
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                Delivering To
              </Typography>
              <Box sx={{
                bgcolor: '#F0F7FA', borderRadius: 2, p: 2, mb: 3,
                display: 'flex', flexDirection: 'column', gap: 1.2,
                border: '1px solid rgba(10,79,110,0.1)',
              }}>
                {[
                  { icon: <Person  sx={{ fontSize: 16, color: 'primary.main' }} />,   val: form.name    },
                  { icon: <Phone   sx={{ fontSize: 16, color: 'secondary.main' }} />, val: form.phone   },
                  { icon: <Home    sx={{ fontSize: 16, color: '#F59E0B' }} />,         val: form.address },
                  { icon: <PinDrop sx={{ fontSize: 16, color: '#E84040' }} />,         val: form.pincode },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 0.2, flexShrink: 0 }}>{row.icon}</Box>
                    <Typography variant="body2" fontWeight={600}>{row.val}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, p: 1.5,
                bgcolor: 'rgba(0,200,160,0.08)', borderRadius: 2,
                border: '1px solid rgba(0,200,160,0.3)',
              }}>
                <Payments sx={{ color: 'secondary.main' }} />
                <Box>
                  <Typography variant="body2" fontWeight={700} color="secondary.main">
                    Payment:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    You will pay Rs.{totalAmount.toFixed(2)} to admin 
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button startIcon={<ArrowBack />} onClick={() => setStep(0)} color="inherit">
                  Edit Details
                </Button>
                <Button
                  variant="contained" color="secondary" size="large"
                  onClick={handlePlaceOrder} disabled={loading}
                  sx={{ flex: 1, py: 1.5, fontSize: 16, fontWeight: 800 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : '✅ Place Order'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <OrderSummaryPanel cartItems={cartItems} totalAmount={totalAmount} />
          </Grid>
        </Grid>
      )}

      {/* ── Step 2: Confirmed ─────────────────────────────────────────────── */}
      {step === 2 && (
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={900} color="success.main" gutterBottom>
            Order Placed!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Order placed successfully. Admin will contact you soon.
          </Typography>
          <Chip
            label={`Order ID: #${orderId}`}
            color="primary"
            sx={{ fontWeight: 800, fontSize: 15, px: 1, mb: 3 }}
          />
          <Box sx={{
            bgcolor: '#F0F7FA', borderRadius: 2, p: 2.5, mb: 3, textAlign: 'left',
            border: '1px solid rgba(10,79,110,0.1)',
          }}>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              What happens next?
            </Typography>
            {[
              `📞 Admin will call you at ${form.phone} to confirm`,
              '📦 Your guppies will be carefully packed',
              `🚚 Delivered to: ${form.address}, ${form.pincode}`,
              '💵 Pay cash when your order arrives',
            ].map((line, i) => (
              <Typography key={i} variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {line}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/')}>Continue Shopping</Button>
            <Button variant="outlined" onClick={() => navigate('/orders')}>View My Orders</Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

// ── Reusable sidebar ──────────────────────────────────────────────────────────
function OrderSummaryPanel({ cartItems, totalAmount }) {
  return (
    <Paper sx={{
      p: 2.5, borderRadius: 3, bgcolor: '#F8FBFD',
      border: '1px solid rgba(10,79,110,0.1)',
      position: 'sticky', top: 80,
    }}>
      <Typography variant="h6" fontWeight={700} gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCart color="primary" fontSize="small" /> Order Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
        {cartItems.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar src={item.image || ''} variant="rounded"
              sx={{ width: 44, height: 44, bgcolor: '#E8F4F8', flexShrink: 0 }}>
              🐟
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{item.name}</Typography>
              <Typography variant="caption" color="text.secondary">× {item.quantity}</Typography>
            </Box>
            <Typography variant="body2" fontWeight={800}>
              Rs.{(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography color="text.secondary" variant="body2">Subtotal</Typography>
        <Typography fontWeight={600} variant="body2">Rs.{totalAmount.toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography color="text.secondary" variant="body2">Delivery</Typography>
        <Chip label="FREE" color="success" size="small" sx={{ fontWeight: 700, height: 20 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={800} variant="h6">Total</Typography>
        <Typography fontWeight={900} variant="h6" color="secondary.main">
          Rs.{totalAmount.toFixed(2)}
        </Typography>
      </Box>
      <Box sx={{
        mt: 2, p: 1.5, bgcolor: 'rgba(0,200,160,0.08)',
        borderRadius: 2, border: '1px solid rgba(0,200,160,0.25)', textAlign: 'center',
      }}>
        <Typography variant="body2" fontWeight={700} color="secondary.main">💵 Payment will be handle through call</Typography>
        <Typography variant="caption" color="text.secondary" display="block">Admin will let you know more details</Typography>
      </Box>
    </Paper>
  );
}
