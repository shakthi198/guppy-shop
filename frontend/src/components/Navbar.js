// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem,
  Button, Box, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Chip, Divider, Avatar, Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import {
  Notifications, ShoppingCart, Menu as MenuIcon, Close,
  Home, AdminPanelSettings, Logout, Login, PersonAdd,
  Circle, DoneAll, Waves
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

const typeColors = {
  new_fish: '#00C8A0',
  new_order: '#F59E0B',
  order_update: '#0A4F6E',
  system: '#9CA3AF',
};

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const recentNotifs = notifications.slice(0, 8);

  return (
    <>
      <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #062F42 0%, #0A4F6E 100%)' }}>
        <Toolbar sx={{ gap: 1 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexGrow: { xs: 1, md: 0 }, mr: { md: 3 } }}
          >
            <Waves sx={{ color: '#00C8A0', fontSize: 30 }} />
            <Typography variant="h6" fontWeight={800} color="white" letterSpacing="-0.5px">
              GuppyShop
            </Typography>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, alignItems: 'center' }}>
              <Button color="inherit" component={Link} to="/" startIcon={<Home />}>
                Fish Catalog
              </Button>
              {isAdmin && (
                <Button color="inherit" component={Link} to="/admin" startIcon={<AdminPanelSettings />}>
                  Admin Panel
                </Button>
              )}
            </Box>
          )}

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {user && (
              <>
                {/* Notification Bell */}
                <Tooltip title="Notifications">
                  <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Cart (customers only) */}
                {!isAdmin && (
                  <Tooltip title="Cart">
                    <IconButton color="inherit" component={Link} to="/cart">
                      <Badge badgeContent={totalItems} color="secondary" max={99}>
                        <ShoppingCart />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                )}

                {/* User Avatar */}
                {!isMobile && (
                  <Tooltip title={`${user.name} (${user.role})`}>
                    <Avatar
                      sx={{ width: 34, height: 34, bgcolor: '#00C8A0', fontSize: 14, fontWeight: 700, cursor: 'default', ml: 0.5 }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                )}

                <Tooltip title="Logout">
                  <IconButton color="inherit" onClick={handleLogout} size="small">
                    <Logout />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {!user && !isMobile && (
              <>
                <Button color="inherit" component={Link} to="/login" startIcon={<Login />}>
                  Login
                </Button>
                <Button variant="contained" color="secondary" component={Link} to="/register" startIcon={<PersonAdd />}>
                  Register
                </Button>
              </>
            )}

            {isMobile && (
              <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{
          sx: { width: 360, maxHeight: 480, borderRadius: 3, mt: 1, overflow: 'hidden' },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F0F7FA' }}>
          <Typography fontWeight={700} color="primary">
            Notifications {unreadCount > 0 && <Chip label={unreadCount} size="small" color="error" sx={{ ml: 1, height: 20, fontSize: 11 }} />}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAll />} onClick={markAllRead} sx={{ fontSize: 12 }}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {/* Notification List */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {recentNotifs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Notifications sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">No notifications yet</Typography>
            </Box>
          ) : (
            recentNotifs.map((notif) => (
              <Box
                key={notif.id}
                sx={{
                  px: 2, py: 1.5,
                  bgcolor: notif.is_read ? 'transparent' : 'rgba(0,200,160,0.06)',
                  borderLeft: `3px solid ${typeColors[notif.type] || '#9CA3AF'}`,
                  '&:hover': { bgcolor: 'rgba(10,79,110,0.04)' },
                  borderBottom: '1px solid #F0F7FA',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  {!notif.is_read && (
                    <Circle sx={{ fontSize: 8, color: '#00C8A0', mt: 0.7, flexShrink: 0 }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={notif.is_read ? 400 : 600} color="text.primary">
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notif.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700} color="primary">Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </Box>
          <Divider />
          <List>
            <ListItem button component={Link} to="/" onClick={() => setMobileOpen(false)}>
              <ListItemIcon><Home color="primary" /></ListItemIcon>
              <ListItemText primary="Fish Catalog" />
            </ListItem>
            {user && !isAdmin && (
              <ListItem button component={Link} to="/cart" onClick={() => setMobileOpen(false)}>
                <ListItemIcon>
                  <Badge badgeContent={totalItems} color="secondary"><ShoppingCart color="primary" /></Badge>
                </ListItemIcon>
                <ListItemText primary="Cart" />
              </ListItem>
            )}
            {isAdmin && (
              <ListItem button component={Link} to="/admin" onClick={() => setMobileOpen(false)}>
                <ListItemIcon><AdminPanelSettings color="primary" /></ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}
            <Divider sx={{ my: 1 }} />
            {user ? (
              <ListItem button onClick={() => { handleLogout(); setMobileOpen(false); }}>
                <ListItemIcon><Logout color="error" /></ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
              </ListItem>
            ) : (
              <>
                <ListItem button component={Link} to="/login" onClick={() => setMobileOpen(false)}>
                  <ListItemIcon><Login color="primary" /></ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={Link} to="/register" onClick={() => setMobileOpen(false)}>
                  <ListItemIcon><PersonAdd color="secondary" /></ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
