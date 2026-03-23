import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/user';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password && password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }
    if (password && password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setLoading(true);
    try {
      const updates = {};
      if (username !== user?.username) updates.username = username;
      if (email !== user?.email) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        setError('Nu ai modificat nimic.');
        setLoading(false);
        return;
      }

      const updatedUser = await updateUser(user?.id || user?._id, updates);

      // Actualizam userul in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Eroare la actualizarea profilului.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Box sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profile')}
              sx={{ color: '#6b6b6b', textTransform: 'none', '&:hover': { color: '#1c1c1e' } }}
            >
              Înapoi
            </Button>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Editează profilul
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                Actualizează datele contului tău
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#e5e5ea' }} />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Profil actualizat cu succes! Redirecționare...</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Username */}
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            {/* Email */}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
              Lăsați câmpurile de parolă goale dacă nu doriți să o schimbați.
            </Typography>

            {/* Parola noua */}
            <TextField
              label="Parolă nouă"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            {/* Confirma parola */}
            <TextField
              label="Confirmă parola nouă"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/profile')}
                sx={{
                  color: '#6b6b6b',
                  borderColor: '#e5e5ea',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#1c1c1e', color: '#1c1c1e' },
                }}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || success}
                sx={{
                  backgroundColor: '#5856d6',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#4745c0' },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Salvează modificările'}
              </Button>
            </Box>

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EditProfile;