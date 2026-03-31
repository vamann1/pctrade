import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api/auth';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0 = email, 1 = cod + parola noua
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [displayCode, setDisplayCode] = useState(null); // codul afisat pentru demo
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Introdu adresa de email.');
      return;
    }
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setDisplayCode(data.code);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la trimiterea codului.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (!code) {
      setError('Introdu codul primit.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(code, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cod invalid sau expirat.');
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
          <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', mb: 1 }}>
            <img src="/logo1.svg" alt="ReSpec" style={{ height: 80 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockResetIcon sx={{ color: '#5856d6', fontSize: 24 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Resetare parolă
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#e5e5ea', width: '100%' }} />

          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%' }}>Parolă schimbată cu succes! Redirecționare...</Alert>}

          {/* Step 0 — Email */}
          {step === 0 && (
            <Box component="form" onSubmit={handleSendCode} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#6b6b6b', textAlign: 'center' }}>
                Introdu emailul asociat contului tău și îți vom genera un cod de resetare.
              </Typography>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb' }}
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
                  py: 1.2,
                  '&:hover': { backgroundColor: '#4745c0' },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Generează cod'}
              </Button>
            </Box>
          )}

          {/* Step 1 — Cod + Parola noua */}
          {step === 1 && (
            <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Afisam codul pentru demo */}
              {displayCode && (
                <Box sx={{
                  backgroundColor: '#5856d611',
                  border: '1px solid #5856d633',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                }}>
                  <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block' }}>
                    Codul tău de resetare (demo):
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#5856d6', letterSpacing: 4, mt: 0.5 }}>
                    {displayCode}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aeaeb2' }}>
                    Valabil 15 minute
                  </Typography>
                </Box>
              )}

              <TextField
                label="Cod de resetare"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                fullWidth
                size="small"
                placeholder="ex: 123456"
                inputProps={{ maxLength: 6 }}
                sx={{ backgroundColor: '#f9f9fb' }}
              />
              <TextField
                label="Parolă nouă"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb' }}
              />
              <TextField
                label="Confirmă parola nouă"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb' }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || success}
                sx={{
                  backgroundColor: '#5856d6',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.2,
                  '&:hover': { backgroundColor: '#4745c0' },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Schimbă parola'}
              </Button>
              <Button
                onClick={() => { setStep(0); setError(null); setDisplayCode(null); }}
                sx={{ color: '#6b6b6b', textTransform: 'none' }}
              >
                ← Înapoi
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
            Ți-ai amintit parola?{' '}
            <RouterLink to="/login" style={{ color: '#5856d6', textDecoration: 'none', fontWeight: 'bold' }}>
              Loghează-te
            </RouterLink>
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;