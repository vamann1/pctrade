import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email sau parolă incorecte.');
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
            Bine ai revenit!
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: -1 }}>
            Loghează-te în contul tău
          </Typography>

          <Divider sx={{ borderColor: '#1e2a3a', width: '100%' }} />

          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Login'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#888' }}>
            Nu ai cont?{' '}
            <RouterLink to="/register" style={{ color: '#00bcd4', textDecoration: 'none', fontWeight: 'bold' }}>
              Înregistrează-te
            </RouterLink>
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};

export default Login;