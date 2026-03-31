import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile, getUserStats } from '../api/user';
import { getSellerReviews } from '../api/reviews';
import {
  Box, Container, Typography, Avatar,
  CircularProgress, Divider, Chip, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VerifiedIcon from '@mui/icons-material/Verified';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileData, reviewsData, statsData] = await Promise.all([
          getPublicProfile(id),
          getSellerReviews(id),
          getUserStats(id),
        ]);
        setProfile(profileData);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (err) {
        console.error('Eroare la fetch profil public:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9fb' }}>
      <CircularProgress sx={{ color: '#5856d6' }} />
    </Box>
  );

  if (!profile) return null;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
    : null;

  const trustLevel = !avgRating ? null
    : avgRating >= 4.5 ? { label: 'Vânzător de încredere', color: '#34c759' }
    : avgRating >= 3.5 ? { label: 'Vânzător bun', color: '#ff9800' }
    : { label: 'Vânzător nou', color: '#6b6b6b' };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">

        {/* Card principal */}
        <Box sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          mb: 3,
        }}>
          
        {/* Header gradient */}
        <Box sx={{
          background: 'linear-gradient(135deg, #5856d6 0%, #4745c0 100%)',
          p: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}>
          <Avatar sx={{
            bgcolor: '#ffffff',
            color: '#5856d6',
            width: 80,
            height: 80,
            fontSize: 32,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            {profile.username?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
              {profile.username}
            </Typography>
            {memberSince && (
              <Typography variant="caption" sx={{ color: '#ffffff77' }}>
                Membru din {memberSince}
              </Typography>
            )}
            {/* Trust level */}
            {avgRating && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: `${trustLevel.color} !important` }} />}
                  label={trustLevel.label}
                  size="small"
                  sx={{
                    backgroundColor: trustLevel.color + '22',
                    color: trustLevel.color,
                    border: `1px solid ${trustLevel.color}44`,
                    fontWeight: 'bold',
                    fontSize: 11,
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Rating dreapta */}
          {avgRating && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#ff9800', lineHeight: 1 }}>
                {avgRating}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', mt: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= Math.round(avgRating)
                    ? <StarIcon key={star} sx={{ fontSize: 14, color: '#ff9800' }} />
                    : <StarBorderIcon key={star} sx={{ fontSize: 14, color: '#ff980066' }} />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                {reviews.length} recenzii
              </Typography>
            </Box>
          )}
        </Box>

        {/* Statistici — identice cu Profile.jsx */}
        {stats && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: '1px solid #e5e5ea',
          }}>
            {[
              { label: 'Anunțuri active', value: stats.activeListing, icon: <ListAltIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
              { label: 'Vânzări finalizate', value: stats.sales, icon: <ShoppingBagIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
              { label: 'Total vânzări', value: `${stats.totalRevenue} RON`, icon: <LocalOfferIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
            ].map((stat, i) => (
              <Box key={i} sx={{
                p: 3,
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid #e5e5ea' : 'none',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        </Box>

        {/* Sumar rating + distributie — identic cu ProfileReviews */}
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

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#6b6b6b', width: 8 }}>{star}</Typography>
                    <StarIcon sx={{ fontSize: 12, color: '#ff9800' }} />
                    <Box sx={{ flex: 1, height: 6, backgroundColor: '#f2f2f7', borderRadius: 3, overflow: 'hidden' }}>
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

        {/* Lista recenzii — identic cu ProfileReviews */}
        <Box sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 2 }}>
            Recenzii ({reviews.length})
          </Typography>

          {reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <StarBorderIcon sx={{ fontSize: 48, color: '#c7c7cc' }} />
              <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                Nicio recenzie încă
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
                  {review.listingTitle && (
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
                      {review.listingPrice && (
                        <Typography variant="caption" fontWeight="bold" sx={{ color: '#5856d6' }}>
                          {review.listingPrice} RON
                        </Typography>
                      )}
                    </Box>
                  )}

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
                    <Typography variant="body2" sx={{ color: '#1c1c1e', mt: 1.5, lineHeight: 1.7 }}>
                      "{review.comment}"
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>

      </Container>
    </Box>
  );
};

export default PublicProfile;