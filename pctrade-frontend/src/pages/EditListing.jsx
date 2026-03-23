import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getListingById, updateListing } from '../api/listings';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider,
  Select, MenuItem, FormControl, InputLabel,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CATEGORIES = [
  'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
  'Motherboard', 'PSU', 'Case', 'Cooling',
  'Monitor', 'Laptop', 'Full PC', 'Peripheral', 'Other'
];

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Acceptable', 'For Parts'];

const EditListing = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: '',
    condition: '',
    price: '',
    description: '',
    brand: '',
    model: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id);
        // Verificam ca userul e proprietarul
        if (data.seller?.id !== (user?.id || user?._id)) {
          navigate('/profile/listings');
          return;
        }
        setForm({
          title: data.title || '',
          category: data.category || '',
          condition: data.condition || '',
          price: data.price || '',
          description: data.description || '',
          brand: data.brand || '',
          model: data.model || '',
          location: data.location || '',
        });
      } catch {
        setError('Anunțul nu a fost găsit.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.category || !form.condition || !form.price) {
      setError('Te rugăm completează toate câmpurile obligatorii.');
      return;
    }
    if (isNaN(form.price) || Number(form.price) <= 0) {
      setError('Prețul trebuie să fie un număr pozitiv.');
      return;
    }

    setSaving(true);
    try {
      await updateListing(id, {
        title: form.title,
        category: form.category,
        condition: form.condition,
        price: Number(form.price),
        description: form.description,
        brand: form.brand || null,
        model: form.model || null,
        location: form.location || null,
      });
      setSuccess(true);
      setTimeout(() => navigate('/profile/listings'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la actualizarea anunțului.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress sx={{ color: '#5856d6' }} />
    </Box>
  );

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
              onClick={() => navigate('/profile/listings')}
              sx={{ color: '#6b6b6b', textTransform: 'none', '&:hover': { color: '#1c1c1e' } }}
            >
              Înapoi
            </Button>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Editează anunțul
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                Modifică detaliile anunțului tău
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#e5e5ea' }} />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Anunț actualizat cu succes! Redirecționare...</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            <TextField
              label="Titlu *"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" fullWidth sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}>
                <InputLabel>Categorie *</InputLabel>
                <Select name="category" value={form.category} onChange={handleChange} label="Categorie *">
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}>
                <InputLabel>Stare *</InputLabel>
                <Select name="condition" value={form.condition} onChange={handleChange} label="Stare *">
                  {CONDITIONS.map((cond) => (
                    <MenuItem key={cond} value={cond}>{cond}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Preț *"
              name="price"
              value={form.price}
              onChange={handleChange}
              fullWidth
              size="small"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">RON</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
              sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: 1,
                '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                '& input[type=number]': { MozAppearance: 'textfield' },
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
              />
              <TextField
                label="Model"
                name="model"
                value={form.model}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
              />
            </Box>

            <TextField
              label="Locație"
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            <TextField
              label="Descriere *"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              size="small"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/profile/listings')}
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
                disabled={saving || success}
                sx={{
                  backgroundColor: '#5856d6',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#4745c0' },
                }}
              >
                {saving ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Salvează modificările'}
              </Button>
            </Box>

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EditListing;