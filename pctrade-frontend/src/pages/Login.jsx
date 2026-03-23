import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider
} from '@mui/material';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Username sau parolă incorecte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      backgroundColor: '#f9f9fb',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <Container maxWidth="xs">
        <Box sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>

          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', mb: 1 }}
          >
            <img src="/logo1.svg" alt="ReSpec" style={{ height: 80 }} />
          </Box>

          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
            Bine ai revenit!
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b6b', mt: -1 }}>
            Loghează-te în contul tău
          </Typography>

          <Divider sx={{ borderColor: '#e5e5ea', width: '100%' }} />

          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />
            <TextField
              label="Parolă"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: '#5856d6',
                textTransform: 'none',
                fontWeight: 'bold',
                mt: 1,
                py: 1.2,
                '&:hover': { backgroundColor: '#4745c0' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Login'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
            Nu ai cont?{' '}
            <RouterLink to="/register" style={{ color: '#5856d6', textDecoration: 'none', fontWeight: 'bold' }}>
              Înregistrează-te
            </RouterLink>
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};

export default Login;