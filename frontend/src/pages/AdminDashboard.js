// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Alert,
  Collapse,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Badge,
  Avatar,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Refresh,
  TrendingUp,
  Inventory,
  ShoppingCart,
  Warning,
  Save,
  Waves,
  ExpandMore,
  ExpandLess,
  Phone,
  Home,
  LocalShipping,
  Person,
  Receipt,
  PinDrop,
} from "@mui/icons-material";
import { fishAPI, orderAPI } from "../utils/api";
import { useSnackbar } from "notistack";
import { useNotifications } from "../context/NotificationContext";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, title, value, color, subtitle }) {
  return (
    <Card sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: `${color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={900} color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Admin Order Row (expandable) ─────────────────────────────────────────────
function AdminOrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

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

  const statusColor = {
    Pending: "warning",
    Shipped: "info",
    Delivered: "success",
    Cancelled: "error",
  };
  const payColor = {
    Paid: "success",
    Failed: "error",
    Pending: "default",
    Refunded: "warning",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: expanded ? "primary.main" : "rgba(10,79,110,0.12)",
        borderRadius: 3,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Summary row */}
      <Box
        onClick={handleExpand}
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          px: 2.5,
          py: 2,
          cursor: "pointer",
          bgcolor: expanded ? "rgba(10,79,110,0.04)" : "white",
          "&:hover": { bgcolor: "rgba(10,79,110,0.04)" },
          transition: "background 0.15s",
        }}
      >
        <Typography fontWeight={900} color="primary.main" sx={{ minWidth: 72 }}>
          #{order.id}
        </Typography>

        <Box sx={{ flex: 1, minWidth: 140 }}>
          <Typography fontWeight={700} variant="body2">
            {order.customer_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {order.customer_email}
          </Typography>
        </Box>

        <Typography
          fontWeight={800}
          color="secondary.main"
          sx={{ minWidth: 90 }}
        >
          Rs.{Number(order.total_amount).toFixed(2)}
        </Typography>

        <Chip
          label={order.payment_status}
          color={payColor[order.payment_status] || "default"}
          size="small"
          sx={{ fontWeight: 700 }}
        />

        <Chip
          label={order.status}
          color={statusColor[order.status]}
          size="small"
          sx={{ fontWeight: 700 }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: 80 }}
        >
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Typography>

        <FormControl
          size="small"
          sx={{ minWidth: 130 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            sx={{ fontSize: 13, fontWeight: 600 }}
          >
            {["Pending", "Shipped", "Delivered", "Cancelled"].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton size="small" color="primary">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Expanded detail panel */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ px: 2.5, py: 2.5, bgcolor: "#F8FBFD" }}>
          <Grid container spacing={3}>
            {/* Customer & Delivery Info */}
            <Grid item xs={12} md={5}>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                color="primary.main"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <LocalShipping fontSize="small" /> Delivery Information
              </Typography>

              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid rgba(10,79,110,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {/* Name */}
                <Box
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <Person
                    sx={{ fontSize: 18, color: "primary.main", mt: 0.2 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                    >
                      CUSTOMER NAME
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {order.shipping_name || order.customer_name || "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Phone */}
                <Box
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <Phone
                    sx={{ fontSize: 18, color: "secondary.main", mt: 0.2 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                    >
                      PHONE NUMBER
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {order.shipping_phone || "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Address */}
                <Box
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <Home sx={{ fontSize: 18, color: "#F59E0B", mt: 0.2 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                    >
                      DELIVERY ADDRESS
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ lineHeight: 1.5 }}
                    >
                      {order.shipping_address || "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Pincode */}
                <Box
                  sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                >
                  <PinDrop sx={{ fontSize: 18, color: "#E84040", mt: 0.2 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      display="block"
                    >
                      PINCODE
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {order.shipping_pincode || "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Payment ID */}
                {order.payment_id && (
                  <Box
                    sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                  >
                    <Receipt sx={{ fontSize: 18, color: "#00C8A0", mt: 0.2 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        display="block"
                      >
                        PAYMENT ID
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontSize: 12, wordBreak: "break-all" }}
                      >
                        {order.payment_id}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Items Ordered */}
            <Grid item xs={12} md={7}>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                color="primary.main"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <ShoppingCart fontSize="small" /> Items Ordered
              </Typography>

              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid rgba(10,79,110,0.1)",
                  overflow: "hidden",
                }}
              >
                {loadingItems ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 3 }}
                  >
                    <CircularProgress size={28} />
                  </Box>
                ) : items && items.length > 0 ? (
                  <>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#F0F7FA" }}>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                py: 1,
                              }}
                            >
                              Fish
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                py: 1,
                              }}
                            >
                              Type
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                py: 1,
                              }}
                            >
                              Qty
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                py: 1,
                              }}
                            >
                              Unit Price
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                py: 1,
                              }}
                            >
                              Subtotal
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell sx={{ py: 1.2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Avatar
                                    src={item.fish_image || ""}
                                    variant="rounded"
                                    sx={{
                                      width: 34,
                                      height: 34,
                                      bgcolor: "#E8F4F8",
                                      fontSize: 14,
                                    }}
                                  >
                                    🐟
                                  </Avatar>
                                  <Typography variant="body2" fontWeight={700}>
                                    {item.fish_name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.2 }}>
                                <Chip
                                  label={item.fish_type || "—"}
                                  size="small"
                                  sx={{ fontSize: 11 }}
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ py: 1.2 }}>
                                <Chip
                                  label={`x ${item.quantity}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ py: 1.2 }}>
                                <Typography variant="body2">
                                  Rs.{Number(item.price).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 1.2 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                  color="secondary.main"
                                >
                                  Rs.{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Total row */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 2,
                        px: 2,
                        py: 1.5,
                        bgcolor: "#F0F7FA",
                        borderTop: "1px solid rgba(10,79,110,0.1)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Order Total:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color="primary.main"
                      >
                        Rs.{Number(order.total_amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{ py: 3, textAlign: "center", color: "text.secondary" }}
                  >
                    <Typography variant="body2">No items found</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─── Fish Form Dialog ─────────────────────────────────────────────────────────
function FishDialog({ open, onClose, fish, onSaved }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    name: "",
    type: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (fish) {
      setForm({
        name: fish.name,
        type: fish.type,
        price: fish.price,
        stock: fish.stock,
        image: fish.image || "",
        description: fish.description || "",
      });
    } else {
      setForm({
        name: "",
        type: "",
        price: "",
        stock: "",
        image: "",
        description: "",
      });
    }
    setError("");
  }, [fish, open]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (fish) {
        await fishAPI.update(fish.id, form);
        enqueueSnackbar("Fish updated successfully!", { variant: "success" });
      } else {
        await fishAPI.create(form);
        enqueueSnackbar("Fish added & customers notified! 🐟", {
          variant: "success",
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "primary.main", pb: 1 }}>
        {fish ? "Edit Fish" : "Add New Fish"}
      </DialogTitle>
      <Divider />
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          id="fish-form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Fish Name"
                name="name"
                required
                fullWidth
                value={form.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Type"
                name="type"
                required
                fullWidth
                value={form.type}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price (Rs.)"
                name="price"
                type="number"
                required
                fullWidth
                value={form.price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Stock Qty"
                name="stock"
                type="number"
                required
                fullWidth
                value={form.stock}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Image URL"
            name="image"
            fullWidth
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
          />
          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            fullWidth
            value={form.description}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="fish-form"
          variant="contained"
          disabled={loading}
          startIcon={<Save />}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : fish ? (
            "Save Changes"
          ) : (
            "Add Fish"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [fish, setFish] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingFish, setLoadingFish] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fishDialogOpen, setFishDialogOpen] = useState(false);
  const [editingFish, setEditingFish] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { notifications, unreadCount } = useNotifications();

  const loadFish = useCallback(async () => {
    setLoadingFish(true);
    try {
      const res = await fishAPI.getAll();
      setFish(res.data.fish || []);
    } catch {
      enqueueSnackbar("Failed to load fish", { variant: "error" });
    } finally {
      setLoadingFish(false);
    }
  }, [enqueueSnackbar]);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.orders || []);
    } catch {
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadFish();
    loadOrders();
  }, [loadFish, loadOrders]);

  const handleDelete = async (id) => {
    try {
      await fishAPI.delete(id);
      enqueueSnackbar("Fish deleted", { variant: "success" });
      loadFish();
    } catch {
      enqueueSnackbar("Delete failed", { variant: "error" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      enqueueSnackbar(`Order #${orderId} updated to ${status}`, {
        variant: "success",
      });
      loadOrders();
    } catch {
      enqueueSnackbar("Update failed", { variant: "error" });
    }
  };

  const totalRevenue = orders
    .filter((o) => o.payment_status === "Paid")
    .reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const lowStockFish = fish.filter((f) => f.stock <= 5 && f.stock > 0);
  const outOfStock = fish.filter((f) => f.stock === 0).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Waves sx={{ color: "primary.main", fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your GuppyShop
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={() => {
            loadFish();
            loadOrders();
          }}
          color="primary"
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Total Revenue"
            value={`Rs.${totalRevenue.toFixed(0)}`}
            color="#0A4F6E"
            subtitle={`${orders.filter((o) => o.payment_status === "Paid").length} paid orders`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<ShoppingCart />}
            title="Pending Orders"
            value={pendingOrders}
            color="#F59E0B"
            subtitle={`${orders.length} total orders`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Inventory />}
            title="Fish Types"
            value={fish.length}
            color="#00C8A0"
            subtitle={`${outOfStock} out of stock`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Warning />}
            title="Low Stock"
            value={lowStockFish.length}
            color="#E84040"
            subtitle="5 or fewer remaining"
          />
        </Grid>
      </Grid>

      {/* Low Stock Alert */}
      {lowStockFish.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Low Stock Alert:</strong>{" "}
          {lowStockFish.map((f) => `${f.name} (${f.stock} left)`).join(", ")}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ bgcolor: "#F0F7FA", "& .MuiTab-root": { fontWeight: 700 } }}
        >
          <Tab label={`Fish (${fish.length})`} />
          <Tab
            label={
              <Badge badgeContent={pendingOrders} color="warning" max={99}>
                <Box sx={{ pr: pendingOrders ? 2 : 0 }}>
                  Orders ({orders.length})
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Box sx={{ pr: unreadCount ? 2 : 0 }}>Notifications</Box>
              </Badge>
            }
          />
        </Tabs>

        {/* Fish Tab */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6" fontWeight={700}>
                Fish Inventory
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingFish(null);
                  setFishDialogOpen(true);
                }}
              >
                Add Fish
              </Button>
            </Box>
            {loadingFish ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F0F7FA" }}>
                      {[
                        "Image",
                        "Name",
                        "Type",
                        "Price",
                        "Stock",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 800, color: "primary.main" }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fish.map((f) => (
                      <TableRow key={f.id} hover>
                        <TableCell>
                          <Avatar
                            src={f.image || ""}
                            variant="rounded"
                            sx={{ width: 48, height: 48, bgcolor: "#E8F4F8" }}
                          >
                            🐟
                          </Avatar>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{f.name}</TableCell>
                        <TableCell>
                          <Chip label={f.type} size="small" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Rs.{Number(f.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography fontWeight={700}>{f.stock}</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, (f.stock / 50) * 100)}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                              color={
                                f.stock === 0
                                  ? "error"
                                  : f.stock <= 5
                                    ? "warning"
                                    : "success"
                              }
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              f.stock === 0
                                ? "Out of Stock"
                                : f.stock <= 5
                                  ? "Low Stock"
                                  : "In Stock"
                            }
                            color={
                              f.stock === 0
                                ? "error"
                                : f.stock <= 5
                                  ? "warning"
                                  : "success"
                            }
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditingFish(f);
                                setFishDialogOpen(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirm(f)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Orders Tab */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                All Orders
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Click any order to see full delivery details and items
              </Typography>
            </Box>

            {loadingOrders ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : orders.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                <ShoppingCart sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography>No orders yet</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {orders.map((order) => (
                  <AdminOrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleOrderStatus}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Notifications Tab */}
        {tab === 2 && (
          <Box sx={{ p: 3, maxHeight: 600, overflowY: "auto" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Recent Notifications
            </Typography>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                <Typography>No notifications yet</Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <Card
                  key={notif.id}
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    borderLeft: `4px solid ${notif.type === "new_order" ? "#F59E0B" : "#0A4F6E"}`,
                    bgcolor: notif.is_read
                      ? "transparent"
                      : "rgba(0,200,160,0.05)",
                  }}
                >
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={notif.is_read ? 400 : 700}
                        >
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notif.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      {!notif.is_read && (
                        <Chip
                          label="New"
                          color="secondary"
                          size="small"
                          sx={{ fontWeight: 700, height: 20, flexShrink: 0 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Paper>

      {/* Fish Dialog */}
      <FishDialog
        open={fishDialogOpen}
        onClose={() => setFishDialogOpen(false)}
        fish={editingFish}
        onSaved={loadFish}
      />

      {/* Delete Confirm Dialog */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Fish?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(deleteConfirm?.id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
