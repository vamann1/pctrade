import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFavorite } from '../api/favorites';
import {
  Box, Container, Typography, Button,
  CircularProgress, Chip, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ComputerIcon from '@mui/icons-material/Computer';

const categoryColors = {
  CPU: '#f44336', GPU: '#9c27b0', RAM: '#2196f3',
  SSD: '#ff9800', HDD: '#795548', Motherboard: '#4caf50',
  PSU: '#ffeb3b', Case: '#607d8b', Cooling: '#00bcd4',
  Monitor: '#3f51b5', Laptop: '#009688', 'Full PC': '#ff5722',
  Peripheral: '#e91e63', Other: '#9e9e9e',
};

const ProfileFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userId = user?.id || user?._id;
        const data = await getFavorites(userId);
        setFavorites(data);
      } catch (err) {
        console.error('Eroare la fetch favorite:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  const handleRemove = async (listingId) => {
    setRemoving(listingId);
    try {
      const userId = user?.id || user?._id;
      await removeFavorite(userId, listingId);
      setFavorites(prev => prev.filter(f => f.listingId !== listingId));
    } catch (err) {
      console.error('Eroare la eliminare:', err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/profile')}
            sx={{ color: '#6b6b6b', textTransform: 'none', '&:hover': { color: '#1c1c1e' } }}
          >
            Înapoi la profil
          </Button>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Anunțurile favorite
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
              {favorites.length} anunțuri salvate
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#5856d6' }} />
          </Box>
        ) : favorites.length === 0 ? (
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
            <FavoriteBorderIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
            <Typography variant="h6" sx={{ color: '#1c1c1e' }}>
              Nu ai niciun anunț salvat încă
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
              Apasă iconița ❤️ pe orice anunț pentru a-l salva la favorite.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/browse')}
              sx={{
                color: '#5856d6',
                borderColor: '#5856d644',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5856d611', borderColor: '#5856d6' },
              }}
            >
              Explorează anunțuri
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {favorites.map((fav) => {
              const chipColor = categoryColors[fav.category] || '#9e9e9e';
              return (
                <Box
                  key={fav.favoriteId}
                  sx={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${fav.available ? '#e5e5ea' : '#ff3b3033'}`,
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      borderColor: fav.available ? '#5856d633' : '#ff3b3033',
                    },
                  }}
                >
                  {/* Icon categorie */}
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: chipColor + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ComputerIcon sx={{ color: chipColor, fontSize: 28 }} />
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ color: '#1c1c1e' }}
                        noWrap
                      >
                        {fav.title}
                      </Typography>
                      {!fav.available && (
                        <Chip
                          label="Vândut"
                          size="small"
                          sx={{ backgroundColor: '#ff3b3022', color: '#ff3b30', border: '1px solid #ff3b3033', fontSize: 11 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={fav.category}
                        size="small"
                        sx={{
                          backgroundColor: chipColor + '18',
                          color: chipColor,
                          border: `1px solid ${chipColor}33`,
                          fontSize: 11,
                        }}
                      />
                      {fav.condition && (
                        <Chip
                          label={fav.condition}
                          size="small"
                          sx={{ backgroundColor: '#f2f2f7', color: '#6b6b6b', fontSize: 11 }}
                        />
                      )}
                      {fav.location && (
                        <Typography variant="caption" sx={{ color: '#aeaeb2', alignSelf: 'center' }}>
                          📍 {fav.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Pret + Butoane */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#5856d6' }}>
                      {fav.price} RON
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {fav.available && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/listing/${fav.listingId}`)}
                          sx={{
                            color: '#5856d6',
                            borderColor: '#5856d644',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#5856d608', borderColor: '#5856d6' },
                          }}
                        >
                          Vezi Anunț
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={removing === fav.listingId
                          ? <CircularProgress size={12} />
                          : <FavoriteIcon sx={{ fontSize: 14 }} />
                        }
                        onClick={() => handleRemove(fav.listingId)}
                        disabled={removing === fav.listingId}
                        sx={{
                          color: '#ff3b30',
                          borderColor: '#ff3b3033',
                          textTransform: 'none',
                          '&:hover': { backgroundColor: '#ff3b3011', borderColor: '#ff3b30' },
                        }}
                      >
                        Elimină din Favorite
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProfileFavorites;