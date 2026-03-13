import { useState } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Menu, MenuItem, Avatar, Divider,
  InputBase, Chip, Badge
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { useNotifications } from '../context/NotificationsContext';

const notifIcon = (type) => {
  switch (type) {
    case 'price_offer': return '💰';
    case 'new_message': return '💬';
    case 'offer_accepted': return '✅';
    case 'offer_rejected': return '❌';
    case 'purchase_request': return '🛒';
    default: return '🔔';
  }
};

const notifIconBg = (type) => {
  switch (type) {
    case 'price_offer': return '#00bcd422';
    case 'new_message': return '#2196f322';
    case 'offer_accepted': return '#4caf5022';
    case 'offer_rejected': return '#f4433622';
    case 'purchase_request': return '#ff980022';
    default: return '#1e2a3a';
  }
};

const formatNotifTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'Acum';
  if (diff < 60) return `${diff} min în urmă`;
  const diffH = Math.floor(diff / 60);
  if (diffH < 24) return `${diffH}h în urmă`;
  return new Date(dateStr).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#0a0f1e' }}>
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>

        {/* Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexShrink: 0 }}
        >
          <ComputerIcon sx={{ color: '#00bcd4', fontSize: 30 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
            PC<span style={{ color: '#00bcd4' }}>Trade</span>
          </Typography>
        </Box>

        {/* Searchbar centrat */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            flex: 1,
            maxWidth: 500,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0f1525',
            border: '1px solid #1e2a3a',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            '&:focus-within': { borderColor: '#00bcd4' },
            transition: 'border-color 0.2s',
          }}
        >
          <SearchIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Caută componente, periferice, laptopuri..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ color: 'white', flex: 1, fontSize: 14 }}
          />
        </Box>

        {/* Dreapta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {user ? (
          <>
        {/* Buton notificari */}
        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount} sx={{
            '& .MuiBadge-badge': { backgroundColor: '#f44336', color: 'white', fontSize: 10 }
          }}>
            <NotificationsIcon sx={{ color: 'white', fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          PaperProps={{
            sx: {
              backgroundColor: '#1a1f2e',
              color: 'white',
              width: 360,
              maxHeight: 480,
              border: '1px solid #1e2a3a',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Header */}
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e2a3a' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Notificări
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  sx={{ ml: 1, backgroundColor: '#f4433622', color: '#f44336', height: 20, fontSize: 11 }}
                />
              )}
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                onClick={markAllAsRead}
                sx={{ color: '#00bcd4', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Marchează toate citite
              </Typography>
            )}
          </Box>

          {/* Lista notificari */}
          {notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="#555">Nicio notificare</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box
                key={notif._id}
                onClick={() => {
                  markAsRead(notif._id);
                  setNotifAnchorEl(null);
                  navigate(notif.link);
                }}
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  backgroundColor: notif.read ? 'transparent' : '#00bcd408',
                  borderBottom: '1px solid #1e2a3a',
                  '&:hover': { backgroundColor: '#ffffff08' },
                  transition: 'background-color 0.15s',
                }}
              >
                {/* Icon tip notificare */}
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: notifIconBg(notif.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 16,
                }}>
                  {notifIcon(notif.type)}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: notif.read ? '#888' : 'white', lineHeight: 1.4 }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#555', mt: 0.3, display: 'block' }}>
                    {formatNotifTime(notif.createdAt)}
                  </Typography>
                </Box>

                {/* Punct albastru daca necitita */}
                {!notif.read && (
                  <CircleIcon sx={{ fontSize: 8, color: '#00bcd4', flexShrink: 0, mt: 0.5 }} />
                )}
              </Box>
            ))
          )}
        </Menu>

        {/* Buton mesaje */}
        <IconButton onClick={() => navigate('/messages')}>
          <Badge badgeContent={2} sx={{
            '& .MuiBadge-badge': { backgroundColor: '#00bcd4', color: '#000', fontSize: 10 }
          }}>
            <ChatIcon sx={{ color: 'white', fontSize: 22 }} />
          </Badge>
        </IconButton>

            <Button
              component={RouterLink}
              to="/add-listing"
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ color: '#00bcd4', borderColor: '#00bcd4', textTransform: 'none' }}
            >
              Adaugă ofertă
            </Button>

            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: '#00bcd4', width: 35, height: 35, fontSize: 16 }}>
                {user.username?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { backgroundColor: '#1a1f2e', color: 'white', minWidth: 180 } }}
            >
              <MenuItem disabled sx={{ opacity: 0.6, fontSize: 13 }}>
                {user.username}
              </MenuItem>
              <Divider sx={{ borderColor: '#333' }} />
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleMenuClose}
                sx={{ '&:hover': { backgroundColor: '#00bcd420' } }}
              >
                Profilul meu
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ color: '#f44336', '&:hover': { backgroundColor: '#f4433620' } }}
              >
                Deconectare
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              component={RouterLink}
              to="/login"
              sx={{ color: 'white', textTransform: 'none' }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              sx={{ backgroundColor: '#00bcd4', textTransform: 'none', '&:hover': { backgroundColor: '#0097a7' } }}
            >
              Register
            </Button>
          </>
        )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;