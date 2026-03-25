// frontend/src/components/FishCard.js
import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions, Typography,
  Button, Chip, Box, Tooltip, IconButton
} from '@mui/material';
import { AddShoppingCart, Visibility, Inventory2 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80';

const stockColor = (stock) => {
  if (stock === 0) return 'error';
  if (stock <= 5) return 'warning';
  return 'success';
};

const stockLabel = (stock) => {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 5) return `Only ${stock} left!`;
  return `${stock} in stock`;
};

export default function FishCard({ fish }) {
  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      enqueueSnackbar('Please login to add items to cart', { variant: 'warning' });
      navigate('/login');
      return;
    }
    if (fish.stock === 0) {
      enqueueSnackbar('This fish is out of stock', { variant: 'error' });
      return;
    }
    addToCart(fish, 1);
    enqueueSnackbar(`${fish.name} added to cart! 🐟`, { variant: 'success' });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 32px rgba(10,79,110,0.16)',
        },
      }}
      onClick={() => navigate(`/fish/${fish.id}`)}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#E8F4F8' }}>
        <CardMedia
          component="img"
          height="200"
          image={fish.image || PLACEHOLDER}
          alt={fish.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          sx={{ objectFit: 'cover', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
        />
        <Chip
          label={fish.type}
          size="small"
          sx={{
            position: 'absolute', top: 10, left: 10,
            bgcolor: 'rgba(10,79,110,0.85)', color: 'white',
            fontWeight: 700, fontSize: 11
          }}
        />
        <Chip
          label={stockLabel(fish.stock)}
          color={stockColor(fish.stock)}
          size="small"
          icon={<Inventory2 sx={{ fontSize: '14px !important' }} />}
          sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 600, fontSize: 11 }}
        />
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          {fish.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5
        }}>
          {fish.description || 'A beautiful guppy fish for your aquarium.'}
        </Typography>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          ₹{Number(fish.price).toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={(e) => { e.stopPropagation(); navigate(`/fish/${fish.id}`); }}
          sx={{ flex: 1 }}
        >
          Details
        </Button>
        {!isAdmin && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddShoppingCart />}
            onClick={handleAddToCart}
            disabled={fish.stock === 0}
            sx={{ flex: 1 }}
          >
            Add to Cart
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
