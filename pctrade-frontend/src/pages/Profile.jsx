import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserListings } from '../api/user';
import {
  Box, Container, Typography, Avatar, Button,
  Divider, CircularProgress, Chip, Alert
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import LogoutIcon from '@mui/icons-material/Logout';
import ListingCard from '../components/ListingCard';

// Date mock pentru listings utilizator
const MOCK_USER_LISTINGS = [
  { _id: '1', title: 'Intel Core i7-12700K', category: 'CPU', price: 850, condition: 'Folosit', seller: { username: 'george_pc' } },
  { _id: '6', title: 'Seasonic Focus GX 750W 80+ Gold', category: 'PSU', price: 350, condition: 'Nou', seller: { username: 'george_pc' } },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await getUserListings();
        setListings(data);
      } catch {
        console.warn('Backend indisponibil, folosim date mock.');
        setListings(MOCK_USER_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>

          {/* ── COLOANA STANGA: Info user ── */}
          <Box sx={{
            width: 280,
            flexShrink: 0,
            backgroundColor: '#0f1525',
            border: '1px solid #1e2a3a',
            borderRadius: 3,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            position: 'sticky',
            top: 80,
          }}>

            {/* Avatar */}
            <Avatar sx={{
              bgcolor: '#00bcd4',
              width: 80,
              height: 80,
              fontSize: 32,
              fontWeight: 'bold',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>

            {/* Nume + email */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="white">
                {user?.username}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                {user?.email}
              </Typography>
            </Box>

            {/* Stats */}
            <Box sx={{
              width: '100%',
              backgroundColor: '#080d1a',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              justifyContent: 'space-around',
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="#00bcd4">
                  {listings.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Oferte active
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: '#1e2a3a' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="#00bcd4">
                  0
                </Typography>
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Vânzări
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a', width: '100%' }} />

            {/* Butoane actiuni */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate('/add-listing')}
              sx={{
                backgroundColor: '#00bcd4',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#0097a7' },
              }}
            >
              Adaugă ofertă
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: '#f44336',
                borderColor: '#f4433644',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#f4433611', borderColor: '#f44336' },
              }}
            >
              Deconectare
            </Button>

          </Box>

          {/* ── COLOANA DREAPTA: Ofertele userului ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="white">
                  Ofertele mele
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
                  {listings.length} oferte publicate
                </Typography>
              </Box>
            </Box>

            {/* Continut */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress sx={{ color: '#00bcd4' }} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : listings.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                mt: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
                <ComputerIcon sx={{ fontSize: 64, color: '#1e2a3a' }} />
                <Typography color="#888">
                  Nu ai nicio ofertă publicată încă.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/add-listing')}
                  sx={{ color: '#00bcd4', borderColor: '#00bcd4', textTransform: 'none' }}
                >
                  Adaugă prima ta ofertă
                </Button>
              </Box>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
              }}>
                {listings.map((listing) => (
                  <Box key={listing._id}>
                    <ListingCard listing={listing} />
                  </Box>
                ))}
              </Box>
            )}

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;