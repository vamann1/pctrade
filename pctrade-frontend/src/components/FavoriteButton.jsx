import { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../context/AuthContext';
import { checkIsFavorite, addFavorite, removeFavorite } from '../api/favorites';
import { useNavigate } from 'react-router-dom';

const FavoriteButton = ({ listingId, size = 'medium' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user || !listingId) return;
      try {
        const userId = user?.id || user?._id;
        const result = await checkIsFavorite(userId, listingId);
        setIsFavorite(result);
      } catch {
        // ignoram
      }
    };
    check();
  }, [user, listingId]);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Nu navigam la listing cand dam click
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const userId = user?.id || user?._id;
      if (isFavorite) {
        await removeFavorite(userId, listingId);
        setIsFavorite(false);
      } else {
        await addFavorite(userId, listingId);
        setIsFavorite(true);
      }
    } catch {
      // ignoram
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isFavorite ? 'Elimină din favorite' : 'Adaugă la favorite'}>
      <IconButton
        onClick={handleToggle}
        size={size}
        sx={{
          color: isFavorite ? '#ff3b30' : '#aeaeb2',
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,1)',
            color: isFavorite ? '#d32f2f' : '#ff3b30',
          },
          transition: 'all 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        {loading
          ? <CircularProgress size={16} sx={{ color: '#ff3b30' }} />
          : isFavorite
            ? <FavoriteIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />
            : <FavoriteBorderIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />
        }
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton;