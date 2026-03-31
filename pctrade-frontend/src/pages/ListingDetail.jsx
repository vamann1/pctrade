import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById, getListingImages, deleteListing } from '../api/listings';
import { getSellerReviews } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import {
  Box, Container, Typography, Button, Chip,
  CircularProgress, Alert, Divider, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ComputerIcon from '@mui/icons-material/Computer';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BuildIcon from '@mui/icons-material/Build';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import mockListings from '../data/mockListings.json';
import { createTransaction, checkActiveTransaction } from '../api/transactions';
import FavoriteButton from '../components/FavoriteButton';
import { getSimilarListings } from '../api/ai';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';


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

const MINIO_URL = 'http://localhost:9000/pctrade-images';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [hasActiveTransaction, setHasActiveTransaction] = useState(false);
  const [similarListings, setSimilarListings] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await getListingById(id);
        setListing(data);
        try {
          const imgs = await getListingImages(id);
          setImages(imgs);
        } catch {
          setImages([]);
        }
        try {
          const reviewsData = await getSellerReviews(data.seller?.id);
          setReviews(reviewsData);
        } catch {
          setReviews([]);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          const found = mockListings.find((l) => l._id === id || String(l.id) === id);
          setListing(found || MOCK_LISTING);
        } else {
          console.warn('Backend indisponibil, folosim date mock.');
          const found = mockListings.find((l) => l._id === id || String(l.id) === id);
          setListing(found || MOCK_LISTING);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

useEffect(() => {
  const checkTransaction = async () => {
    if (!user || !listing) return;
    // Calculam seller ID direct aici, fara a depinde de isOwner
    const sellerId = listing.seller?.id || listing.seller?._id;
    if (!sellerId) return;
    if (String(user?.id) === String(sellerId) || String(user?._id) === String(sellerId)) return;
    try {
      const buyerId = user?.id || user?._id;
      const listingId = listing?.id || listing?._id;
      const active = await checkActiveTransaction(buyerId, listingId);
      setHasActiveTransaction(active);
    } catch {
      // ignoram eroarea
    }
  };
  checkTransaction();
}, [user, listing]);

useEffect(() => {
  const fetchSimilar = async () => {
    if (!listing) return;
    setSimilarLoading(true);
    try {
      const data = await getSimilarListings(
        listing.title,
        listing.category,
        listing.brand,
        listing.model,
        listing.price,
        listing.id || listing._id
      );

      // Parsam JSON-ul returnat de AI
      const parsed = JSON.parse(data.message);
      const suggestions = parsed.suggestions || [];

      // Fetch detalii pentru fiecare listing sugerat
      const detailedListings = await Promise.all(
        suggestions.map(async (s) => {
          try {
            const listingData = await getListingById(s.id);
            return { ...listingData, reason: s.reason };
          } catch {
            return null;
          }
        })
      );

      setSimilarListings(detailedListings.filter(Boolean));
    } catch {
      setSimilarListings([]);
    } finally {
      setSimilarLoading(false);
    }
  };
  fetchSimilar();
}, [listing]);

  if (loading) return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress sx={{ color: '#5856d6' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', p: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!listing) return null;

  const chipColor = categoryColors[listing.category] || '#9e9e9e';
  const isOwner = user !== null && (user?._id === listing.seller?._id || user?.id === listing.seller?.id);
  const formattedDate = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const handleBuyNow = async () => {
    setBuyError(null);
    setBuyLoading(true);
    try {
      const buyerId = user?.id || user?._id;
      const listingId = listing?.id || listing?._id;
      await createTransaction(buyerId, listingId);
      setBuySuccess(true);
      setHasActiveTransaction(true);
    } catch (err) {
      setBuyError(err.response?.data?.message || 'Eroare la plasarea comenzii. Încearcă din nou.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleBuyNowAndCheckout = async () => {
  setBuyError(null);
  setBuyLoading(true);
  try {
    const buyerId = user?.id || user?._id;
    const listingId = listing?.id || listing?._id;
    const created = await createTransaction(buyerId, listingId);
    setHasActiveTransaction(true);
    navigate(`/checkout/${created.id}`);
  } catch (err) {
    setBuyError(err.response?.data?.message || 'Eroare la plasarea comenzii.');
  } finally {
    setBuyLoading(false);
  }
};


  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">

        {/* Buton inapoi */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#6b6b6b', textTransform: 'none', mb: 3, '&:hover': { color: '#1c1c1e' } }}
        >
          Înapoi
        </Button>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>

          {/* ── STANGA: Imagini ── */}
          <Box sx={{
            width: '45%',
            flexShrink: 0,
            position: 'sticky',
            top: 80,
          }}>
            <Box sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 3,
              overflow: 'hidden',
              mb: 1.5,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              {images.length > 0 ? (
                <img
                  src={`${MINIO_URL}/${images[activeImage].imageUrl}`}
                  alt={listing.title}
                  style={{ width: '100%', height: 420, objectFit: 'contain', padding: 16 }}
                />
              ) : (
                <Box sx={{
                  height: 420,
                  backgroundColor: '#f2f2f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ComputerIcon sx={{ fontSize: 120, color: '#c7c7cc' }} />
                </Box>
              )}
            </Box>

            {images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {images.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setActiveImage(index)}
                    sx={{
                      width: 72,
                      height: 72,
                      border: `2px solid ${activeImage === index ? '#5856d6' : '#e5e5ea'}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.15s',
                      '&:hover': { borderColor: '#5856d6' },
                    }}
                  >
                    <img
                      src={`${MINIO_URL}/${img.imageUrl}`}
                      alt={`${listing.title} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                    />
                  </Box>
                ))}
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
                  backgroundColor: chipColor + '18',
                  color: chipColor,
                  border: `1px solid ${chipColor}33`,
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<BuildIcon sx={{ fontSize: '14px !important', color: '#6b6b6b !important' }} />}
                label={listing.condition}
                size="small"
                sx={{ backgroundColor: '#f2f2f7', color: '#6b6b6b', border: '1px solid #e5e5ea' }}
              />
            </Box>

            {/* Titlu */}
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              {listing.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                {listing.title}
              </Typography>
              <FavoriteButton
                listingId={listing?.id || listing?._id}
                size="medium"
              />
            </Box>

            {/* Pret */}
            <Box sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 2,
              p: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <LocalOfferIcon sx={{ color: '#5856d6' }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#5856d6' }}>
                {listing.price} RON
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            {/* Detalii tehnice */}
            {(listing.brand || listing.model || listing.location) && (
              <Box sx={{
                backgroundColor: '#f9f9fb',
                border: '1px solid #e5e5ea',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}>
                <Typography variant="caption" sx={{ color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Detalii
                </Typography>
                {listing.brand && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Brand</Typography>
                    <Typography variant="body2" sx={{ color: '#1c1c1e', fontWeight: 'bold' }}>{listing.brand}</Typography>
                  </Box>
                )}
                {listing.model && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Model</Typography>
                    <Typography variant="body2" sx={{ color: '#1c1c1e', fontWeight: 'bold' }}>{listing.model}</Typography>
                  </Box>
                )}
                {listing.location && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Locație</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 14, color: '#6b6b6b' }} />
                      <Typography variant="body2" sx={{ color: '#1c1c1e', fontWeight: 'bold' }}>{listing.location}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            {/* Descriere */}
            <Box>
              <Typography variant="caption" sx={{ color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                Descriere
              </Typography>
              <Typography variant="body1" sx={{ color: '#1c1c1e', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {listing.description || 'Nicio descriere disponibilă.'}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            {/* Info vanzator */}
            <Box
              sx={{
                backgroundColor: '#f9f9fb',
                border: '1px solid #e5e5ea',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#5856d633', backgroundColor: '#f2f2f7' },
              }}
              onClick={() => navigate(`/user/${listing.seller?.id || listing.seller?._id}`)}
            >
              <Avatar sx={{ bgcolor: '#5856d6', width: 44, height: 44, fontWeight: 'bold' }}>
                {listing.seller?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                  Vânzător
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                  @{listing.seller?.username}
                </Typography>
              </Box>
              {formattedDate && (
                <Typography variant="caption" sx={{ color: '#aeaeb2', ml: 'auto' }}>
                  Publicat {formattedDate}
                </Typography>
              )}
            </Box>

            {/* Recenzii vanzator */}
            {reviews.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
                  Recenzii vânzător ({reviews.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {reviews.slice(0, 3).map((review, index) => (
                    <Box key={index} sx={{
                      backgroundColor: '#f9f9fb',
                      border: '1px solid #e5e5ea',
                      borderRadius: 2,
                      p: 2,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                          @{review.reviewerName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.3 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon key={star} sx={{ fontSize: 14, color: star <= review.rating ? '#ff9800' : '#e5e5ea' }} />
                          ))}
                        </Box>
                      </Box>
                      {review.comment && (
                        <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                          {review.comment}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Butoane actiuni */}
            {!user ? (
              <Box
                onClick={() => navigate('/login')}
                sx={{
                  border: '1px solid #e5e5ea',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#5856d6', backgroundColor: '#5856d608' },
                }}
              >
                <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                  Intră în cont pentru a contacta vânzătorul
                </Typography>
                <Typography variant="caption" sx={{ color: '#5856d6', fontWeight: 'bold' }}>
                  Login / Register →
                </Typography>
              </Box>
            ) : isOwner ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Alert
                  severity="info"
                  sx={{ backgroundColor: '#5856d611', color: '#5856d6', border: '1px solid #5856d633' }}
                >
                  Aceasta este oferta ta.
                </Alert>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/listing/${listing._id || listing.id}/edit`)}
                    sx={{
                      color: '#5856d6',
                      borderColor: '#5856d644',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1.2,
                      '&:hover': { backgroundColor: '#5856d608', borderColor: '#5856d6' },
                    }}
                  >
                    Editează anunțul
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={async () => {
                      if (!window.confirm('Ești sigur că vrei să ștergi acest anunț?')) return;
                      try {
                        await deleteListing(listing._id || listing.id);
                        navigate('/profile/listings');
                      } catch (err) {
                        console.error('Eroare la ștergere:', err);
                      }
                    }}
                    sx={{
                      color: '#ff3b30',
                      borderColor: '#ff3b3033',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1.2,
                      '&:hover': { backgroundColor: '#ff3b3011', borderColor: '#ff3b30' },
                    }}
                  >
                    Șterge anunțul
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={buyLoading || hasActiveTransaction}
                  sx={{
                    color: '#5856d6',
                    borderColor: '#5856d644',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    py: 1.5,
                    fontSize: 16,
                    '&:hover': { backgroundColor: '#5856d608', borderColor: '#5856d6' },
                  }}
                >
                  {hasActiveTransaction ? 'Adăugat în coș ✓' : '🛒 Adaugă în coș'}
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBuyNowAndCheckout}
                  disabled={buyLoading || hasActiveTransaction}
                  sx={{
                    backgroundColor: '#34c759',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    py: 1.5,
                    fontSize: 16,
                    '&:hover': { backgroundColor: '#2db34a' },
                  }}
                >
                  {buyLoading
                    ? <CircularProgress size={22} sx={{ color: 'white' }} />
                    : `⚡ Cumpără acum — ${listing.price} RON`
                  }
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/messages?listingId=${listing._id || listing.id}&sellerId=${listing.seller?.id || listing.seller?._id}`)}
                  sx={{
                    color: '#5856d6',
                    borderColor: '#5856d644',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    py: 1.5,
                    fontSize: 16,
                    '&:hover': { backgroundColor: '#5856d608', borderColor: '#5856d6' },
                  }}
                >
                  Contactează vânzătorul
                </Button>

                {buyError && (
                  <Alert severity="error">{buyError}</Alert>
                )}
              </Box>
            )}

          </Box>
        </Box>

        {/* Sectiune AI Similar */}
        {(similarLoading || similarListings.length > 0) && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesomeIcon sx={{ color: '#5856d6', fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Produse similare sugerate de AI
              </Typography>
              <Box sx={{
                backgroundColor: '#5856d611',
                border: '1px solid #5856d633',
                borderRadius: 10,
                px: 1,
                py: 0.2,
              }}>
                <Typography variant="caption" sx={{ color: '#5856d6', fontWeight: 'bold', fontSize: 10 }}>
                  BETA
                </Typography>
              </Box>
            </Box>

            {similarLoading ? (
              <Box sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: 3,
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                <CircularProgress size={20} sx={{ color: '#5856d6' }} />
                <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                  AI-ul analizează produse similare...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {similarListings.map((similar) => {
                  const chipColor = categoryColors[similar.category] || '#9e9e9e';
                  return (
                    <Box
                      key={similar.id}
                      onClick={() => navigate(`/listing/${similar.id}`)}
                      sx={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e5ea',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          borderColor: '#5856d633',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      {/* Icon categorie */}
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: chipColor + '18',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <ComputerIcon sx={{ color: chipColor, fontSize: 24 }} />
                      </Box>

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }} noWrap>
                          {similar.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                          <AutoAwesomeIcon sx={{ fontSize: 12, color: '#5856d6' }} />
                          <Typography variant="caption" sx={{ color: '#5856d6', fontStyle: 'italic' }}>
                            {similar.reason}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Pret */}
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#5856d6' }}>
                          {similar.price} RON
                        </Typography>
                        <Chip
                          label={similar.condition}
                          size="small"
                          sx={{ backgroundColor: '#f2f2f7', color: '#6b6b6b', fontSize: 10 }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ListingDetail;