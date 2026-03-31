import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/user';
import { forgotPassword, resetPassword } from '../api/auth';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockResetIcon from '@mui/icons-material/LockReset';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset parola modal
  const [resetModal, setResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [resetStep, setResetStep] = useState(0);
  const [resetCode, setResetCode] = useState('');
  const [displayCode, setDisplayCode] = useState(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const updates = {};
      if (username !== user?.username) updates.username = username;
      if (email !== user?.email) updates.email = email;

      if (Object.keys(updates).length === 0) {
        setError('Nu ai modificat nimic.');
        setLoading(false);
        return;
      }

      const updatedUser = await updateUser(user?.id || user?._id, updates);
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

  const handleSendResetCode = async () => {
    setResetError(null);
    setResetLoading(true);
    try {
      const data = await forgotPassword(resetEmail);
      setDisplayCode(data.code);
      setResetStep(1);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Eroare la generarea codului.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetError(null);
    if (!resetCode) { setResetError('Introdu codul.'); return; }
    if (resetNewPassword.length < 6) { setResetError('Parola trebuie să aibă cel puțin 6 caractere.'); return; }
    if (resetNewPassword !== resetConfirmPassword) { setResetError('Parolele nu coincid.'); return; }
    setResetLoading(true);
    try {
      await resetPassword(resetCode, resetNewPassword);
      setResetSuccess(true);
      setTimeout(() => {
        setResetModal(false);
        setResetStep(0);
        setResetSuccess(false);
      }, 2000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Cod invalid sau expirat.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseResetModal = () => {
    setResetModal(false);
    setResetStep(0);
    setResetCode('');
    setDisplayCode(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError(null);
    setResetSuccess(false);
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

            {/* Sectiune parola */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                  Parolă
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                  Schimbă parola contului tău
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<LockResetIcon />}
                onClick={() => setResetModal(true)}
                sx={{
                  color: '#5856d6',
                  borderColor: '#5856d644',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#5856d611', borderColor: '#5856d6' },
                }}
              >
                Resetează parola
              </Button>
            </Box>

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
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
                {loading
                  ? <CircularProgress size={22} sx={{ color: 'white' }} />
                  : 'Salvează modificările'
                }
              </Button>
            </Box>

          </Box>
        </Box>
      </Container>

      {/* Modal resetare parola */}
      <Dialog
        open={resetModal}
        onClose={handleCloseResetModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockResetIcon sx={{ color: '#5856d6' }} />
          Resetare parolă
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

          {resetError && <Alert severity="error">{resetError}</Alert>}
          {resetSuccess && <Alert severity="success">Parolă schimbată cu succes!</Alert>}

          {resetStep === 0 && (
            <>
              <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                Vom genera un cod de resetare pentru emailul asociat contului tău.
              </Typography>
              <TextField
                label="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb' }}
              />
            </>
          )}

          {resetStep === 1 && (
            <>
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
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#5856d6', letterSpacing: 4 }}>
                    {displayCode}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aeaeb2' }}>
                    Valabil 15 minute
                  </Typography>
                </Box>
              )}
              <TextField
                label="Cod de resetare"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ maxLength: 6 }}
                sx={{ backgroundColor: '#f9f9fb' }}
              />
              <TextField
                label="Parolă nouă"
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb' }}
              />
              <TextField
                label="Confirmă parola nouă"
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb' }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleCloseResetModal}
            sx={{ color: '#6b6b6b', textTransform: 'none' }}
          >
            Anulează
          </Button>
          {resetStep === 0 && (
            <Button
              variant="contained"
              onClick={handleSendResetCode}
              disabled={resetLoading}
              sx={{
                backgroundColor: '#5856d6',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#4745c0' },
              }}
            >
              {resetLoading
                ? <CircularProgress size={20} sx={{ color: 'white' }} />
                : 'Generează cod'
              }
            </Button>
          )}
          {resetStep === 1 && (
            <Button
              variant="contained"
              onClick={handleResetPassword}
              disabled={resetLoading || resetSuccess}
              sx={{
                backgroundColor: '#5856d6',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#4745c0' },
              }}
            >
              {resetLoading
                ? <CircularProgress size={20} sx={{ color: 'white' }} />
                : 'Schimbă parola'
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default EditProfile;