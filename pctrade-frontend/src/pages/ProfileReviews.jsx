import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSellerReviews } from '../api/reviews';
import {
  Box, Container, Typography, Button,
  CircularProgress, Avatar, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const ProfileReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const userId = user?.id || user?._id;
        const data = await getSellerReviews(userId);
        setReviews(data);
      } catch (err) {
        console.error('Eroare la fetch recenzii:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">

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
              Recenziile mele
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
              {reviews.length} recenzii primite
            </Typography>
          </Box>
        </Box>

        {/* Card sumar rating */}
        {reviews.length > 0 && (
          <Box sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5ea',
            borderRadius: 3,
            p: 3,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <Box sx={{ textAlign: 'center', px: 2 }}>
              <Typography variant="h2" fontWeight="bold" sx={{ color: '#5856d6', lineHeight: 1 }}>
                {avgRating}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', mt: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= Math.round(avgRating)
                    ? <StarIcon key={star} sx={{ fontSize: 18, color: '#ff9800' }} />
                    : <StarBorderIcon key={star} sx={{ fontSize: 18, color: '#ff9800' }} />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                din {reviews.length} recenzii
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#e5e5ea' }} />

            {/* Distributie stele */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#6b6b6b', width: 8 }}>
                      {star}
                    </Typography>
                    <StarIcon sx={{ fontSize: 12, color: '#ff9800' }} />
                    <Box sx={{
                      flex: 1,
                      height: 6,
                      backgroundColor: '#f2f2f7',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <Box sx={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: '#ff9800',
                        borderRadius: 3,
                        transition: 'width 0.4s ease',
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6b6b6b', width: 20, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Lista recenzii */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#5856d6' }} />
          </Box>
        ) : reviews.length === 0 ? (
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
            <StarBorderIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
            <Typography variant="h6" sx={{ color: '#1c1c1e' }}>
              Nu ai primit nicio recenzie încă
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
              Recenziile apar după ce cumpărătorii confirmă primirea produselor.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviews.map((review, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  borderRadius: 3,
                  p: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    borderColor: '#5856d633',
                  },
                }}
              >
                {/* Produs vandut */}
                <Box sx={{
                  backgroundColor: '#f9f9fb',
                  border: '1px solid #e5e5ea',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon sx={{ fontSize: 14, color: '#5856d6' }} />
                    <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                      Produs vândut:
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                      {review.listingTitle}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: '#5856d6' }}>
                    {review.listingPrice} RON
                  </Typography>
                </Box>

                {/* Reviewer + stele */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#5856d6', width: 36, height: 36, fontSize: 14 }}>
                      {review.reviewerName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                        @{review.reviewerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#aeaeb2' }}>
                        {new Date(review.createdAt).toLocaleDateString('ro-RO', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stele */}
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= review.rating
                        ? <StarIcon key={star} sx={{ fontSize: 16, color: '#ff9800' }} />
                        : <StarBorderIcon key={star} sx={{ fontSize: 16, color: '#e5e5ea' }} />
                    ))}
                  </Box>
                </Box>

                {/* Comentariu */}
                {review.comment && (
                  <Typography
                    variant="body2"
                    sx={{ color: '#1c1c1e', mt: 1.5, lineHeight: 1.7 }}
                  >
                    "{review.comment}"
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default ProfileReviews;