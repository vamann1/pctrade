import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }
    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la înregistrare. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Box sx={{
          backgroundColor: '#0f1525',
          border: '1px solid #1e2a3a',
          borderRadius: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ComputerIcon sx={{ color: '#00bcd4', fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold" color="white">
              Pc<span style={{ color: '#00bcd4' }}>Trade</span>
            </Typography>
          </Box>

          <Typography variant="h6" color="white" fontWeight="bold">
            Creează un cont
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: -1 }}>
            Alătură-te comunității PcTrade
          </Typography>

          <Divider sx={{ borderColor: '#1e2a3a', width: '100%' }} />

          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
            />
            <TextField
              label="Parolă"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
            />
            <TextField
              label="Confirmă parola"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: '#00bcd4',
                textTransform: 'none',
                fontWeight: 'bold',
                mt: 1,
                '&:hover': { backgroundColor: '#0097a7' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Creează cont'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#888' }}>
            Ai deja cont?{' '}
            <RouterLink to="/login" style={{ color: '#00bcd4', textDecoration: 'none', fontWeight: 'bold' }}>
              Loghează-te
            </RouterLink>
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};

export default Register;