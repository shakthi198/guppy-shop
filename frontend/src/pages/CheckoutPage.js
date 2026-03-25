// frontend/src/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, TextField, Button, Paper,
  Divider, Stepper, Step, StepLabel, Alert, CircularProgress, Chip
} from '@mui/material';
import { ArrowBack, Payment, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import { useSnackbar } from 'notistack';

const RAZORPAY_KEY = 'rzp_test_XXXXXXXXXXXXXXXX'; // Replace with your Razorpay test key

const steps = ['Delivery Info', 'Payment', 'Confirmation'];

export default function CheckoutPage() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    address: '',
    pincode: '',
    phone: '',
  });

  useEffect(() => {
    if (cartItems.length === 0 && step !== 2) {
      navigate('/cart');
    }
  }, [cartItems, navigate, step]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.pincode || !form.phone) {
      setError('Please fill in all delivery details');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be 6 digits');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Phone must be 10 digits');
      return;
    }
    setError('');
    setStep(1);
  };

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    const loaded = await loadRazorpay();
    if (!loaded) {
      setError('Payment gateway failed to load. Check your internet connection.');
      setLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: Math.round(totalAmount * 100), // in paise
      currency: 'INR',
      name: 'GuppyShop',
      description: `Order for ${cartItems.length} fish`,
      image: '', // logo URL
      handler: async (response) => {
        // Payment succeeded — create order
        await createOrder(response.razorpay_payment_id);
      },
      prefill: {
        name: form.name,
        contact: form.phone,
      },
      notes: {
        address: form.address,
      },
      theme: { color: '#0A4F6E' },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setError('Payment was cancelled.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  // Demo payment (bypass Razorpay for testing without valid key)
  const handleDemoPayment = async () => {
    setLoading(true);
    setError('');
    await createOrder('demo_payment_' + Date.now());
  };

  const createOrder = async (paymentId) => {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          fish_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: totalAmount,
        payment_id: paymentId,
        shipping_name: form.name,
        shipping_address: form.address,
        shipping_pincode: form.pincode,
        shipping_phone: form.phone,
      };

      const res = await orderAPI.create(payload);
      setOrderId(res.data.order_id);
      clearCart();
      setStep(2);
      enqueueSnackbar('🎉 Order placed successfully!', { variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order. Please try again.');
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
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Delivery Info */}
      {step === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Delivery Details</Typography>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleDeliverySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Full Name" name="name" required fullWidth value={form.name} onChange={handleChange} />
                <TextField label="Delivery Address" name="address" required fullWidth multiline rows={3} value={form.address} onChange={handleChange} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Pincode" name="pincode" required fullWidth value={form.pincode} onChange={handleChange} inputProps={{ maxLength: 6 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Phone Number" name="phone" required fullWidth value={form.phone} onChange={handleChange} inputProps={{ maxLength: 10 }} />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button startIcon={<ArrowBack />} onClick={() => navigate('/cart')} color="inherit">Back</Button>
                  <Button type="submit" variant="contained" sx={{ flex: 1 }}>Continue to Payment</Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#F0F7FA' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.name} × {item.quantity}</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={800}>Total</Typography>
                <Typography fontWeight={900} color="secondary.main" variant="h6">₹{totalAmount.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Step 1: Payment */}
      {step === 1 && (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
          <Payment sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={800} gutterBottom>Complete Payment</Typography>
          <Typography color="text.secondary" mb={3}>
            You will be redirected to Razorpay secure payment
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#F0F7FA', borderRadius: 2, mb: 3 }}>
            <Typography variant="h4" fontWeight={900} color="secondary.main">₹{totalAmount.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary">Total Amount to Pay</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, textAlign: 'left' }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Payment />}
              onClick={handlePayment}
              disabled={loading}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay with Razorpay'}
            </Button>

            <Divider>
              <Chip label="OR" size="small" />
            </Divider>

            <Button
              variant="outlined"
              size="large"
              onClick={handleDemoPayment}
              disabled={loading}
              color="secondary"
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '🧪 Demo Payment (Test Mode)'}
            </Button>
          </Box>

          <Button startIcon={<ArrowBack />} onClick={() => setStep(0)} sx={{ mt: 2 }} color="inherit">
            Back to Delivery
          </Button>
        </Paper>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && (
        <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={900} color="success.main" gutterBottom>
            Order Placed!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Order ID: <strong>#{orderId}</strong>
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Your guppies are being prepared for shipment. You will receive updates shortly!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/')}>Continue Shopping</Button>
            <Button variant="outlined" onClick={() => navigate('/orders')}>View My Orders</Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
