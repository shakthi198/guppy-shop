// frontend/src/pages/OrdersPage.js
// Shows ONLY the logged-in customer's own orders.
// Status values match live DB: Pending | Shipped | Delivered | Cancelled
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Card,
  CardContent, Chip, Button, Divider, Collapse,
  Avatar, Grid, Paper
} from '@mui/material';
import {
  ExpandMore, ExpandLess, ShoppingBag,
  Phone, Home, PinDrop, Person, Payments, LocalShipping
} from '@mui/icons-material';
import { orderAPI, getImageUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

// ── Status config (matches live DB ENUM) ─────────────────────────────────────
const STATUS_CONFIG = {
  Pending:   { color: 'warning', icon: '🕐', label: 'Pending'   },
  Shipped:   { color: 'info',    icon: '🚚', label: 'Shipped'   },
  Delivered: { color: 'success', icon: '📦', label: 'Delivered' },
  Cancelled: { color: 'error',   icon: '❌', label: 'Cancelled' },
};

// ── Single Order Card ─────────────────────────────────────────────────────────
function OrderCard({ order, reloadOrders }) {
  const [expanded,     setExpanded]     = useState(false);
  const [items,        setItems]        = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleExpand = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !items) {
      setLoadingItems(true);
      try {
        const res = await orderAPI.getOne(order.id);
        setItems(res.data.order.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    }
  };

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

  return (
    <Card sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: expanded ? 'primary.main' : 'rgba(10,79,110,0.1)',
      boxShadow: 'none',
      transition: 'border-color 0.2s',
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* ── Header row ─────────────────────────────────────────────────── */}
        <Box
          onClick={handleExpand}
          sx={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap',
            gap: 2, px: 2.5, py: 2, cursor: 'pointer',
            bgcolor: expanded ? 'rgba(10,79,110,0.03)' : 'white',
            '&:hover': { bgcolor: 'rgba(10,79,110,0.03)' },
            transition: 'background 0.15s',
          }}
        >
          <Typography fontWeight={900} color="primary.main" sx={{ minWidth: 90 }}>
            Order #{order.id}
          </Typography>

          <Chip
            label={`${cfg.icon} ${cfg.label}`}
            color={cfg.color}
            size="small"
            sx={{ fontWeight: 700 }}
          />

          <Chip
            label={`💵 Payment: ${order.payment_status || 'Pending'}`}
            variant="outlined"
            color={
              order.payment_status === 'Paid' ? 'success' :
              order.payment_status === 'Unpaid' ? 'error' : 'warning'
            }
            size="small"
            sx={{ fontWeight: 600 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 100 }}>
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Typography>

          <Typography variant="h6" fontWeight={900} color="secondary.main">
            Rs.{Number(order.total_amount).toFixed(2)}
          </Typography>

          <Button
            size="small"
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={(e) => { e.stopPropagation(); handleExpand(); }}
            sx={{ flexShrink: 0 }}
          >
            {expanded ? 'Hide' : 'Details'}
          </Button>
        </Box>

        {/* ── Cancel action row ───────────────────────────────────────────── */}
        {order.status === 'Pending' && (
          <Box sx={{ px: 2.5, pb: 1.5, display: 'flex', justifyContent: 'flex-end', bgcolor: expanded ? 'rgba(10,79,110,0.03)' : 'white' }}>
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                  orderAPI.updateStatus(order.id, 'Cancelled')
                    .then(() => {
                      enqueueSnackbar('Order cancelled successfully', { variant: 'success' });
                      reloadOrders();
                    })
                    .catch(() => {
                      enqueueSnackbar('Failed to cancel order', { variant: 'error' });
                    });
                }
              }}
              sx={{ fontWeight: 700, fontSize: 11 }}
            >
              Cancel Order
            </Button>
          </Box>
        )}

        {/* ── Expanded panel ──────────────────────────────────────────────── */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ px: 2.5, py: 2.5, bgcolor: '#F8FBFD' }}>
            <Grid container spacing={3}>

              {/* Delivery info */}
              <Grid item xs={12} sm={5}>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main"
                  sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocalShipping fontSize="small" /> Delivery Details
                </Typography>
                <Box sx={{
                  bgcolor: 'white', borderRadius: 2, p: 2,
                  border: '1px solid rgba(10,79,110,0.1)',
                  display: 'flex', flexDirection: 'column', gap: 1.5,
                }}>
                  {[
                    { icon: <Person  sx={{ fontSize: 17, color: 'primary.main' }} />,   label: 'Name',     value: order.shipping_name },
                    { icon: <Phone   sx={{ fontSize: 17, color: 'secondary.main' }} />,  label: 'Phone',    value: order.shipping_phone },
                    { icon: <Home    sx={{ fontSize: 17, color: '#F59E0B' }} />,          label: 'Address',  value: order.shipping_address },
                    { icon: <PinDrop sx={{ fontSize: 17, color: '#E84040' }} />,          label: 'Pincode',  value: order.shipping_pincode },
                    { icon: <Payments sx={{ fontSize: 17, color: '#00C8A0' }} />,         label: 'Payment',  value: order.payment_method || 'Cash on Delivery' },
                  ].map((row) => (
                    <Box key={row.label} sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                      <Box sx={{ flexShrink: 0, mt: 0.2 }}>{row.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          {row.label.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>{row.value || '—'}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Items */}
              <Grid item xs={12} sm={7}>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main"
                  sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  🐟 Items Ordered
                </Typography>
                {loadingItems ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : items && items.length > 0 ? (
                  <Box sx={{
                    bgcolor: 'white', borderRadius: 2,
                    border: '1px solid rgba(10,79,110,0.1)', overflow: 'hidden',
                  }}>
                    {items.map((item, idx) => (
                      <Box key={item.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                          <Avatar
                            src={getImageUrl(item.fish_image)}
                            variant="rounded"
                            sx={{ width: 42, height: 42, bgcolor: '#E8F4F8', flexShrink: 0 }}
                          >🐟</Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                              {item.fish_name}
                            </Typography>
                            <Chip
                              label={item.fish_type}
                              size="small"
                              sx={{ fontSize: 10, height: 18, mt: 0.3 }}
                            />
                          </Box>
                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                            <Typography variant="caption" color="text.secondary">
                              × {item.quantity}
                            </Typography>
                            <Typography variant="body2" fontWeight={800} color="secondary.main">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                        {idx < items.length - 1 && <Divider />}
                      </Box>
                    ))}
                    {/* Total */}
                    <Box sx={{
                      display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5,
                      bgcolor: '#F0F7FA', borderTop: '1px solid rgba(10,79,110,0.1)',
                    }}>
                      <Typography fontWeight={700}>Total</Typography>
                      <Typography fontWeight={900} color="primary.main">
                        Rs.{Number(order.total_amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">No items found</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ── Main Orders Page ──────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { user } = useAuth();
  const navigate  = useNavigate();

  const reloadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.orders || []);
    } catch {
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadOrders();
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
      <CircularProgress size={52} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            My Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing orders for <strong>{user?.name}</strong>
          </Typography>
        </Box>
        {orders.length > 0 && (
          <Chip
            label={`${orders.length} order${orders.length > 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {/* Status Filter */}
      {orders.length > 0 && (
        <Paper sx={{
          p: 2, mb: 3, borderRadius: 2,
          bgcolor: '#F0F7FA', border: '1px solid rgba(10,79,110,0.08)',
        }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
            FILTER BY STATUS
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label="All"
              clickable
              onClick={() => setFilterStatus('All')}
              variant={filterStatus === 'All' ? 'filled' : 'outlined'}
              color={filterStatus === 'All' ? 'primary' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <Chip
                key={status}
                label={`${cfg.icon} ${cfg.label}`}
                clickable
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? 'filled' : 'outlined'}
                color={filterStatus === status ? cfg.color : 'default'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* Order list */}
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ShoppingBag sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700} gutterBottom>
            No orders yet
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Browse our fish catalog and place your first order!
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Browse Fish
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders
            .filter(order => filterStatus === 'All' || order.status === filterStatus)
            .map((order) => (
              <OrderCard key={order.id} order={order} reloadOrders={reloadOrders} />
            ))}
          {orders.filter(order => filterStatus === 'All' || order.status === filterStatus).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                No orders found with status <strong>{filterStatus}</strong>.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
