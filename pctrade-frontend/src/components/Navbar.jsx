import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Menu, MenuItem, Avatar, Divider,
  InputBase, Chip, Badge
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { useNotifications } from '../context/NotificationsContext';
import { getUnreadMessagesCount } from '../api/messages';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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

  const [messageCount, setMessageCount] = useState(0);

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

  useEffect(() => {
  if (!user) {
    setMessageCount(0);
    return;
  }
  const fetchMessageCount = async () => {
    try {
      const userId = user?.id || user?._id;
      const count = await getUnreadMessagesCount(userId);
      setMessageCount(count);
    } catch {
      setMessageCount(0);
    }
  };
  fetchMessageCount();
}, [user]);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>

        {/* Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexShrink: 0 }}
        >
          <img src="/RESPEC_gradient.svg" alt="ReSpec" style={{ height: 48 }} />
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
            backgroundColor: '#f2f2f7',
            border: '1px solid #1c1c1e44',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            '&:focus-within': { borderColor: '#5856d6' },
            transition: 'border-color 0.2s',
          }}
        >
          <SearchIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Caută componente, periferice, laptopuri..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ color: '#1c1c1e', flex: 1, fontSize: 14 }}
          />
        </Box>

        {/* Dreapta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {user ? (
          <>

        {/* Buton notificari */}
        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount} sx={{
            '& .MuiBadge-badge': { backgroundColor: '#5856d6', color: 'white', fontSize: 10 }
          }}>
            <NotificationsIcon sx={{ color: '#1c1c1e', fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
              color: '#1c1c1e',
              width: 360,
              maxHeight: 480,
              border: '1px solid #e5e5ea',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* Header notificari */}
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5ea' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Notificări
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  sx={{ ml: 1, backgroundColor: '#5856d611', color: '#5856d6', height: 20, fontSize: 11 }}
                />
              )}
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                onClick={markAllAsRead}
                sx={{ color: '#5856d6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Marchează toate citite
              </Typography>
            )}
          </Box>

          {/* Lista notificari */}
          {notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Nicio notificare</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box
                key={notif._id}
                onClick={() => {
                  markAsRead(notif.id || notif._id);
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
                  backgroundColor: notif.read ? 'transparent' : '#5856d608',
                  borderBottom: '1px solid #e5e5ea',
                  '&:hover': { backgroundColor: '#f2f2f7' },
                  transition: 'background-color 0.15s',
                }}
              >
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
                  <Typography variant="body2" sx={{ color: notif.read ? '#6b6b6b' : '#1c1c1e', lineHeight: 1.4 }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aeaeb2', mt: 0.3, display: 'block' }}>
                    {formatNotifTime(notif.createdAt)}
                  </Typography>
                </Box>

                {!notif.read && (
                  <CircleIcon sx={{ fontSize: 8, color: '#5856d6', flexShrink: 0, mt: 0.5 }} />
                )}
              </Box>
            ))
          )}
        </Menu>

            {/* Buton mesaje */}
            <IconButton onClick={() => navigate('/messages')}>
              <Badge badgeContent={messageCount} sx={{
                '& .MuiBadge-badge': { backgroundColor: '#5856d6', color: 'white', fontSize: 10 }
              }}>
                <ChatIcon sx={{ color: '#1c1c1e', fontSize: 22 }} />
              </Badge>
            </IconButton>

            {/* Buton Adauga Anunț*/}
            <Button
              component={RouterLink}
              to="/add-listing"
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: '#1c1c1e',
                borderColor: '#1c1c1e44',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#f2f2f7', borderColor: '#1c1c1e' },
              }}
            >
              Adaugă anunț
            </Button>

            <Button
              component={RouterLink}
              to="/ai-assistant"
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              sx={{
                color: '#5856d6',
                borderColor: '#5856d644',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5856d611', borderColor: '#5856d6' },
              }}
            >
              AI Assistant
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
              PaperProps={{
                sx: {
                  backgroundColor: '#ffffff',
                  color: '#1c1c1e',
                  minWidth: 200,
                  border: '1px solid #e5e5ea',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                }
              }}
            >
              <MenuItem disabled sx={{ opacity: 0.6, fontSize: 13, color: '#6b6b6b' }}>
                {user.username}
              </MenuItem>
              <Divider sx={{ borderColor: '#e5e5ea' }} />
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleMenuClose}
                sx={{ color: '#1c1c1e', '&:hover': { backgroundColor: '#f2f2f7' } }}
              >
                Profilul meu
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/profile/listings"
                onClick={handleMenuClose}
                sx={{ color: '#1c1c1e', '&:hover': { backgroundColor: '#f2f2f7' } }}
              >
                Anunțurile mele
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/profile/edit"
                onClick={handleMenuClose}
                sx={{ color: '#1c1c1e', '&:hover': { backgroundColor: '#f2f2f7' } }}
              >
                Editează profilul
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/profile/transactions"
                onClick={handleMenuClose}
                sx={{ color: '#1c1c1e', '&:hover': { backgroundColor: '#f2f2f7' } }}
              >
                Istoric tranzacții
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/profile/reviews"
                onClick={handleMenuClose}
                sx={{ color: '#1c1c1e', '&:hover': { backgroundColor: '#f2f2f7' } }}
              >
                Recenziile mele
              </MenuItem>
              <Divider sx={{ borderColor: '#e5e5ea' }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ color: '#ff3b30', '&:hover': { backgroundColor: '#ff3b3011' } }}
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
            variant="outlined"
            sx={{
              color: '#1c1c1e',
              borderColor: '#1c1c1e44',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#f2f2f7', borderColor: '#1c1c1e' },
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            sx={{
              backgroundColor: '#5856d6',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#4745c0' },
            }}
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