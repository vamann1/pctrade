import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Avatar, Button, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Box,
  TextField, Alert, CircularProgress
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getUserStats, deleteAccount } from '../api/user';
import { useState, useEffect } from 'react';

const QUICK_ACTIONS = [
  {
    icon: <ListAltIcon sx={{ fontSize: 28, color: '#5856d6' }} />,
    title: 'Anunțurile mele',
    desc: 'Vezi și gestionează anunțurile tale',
    path: '/profile/listings',
    accent: '#5856d6',
  },
  {
    icon: <FavoriteIcon sx={{ fontSize: 28, color: '#5856d6' }} />,
    title: 'Favorite',
    desc: 'Vezi anunțurile tale salvate',
    path: '/profile/favorites',
    accent: '#5856d6',
  },
  {
    icon: <PersonIcon sx={{ fontSize: 28, color: '#5856d6' }} />,
    title: 'Editează profil',
    desc: 'Actualizează datele profilului tău',
    path: '/profile/edit',
    accent: '#5856d6',
  },
  {
    icon: <ShoppingBagIcon sx={{ fontSize: 28, color: '#5856d6' }} />,
    title: 'Istoric tranzacții',
    desc: 'Vezi achizițiile și vânzările tale',
    path: '/profile/transactions',
    accent: '#5856d6',
  },
  {
    icon: <StarIcon sx={{ fontSize: 28, color: '#5856d6' }} />,
    title: 'Recenziile mele',
    desc: 'Vezi recenziile primite ca vânzător',
    path: '/profile/reviews',
    accent: '#5856d6',
  },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [stats, setStats] = useState({
    activeListing: 0,
    sales: 0,
    avgRating: null,
    totalRevenue: 0,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!deletePassword) {
      setDeleteError('Introdu parola curentă.');
      return;
    }
    setDeleteLoading(true);
    try {
      const userId = user?.id || user?._id;
      await deleteAccount(userId, deletePassword);
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Parolă incorectă.');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = user?.id || user?._id;
        const data = await getUserStats(userId);
        setStats(data);
      } catch (err) {
        console.error('Eroare la fetch statistici:', err);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <>
      <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="md">

          {/* ── Card principal profil ── */}
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
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff99' }}>
                  {user?.email}
                </Typography>
                {user?.createdAt && (
                  <Typography variant="caption" sx={{ color: '#ffffff77' }}>
                    Membru din {new Date(user.createdAt).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                  </Typography>
                )}
                {stats.avgRating && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: `${
                        stats.avgRating >= 4.5 ? '#34c759' :
                        stats.avgRating >= 3.5 ? '#ff9800' : '#6b6b6b'
                      } !important` }} />}
                      label={
                        stats.avgRating >= 4.5 ? 'Vânzător de încredere' :
                        stats.avgRating >= 3.5 ? 'Vânzător bun' : 'Vânzător nou'
                      }
                      size="small"
                      sx={{
                        backgroundColor: (
                          stats.avgRating >= 4.5 ? '#34c75922' :
                          stats.avgRating >= 3.5 ? '#ff980022' : '#6b6b6b22'
                        ),
                        color: (
                          stats.avgRating >= 4.5 ? '#34c759' :
                          stats.avgRating >= 3.5 ? '#ff9800' : '#6b6b6b'
                        ),
                        border: `1px solid ${
                          stats.avgRating >= 4.5 ? '#34c75944' :
                          stats.avgRating >= 3.5 ? '#ff980044' : '#6b6b6b44'
                        }`,
                        fontWeight: 'bold',
                        fontSize: 11,
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Rating dreapta */}
              {stats.avgRating && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#ff9800', lineHeight: 1 }}>
                    {stats.avgRating}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', mt: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= Math.round(stats.avgRating)
                        ? <StarIcon key={star} sx={{ fontSize: 14, color: '#ff9800' }} />
                        : <StarBorderIcon key={star} sx={{ fontSize: 14, color: '#ff980066' }} />
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                    Rating mediu
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Statistici */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid #e5e5ea',
            }}>
              {[
                { label: 'Anunțuri active', value: stats.activeListing, icon: <ListAltIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
                { label: 'Vânzări', value: stats.sales, icon: <ShoppingBagIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
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

            {/* Info cont */}
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{
                color: '#1c1c1e',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: 11,
              }}>
                Informații cont
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Username</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>{user?.username}</Typography>
              </Box>

              <Divider sx={{ borderColor: '#e5e5ea' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Email</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>{user?.email}</Typography>
              </Box>

              <Divider sx={{ borderColor: '#e5e5ea' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Tip cont</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>Persoană fizică</Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Acțiuni rapide ── */}
          <Typography variant="subtitle2" fontWeight="bold" sx={{
            color: '#6b6b6b',
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: 11,
            mb: 1.5,
            pl: 0.5,
          }}>
            Acțiuni rapide
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            mb: 3,
          }}>
            {QUICK_ACTIONS.map((item) => (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  borderRadius: 3,
                  p: 2.5,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 3,
                    backgroundColor: item.accent,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  },
                  '&:hover': {
                    boxShadow: `0 4px 16px ${item.accent}22`,
                    borderColor: `${item.accent}44`,
                    transform: 'translateY(-2px)',
                    '&::before': { opacity: 1 },
                  },
                }}
              >
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: `${item.accent}11`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.icon}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{
                  color: '#1c1c1e',
                  textAlign: 'center',
                  fontSize: 12,
                }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#6b6b6b',
                  textAlign: 'center',
                  fontSize: 11,
                  lineHeight: 1.4,
                }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Butoane */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: '#ff3b30',
                borderColor: '#ff3b3033',
                textTransform: 'none',
                py: 1.2,
                '&:hover': { backgroundColor: '#ff3b3011', borderColor: '#ff3b30' },
              }}
            >
              Deconectare
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DeleteForeverIcon />}
              onClick={() => setDeleteModal(true)}
              sx={{
                color: '#ff3b30',
                borderColor: '#ff3b3033',
                textTransform: 'none',
                py: 1.2,
                '&:hover': { backgroundColor: '#ff3b3011', borderColor: '#ff3b30' },
              }}
            >
              Șterge contul
            </Button>
          </Box>

        </Container>
      </Box>

      {/* Modal stergere cont */}
      <Dialog
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#ff3b30', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ color: '#ff3b30' }} />
          Șterge contul
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="warning">
            Această acțiune este ireversibilă! Toate datele tale vor fi șterse permanent.
          </Alert>
          {deleteError && <Alert severity="error">{deleteError}</Alert>}
          <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
            Introdu parola curentă pentru a confirma:
          </Typography>
          <TextField
            label="Parola curentă"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            fullWidth
            size="small"
            sx={{ backgroundColor: '#f9f9fb' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => { setDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
            sx={{ color: '#6b6b6b', textTransform: 'none' }}
          >
            Anulează
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            sx={{
              backgroundColor: '#ff3b30',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#d32f2f' },
            }}
          >
            {deleteLoading
              ? <CircularProgress size={20} sx={{ color: 'white' }} />
              : 'Șterge contul definitiv'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Profile;