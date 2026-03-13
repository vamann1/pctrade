import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById } from '../api/listings';
import { useAuth } from '../context/AuthContext';
import {
  Box, Container, Typography, Button, Chip,
  CircularProgress, Alert, Divider, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ComputerIcon from '@mui/icons-material/Computer';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BuildIcon from '@mui/icons-material/Build';
import mockListings from '../data/mockListings.json';

const categoryColors = {
  CPU: '#f44336',
  GPU: '#9c27b0',
  RAM: '#2196f3',
  SSD: '#ff9800',
  HDD: '#795548',
  Motherboard: '#4caf50',
  PSU: '#ffeb3b',
  Case: '#607d8b',
  Cooling: '#00bcd4',
  Monitor: '#3f51b5',
  Laptop: '#009688',
  'Full PC': '#ff5722',
  Peripheral: '#e91e63',
  Other: '#9e9e9e',
};

const MOCK_LISTING = {
  _id: '1',
  title: 'Intel Core i7-12700K',
  category: 'CPU',
  price: 850,
  condition: 'Excellent',
  brand: 'Intel',
  model: 'Core i7-12700K',
  location: 'București',
  description: 'Procesor Intel Core i7-12700K în stare foarte bună. A fost folosit timp de 8 luni într-un sistem de gaming. Nu a fost overclocked niciodată. Se vinde fără cooler. Factura originală disponibilă.',
  imageUrl: '',
  createdAt: '2024-03-01T10:00:00Z',
  seller: {
    _id: 'u1',
    username: 'george_pc',
    email: 'george@example.com',
  },
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await getListingById(id);
        setListing(data);
      } catch {
        console.warn('Backend indisponibil, folosim date mock.');
        const found = mockListings.find((l) => l._id === id);
        setListing(found || MOCK_LISTING);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress sx={{ color: '#00bcd4' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', p: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!listing) return null;

  const chipColor = categoryColors[listing.category] || '#9e9e9e';
  const isOwner = user !== null && user?._id === listing.seller?._id;
  const formattedDate = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">

        {/* Buton inapoi */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#888', textTransform: 'none', mb: 3, '&:hover': { color: 'white' } }}
        >
          Înapoi
        </Button>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>

          {/* ── STANGA: Imagine ── */}
          <Box sx={{
            width: '45%',
            flexShrink: 0,
            backgroundColor: '#0f1525',
            border: '1px solid #1e2a3a',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'sticky',
            top: 80,
          }}>
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                style={{ width: '100%', maxHeight: 420, objectFit: 'contain', padding: 16, backgroundColor: '#080d1a' }}
              />
            ) : (
              <Box sx={{
                height: 420,
                backgroundColor: '#080d1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ComputerIcon sx={{ fontSize: 120, color: '#1e2a3a' }} />
              </Box>
            )}
          </Box>

          {/* ── DREAPTA: Detalii ── */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Categorie + Stare */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={listing.category}
                size="small"
                sx={{
                  backgroundColor: chipColor + '22',
                  color: chipColor,
                  border: `1px solid ${chipColor}44`,
                }}
              />
              <Chip
                icon={<BuildIcon sx={{ fontSize: '14px !important', color: '#888 !important' }} />}
                label={listing.condition}
                size="small"
                sx={{ backgroundColor: '#1e2a3a', color: '#aaa' }}
              />
            </Box>

            {/* Titlu */}
            <Typography variant="h4" fontWeight="bold" color="white">
              {listing.title}
            </Typography>

            {/* Pret */}
            <Box sx={{
              backgroundColor: '#080d1a',
              border: '1px solid #1e2a3a',
              borderRadius: 2,
              p: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <LocalOfferIcon sx={{ color: '#00bcd4' }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#00bcd4' }}>
                {listing.price} RON
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a' }} />

            {/* Detalii tehnice */}
            {(listing.brand || listing.model || listing.location) && (
              <Box sx={{
                backgroundColor: '#080d1a',
                border: '1px solid #1e2a3a',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}>
                <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Detalii
                </Typography>
                {listing.brand && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Brand</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>{listing.brand}</Typography>
                  </Box>
                )}
                {listing.model && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Model</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>{listing.model}</Typography>
                  </Box>
                )}
                {listing.location && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Locație</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>{listing.location}</Typography>
                  </Box>
                )}
              </Box>
            )}

            <Divider sx={{ borderColor: '#1e2a3a' }} />

            {/* Descriere */}
            <Box>
              <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                Descriere
              </Typography>
              <Typography variant="body1" sx={{ color: '#ccc', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {listing.description || 'Nicio descriere disponibilă.'}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a' }} />

            {/* Info vanzator */}
            <Box sx={{
              backgroundColor: '#080d1a',
              border: '1px solid #1e2a3a',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <Avatar sx={{ bgcolor: '#00bcd4', width: 44, height: 44, fontWeight: 'bold' }}>
                {listing.seller?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Vânzător
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="white">
                  @{listing.seller?.username}
                </Typography>
              </Box>
              {formattedDate && (
                <Typography variant="caption" sx={{ color: '#555', ml: 'auto' }}>
                  Publicat {formattedDate}
                </Typography>
              )}
            </Box>

            {!user ? (
              <Box
                onClick={() => navigate('/login')}
                sx={{
                  border: '1px solid #1e2a3a',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#00bcd4', backgroundColor: '#00bcd411' },
                }}
              >
                <Typography variant="body2" sx={{ color: '#888' }}>
                  Intră în cont pentru a contacta vânzătorul
                </Typography>
                <Typography variant="caption" sx={{ color: '#00bcd4', fontWeight: 'bold' }}>
                  Login / Register →
                </Typography>
              </Box>
            ) : isOwner ? (
              <Alert
                severity="info"
                sx={{ backgroundColor: '#00bcd422', color: '#00bcd4', border: '1px solid #00bcd444' }}
              >
                Aceasta este oferta ta.
              </Alert>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate(`/messages?listingId=${listing._id}&sellerId=${listing.seller?._id}`)}
                sx={{
                  backgroundColor: '#00bcd4',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: 16,
                  '&:hover': { backgroundColor: '#0097a7' },
                }}
              >
                Contactează vânzătorul
              </Button>
            )}

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ListingDetail;