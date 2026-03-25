// frontend/src/pages/OrdersPage.js
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Card,
  CardContent, Chip, Grid, Button, Divider, Collapse, IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess, ShoppingBag } from '@mui/icons-material';
import { orderAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  Pending: 'warning',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'error',
};

const paymentColors = {
  Pending: 'default',
  Paid: 'success',
  Failed: 'error',
  Refunded: 'warning',
};

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const handleExpand = async () => {
    setExpanded(!expanded);
    if (!items && !expanded) {
      setLoadingItems(true);
      try {
        const res = await orderAPI.getOne(order.id);
        setItems(res.data.order.items);
      } catch {}
      finally { setLoadingItems(false); }
    }
  };

  return (
    <Card sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography fontWeight={800} variant="h6" color="primary.main">Order #{order.id}</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={order.status} color={statusColors[order.status]} size="small" sx={{ fontWeight: 700 }} />
            <Chip label={`Payment: ${order.payment_status}`} color={paymentColors[order.payment_status]} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={900} color="secondary.main">
            ₹{Number(order.total_amount).toFixed(2)}
          </Typography>
          <Button
            size="small"
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={handleExpand}
          >
            {expanded ? 'Hide' : 'View'} Details
          </Button>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F7FA', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Delivery Details</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shipping_name} • {order.shipping_phone}<br />
              {order.shipping_address}, {order.shipping_pincode}
            </Typography>

            {loadingItems ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
            ) : items && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Items Ordered</Typography>
                {items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.fish_name} × {item.quantity}</Typography>
                    <Typography variant="body2" fontWeight={600}>₹{(item.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.getAll();
        setOrders(res.data.orders || []);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
      <CircularProgress size={56} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
        My Orders
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No orders yet</Typography>
          <Button variant="contained" onClick={() => navigate('/')}>Start Shopping</Button>
        </Box>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </Container>
  );
}
