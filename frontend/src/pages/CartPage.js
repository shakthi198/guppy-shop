// frontend/src/pages/CartPage.js
import React from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  IconButton, Divider, Chip, Alert, Paper
} from '@mui/material';
import {
  Add, Remove, Delete, ShoppingCart, ArrowForward, ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&q=80';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Discover beautiful guppies and add them to your cart!
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          Browse Fish
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
        🛒 Your Cart
        <Chip label={`${cartItems.length} items`} color="secondary" sx={{ ml: 2, fontWeight: 700 }} />
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cartItems.map((item) => (
              <Card key={item.id} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <img
                      src={item.image || PLACEHOLDER}
                      alt={item.name}
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                      style={{
                        width: 80, height: 80, borderRadius: 12,
                        objectFit: 'cover', flexShrink: 0, background: '#E8F4F8'
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>{item.name}</Typography>
                      <Chip label={item.type} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                      <Typography variant="h6" fontWeight={800} color="secondary.main" mt={0.5}>
                        ₹{Number(item.price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        sx={{ bgcolor: '#F0F7FA' }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography fontWeight={800} sx={{ minWidth: 28, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        sx={{ bgcolor: '#F0F7FA' }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                      <Typography fontWeight={800} color="primary.main" variant="h6">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                        sx={{ mt: 0.5 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} color="inherit">
              Continue Shopping
            </Button>
            <Button color="error" onClick={clearCart} startIcon={<Delete />}>
              Clear Cart
            </Button>
          </Box>
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3, borderRadius: 3, position: 'sticky', top: 80,
            background: 'linear-gradient(135deg, #F0F7FA 0%, #FFFFFF 100%)',
            border: '1px solid rgba(10,79,110,0.1)'
          }}>
            <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {cartItems.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '60%' }}>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={600}>₹{totalAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Chip label="FREE" color="success" size="small" sx={{ fontWeight: 700 }} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Total</Typography>
              <Typography variant="h6" fontWeight={900} color="secondary.main">
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/checkout')}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
