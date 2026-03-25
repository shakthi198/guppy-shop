// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Chip, Container,
  Button, Stack
} from '@mui/material';
import { Search, FilterList, Waves, Refresh } from '@mui/icons-material';
import FishCard from '../components/FishCard';
import { fishAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FISH_TYPES = ['All', 'Fancy', 'Moscow', 'Dragon', 'Dumbo', 'Cobra', 'Platinum', 'Endler', 'Tuxedo', 'Sword'];

export default function HomePage() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const { user } = useAuth();

  const fetchFish = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'All') params.type = typeFilter;
      const res = await fishAPI.getAll(params);
      setFish(res.data.fish || []);
    } catch {
      setError('Failed to load fish catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFish();
    // eslint-disable-next-line
  }, [typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFish();
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #062F42 0%, #0A4F6E 60%, #00C8A0 100%)',
        color: 'white',
        py: { xs: 6, md: 10 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60,
          width: 250, height: 250, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, left: -40,
          width: 180, height: 180, borderRadius: '50%',
          bgcolor: 'rgba(0,200,160,0.12)'
        }} />

        <Container maxWidth="md">
          <Waves sx={{ fontSize: 56, color: '#00C8A0', mb: 2 }} />
          <Typography variant="h2" fontWeight={900} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Premium Guppy Fish Shop
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, fontWeight: 400 }}>
            Discover rare, exotic, and show-quality guppies for your aquarium
          </Typography>

          {/* Search Bar */}
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, maxWidth: 560, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search guppies by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                bgcolor: 'white', borderRadius: 3,
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment>,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ borderRadius: 3, px: 3, whiteSpace: 'nowrap' }}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Filters */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2, mb: 4,
          flexWrap: 'wrap', justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
              {typeFilter === 'All' ? 'All Guppies' : `${typeFilter} Guppies`}
              {!loading && (
                <Chip
                  label={`${fish.length} found`}
                  size="small"
                  color="secondary"
                  sx={{ ml: 2, fontWeight: 700 }}
                />
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterList color="action" />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {FISH_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  clickable
                  color={typeFilter === type ? 'primary' : 'default'}
                  variant={typeFilter === type ? 'filled' : 'outlined'}
                  onClick={() => setTypeFilter(type)}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
            <Button startIcon={<Refresh />} onClick={fetchFish} size="small" color="primary">
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={56} color="primary" />
          </Box>
        ) : error ? (
          <Alert severity="error" action={<Button onClick={fetchFish}>Retry</Button>} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : fish.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <Waves sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
            <Typography variant="h6">No fish found matching your search</Typography>
            <Button onClick={() => { setSearch(''); setTypeFilter('All'); }} sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {fish.map((f) => (
              <Grid item key={f.id} xs={12} sm={6} md={4} lg={3}>
                <FishCard fish={f} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
