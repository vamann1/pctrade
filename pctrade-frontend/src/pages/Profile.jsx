import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Container, Typography, Avatar, Button, Divider
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
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
          {/* Header cu avatar */}
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
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                {user?.username}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ffffff99' }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {/* Statistici */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: '1px solid #e5e5ea',
          }}>
            {[
              { label: 'Anunțuri active', value: '0', icon: <ListAltIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
              { label: 'Vânzări', value: '0', icon: <ShoppingBagIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
              { label: 'Rating', value: '—', icon: <StarIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
              { label: 'Total vânzări', value: '0 RON', icon: <LocalOfferIcon sx={{ color: '#5856d6', fontSize: 20 }} /> },
            ].map((stat, i) => (
              <Box
                key={i}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRight: i < 3 ? '1px solid #e5e5ea' : 'none',
                }}
              >
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
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
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

        {/* Actiuni rapide */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          mb: 3,
        }}>
          <Box
            onClick={() => navigate('/profile/listings')}
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 3,
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: '#5856d633', transform: 'translateY(-2px)' },
            }}
          >
            <ListAltIcon sx={{ fontSize: 32, color: '#5856d6' }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Anunțurile mele
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b6b6b', textAlign: 'center' }}>
              Vezi și gestionează anunțurile tale
            </Typography>
          </Box>

          <Box
            onClick={() => navigate('/add-listing')}
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 3,
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: '#5856d633', transform: 'translateY(-2px)' },
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 32, color: '#5856d6' }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Adaugă ofertă
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b6b6b', textAlign: 'center' }}>
              Publică un anunț nou
            </Typography>
          </Box>

          <Box
            onClick={() => navigate('/profile/edit')}
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 3,
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: '#5856d633', transform: 'translateY(-2px)' },
            }}
          >
            <PersonIcon sx={{ fontSize: 32, color: '#5856d6' }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Editează profil
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b6b6b', textAlign: 'center' }}>
              Actualizează datele tale
            </Typography>
          </Box>

          <Box
            onClick={() => navigate('/profile/transactions')}
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 3,
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: '#5856d633', transform: 'translateY(-2px)' },
            }}
          >
            <ShoppingBagIcon sx={{ fontSize: 32, color: '#5856d6' }} />
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Istoric tranzacții
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b6b6b', textAlign: 'center' }}>
              Vezi achizițiile și vânzările tale
            </Typography>
          </Box>
        </Box>

        {/* Buton deconectare */}
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

      </Container>
    </Box>
  );
};

export default Profile;