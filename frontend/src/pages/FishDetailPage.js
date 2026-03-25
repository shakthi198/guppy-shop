// frontend/src/pages/FishDetailPage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Button, Chip, CircularProgress,
  Alert, Divider, TextField, InputAdornment, Breadcrumbs, Link as MuiLink,
  Paper
} from '@mui/material';
import {
  AddShoppingCart, ArrowBack, Inventory2, Category, AttachMoney,
  NavigateNext
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fishAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80';

export default function FishDetailPage() {
  const { id } = useParams();
  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fishAPI.getOne(id);
        setFish(res.data.fish);
      } catch {
        setError('Fish not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    if (!fish || fish.stock === 0) return;
    addToCart(fish, qty);
    enqueueSnackbar(`${qty}x ${fish.name} added to cart! 🐟`, { variant: 'success' });
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
      <CircularProgress size={56} />
    </Box>
  );

  if (error || !fish) return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Alert severity="error">{error}</Alert>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Catalog</Button>
    </Container>
  );

  const stockOk = fish.stock > 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit" underline="hover">Home</MuiLink>
        <Typography color="text.primary" fontWeight={600}>{fish.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Image */}
        <Grid item xs={12} md={5}>
          <Box sx={{
            borderRadius: 4, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(10,79,110,0.15)',
            bgcolor: '#E8F4F8',
          }}>
            <img
              src={fish.image || PLACEHOLDER}
              alt={fish.name}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
              style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }}
            />
          </Box>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={fish.type} color="primary" sx={{ fontWeight: 700 }} />
            <Chip
              label={stockOk ? (fish.stock <= 5 ? `Only ${fish.stock} left!` : `${fish.stock} in stock`) : 'Out of Stock'}
              color={stockOk ? (fish.stock <= 5 ? 'warning' : 'success') : 'error'}
              icon={<Inventory2 />}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Typography variant="h3" fontWeight={900} color="primary.main" gutterBottom>
            {fish.name}
          </Typography>

          <Typography variant="h4" fontWeight={800} color="secondary.main" gutterBottom>
            ₹{Number(fish.price).toFixed(2)}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
            {fish.description || 'A beautiful guppy fish perfect for community aquariums. Known for its vibrant colors and peaceful temperament.'}
          </Typography>

          {/* Info Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Type', value: fish.type, icon: <Category /> },
              { label: 'Price', value: `₹${Number(fish.price).toFixed(2)}`, icon: <AttachMoney /> },
              { label: 'Stock', value: fish.stock, icon: <Inventory2 /> },
            ].map((item) => (
              <Grid item xs={4} key={item.label}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#F0F7FA', border: '1px solid rgba(10,79,110,0.08)' }}>
                  <Box sx={{ color: 'primary.main', mb: 0.5 }}>{item.icon}</Box>
                  <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Add to Cart */}
          {!isAdmin && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                type="number"
                label="Qty"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(fish.stock, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: fish.stock }}
                sx={{ width: 90 }}
                size="small"
                disabled={!stockOk}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCart />}
                onClick={handleAdd}
                disabled={!stockOk}
                sx={{ flex: 1, py: 1.5, fontSize: 16 }}
              >
                {stockOk ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </Box>
          )}

          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
            color="inherit"
          >
            Back to Catalog
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
