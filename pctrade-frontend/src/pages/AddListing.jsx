import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addListing, uploadListingImages } from '../api/listings';
import {
  Box, Container, Typography, TextField,
  Button, Alert, CircularProgress, Divider,
  Select, MenuItem, FormControl, InputLabel,
  InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';

const CATEGORIES = [
  'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
  'Motherboard', 'PSU', 'Case', 'Cooling',
  'Monitor', 'Laptop', 'Full PC', 'Peripheral', 'Other'
];

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Acceptable', 'For Parts'];

const INITIAL_FORM = {
  title: '',
  category: '',
  condition: '',
  price: '',
  description: '',
  brand: '',
  model: '',
  location: '',
};

const AddListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Fișierul selectat nu este o imagine.');
      return;
    }
    if (images.length >= 3) {
      setError('Poți adăuga maxim 3 imagini.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) =>
      setImages((prev) => [...prev, { file, preview: e.target.result }]);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleFileInput = (e) => {
    Array.from(e.target.files).forEach(processImageFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files[0]);
  }, []);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        processImageFile(item.getAsFile());
        break;
      }
    }
  }, []);

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (form.description.length < 50) {
      setError(`Descrierea trebuie să aibă cel puțin 50 de caractere. (${form.description.length}/50)`);
      return;
    }
    if (images.length === 0) {
      setError('Te rugăm adaugă cel puțin o imagine.');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        title: form.title,
        category: form.category,
        condition: form.condition,
        price: Number(form.price),
        description: form.description,
        brand: form.brand || null,
        model: form.model || null,
        location: form.location || null,
        sellerId: user?.id || user?._id,
      };

      const createdListing = await addListing(listingData);
      await uploadListingImages(createdListing.id, images);

      setSuccess(true);
      setForm(INITIAL_FORM);
      setImages([]);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la adăugarea anunțului. Încearcă din nou.');
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AddCircleOutlineIcon sx={{ color: '#5856d6', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Adaugă un anunț
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                Completează detaliile componentei tale
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#e5e5ea' }} />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Anunț adăugat cu succes! Redirecționare...</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            onPaste={handlePaste}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >

            {/* Titlu */}
            <TextField
              label="Titlu *"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="ex: Intel Core i7-12700K"
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            {/* Categorie + Conditie */}
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

            {/* Pret */}
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

            {/* Brand + Model */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="ex: Intel, ASUS..."
                sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
              />
              <TextField
                label="Model"
                name="model"
                value={form.model}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="ex: ROG Strix B550-F"
                sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
              />
            </Box>

            {/* Locatie */}
            <TextField
              label="Locație"
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="ex: București, Cluj-Napoca..."
              sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
            />

            {/* Descriere */}
            <Box>
              <TextField
                label="Descriere *"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                size="small"
                placeholder="Descrie starea componentei, specificații, motive de vânzare... (minim 50 caractere)"
                sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                  color: form.description.length < 50 ? '#ff3b30' : '#34c759',
                }}
              >
                {form.description.length}/50 caractere minime
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            {/* Upload imagini */}
            <Box>
              <Typography variant="caption" sx={{ color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Imagini produs * (minim 1, maxim 3)
              </Typography>

              {images.length < 3 && (
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    mt: 1,
                    border: `2px dashed ${isDragging ? '#5856d6' : '#e5e5ea'}`,
                    borderRadius: 2,
                    backgroundColor: isDragging ? '#5856d608' : '#f9f9fb',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#5856d6', backgroundColor: '#5856d608' },
                  }}
                >
                  <UploadFileIcon sx={{ fontSize: 36, color: isDragging ? '#5856d6' : '#c7c7cc' }} />
                  <Typography variant="body2" sx={{ color: isDragging ? '#5856d6' : '#6b6b6b' }}>
                    Trage imaginile aici sau apasă pentru a selecta
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aeaeb2' }}>
                    Poți și să lipești (Ctrl+V) • {images.length}/3 imagini adăugate
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                </Box>
              )}

              {images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                  {images.map((img, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        overflow: 'visible',
                        border: '1px solid #e5e5ea',
                        backgroundColor: '#f9f9fb',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: 8,
                          padding: 4,
                        }}
                      />
                      <Box
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: '#ff3b30',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#d32f2f' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14, color: 'white' }} />
                      </Box>

                      {index === 0 && (
                        <Box sx={{
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#5856d6',
                          borderRadius: 1,
                          px: 0.8,
                          py: 0.2,
                        }}>
                          <Typography variant="caption" sx={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                            Principală
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: '#e5e5ea' }} />

            {/* Butoane */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/')}
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
                  : 'Publică Anunțul'
                }
              </Button>
            </Box>

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AddListing;