import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserListings } from '../api/user';
import { deleteListing } from '../api/listings';
import {
  Box, Container, Typography, Button,
  CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ComputerIcon from '@mui/icons-material/Computer';
import ListingCard from '../components/ListingCard';

const MOCK_USER_LISTINGS = [
  { _id: '1', title: 'Intel Core i7-12700K', category: 'CPU', price: 850, condition: 'Excellent', seller: { username: 'george_pc' } },
  { _id: '6', title: 'Seasonic Focus GX 750W 80+ Gold', category: 'PSU', price: 350, condition: 'New', seller: { username: 'george_pc' } },
];

const ProfileListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const userId = user?.id || user?._id;
        const data = await getUserListings(userId);
        setListings(data);
      } catch {
        console.warn('Backend indisponibil, folosim date mock.');
        setListings(MOCK_USER_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  const handleDelete = async (listingId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest anunț?')) return;
    try {
      await deleteListing(listingId);
      setListings((prev) => prev.filter((l) => (l._id || l.id) !== listingId));
    } catch (err) {
      console.error('Eroare la ștergere:', err);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profile')}
              sx={{ color: '#6b6b6b', textTransform: 'none', '&:hover': { color: '#1c1c1e' } }}
            >
              Înapoi la profil
            </Button>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Anunțurile mele
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                {listings.length} anunțuri publicate
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/add-listing')}
            sx={{
              backgroundColor: '#5856d6',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#4745c0' },
            }}
          >
            Adaugă anunț
          </Button>
        </Box>

        {/* Continut */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#5856d6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : listings.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5ea',
            borderRadius: 3,
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}>
            <ComputerIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
            <Typography variant="h6" sx={{ color: '#1c1c1e' }}>
              Nu ai niciun anunț publicat încă
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
              Adaugă primul tău anunț și începe să vinzi!
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/add-listing')}
              sx={{
                color: '#5856d6',
                borderColor: '#5856d644',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5856d611', borderColor: '#5856d6' },
              }}
            >
              Adaugă primul tău anunț
            </Button>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
          }}>
            {listings.map((listing) => (
              <Box key={listing._id || listing.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ListingCard listing={listing} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => navigate(`/listing/${listing._id || listing.id}/edit`)}
                    sx={{
                      color: '#5856d6',
                      borderColor: '#5856d644',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#5856d608', borderColor: '#5856d6' },
                    }}
                  >
                    Editează
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => handleDelete(listing._id || listing.id)}
                    sx={{
                      color: '#ff3b30',
                      borderColor: '#ff3b3033',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#ff3b3011', borderColor: '#ff3b30' },
                    }}
                  >
                    Șterge
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default ProfileListings;