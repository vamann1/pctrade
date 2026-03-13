import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addListing } from '../api/listings';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Proceseaza fisierul imagine
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

  // Click pe zona de upload
  const handleFileInput = (e) => {
  Array.from(e.target.files).forEach(processImageFile);
  if (fileInputRef.current) fileInputRef.current.value = '';
};

  // Drag & drop
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

  // Paste din clipboard
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
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      formData.append('price', Number(form.price));
      images.forEach((img) => formData.append('images', img.file)); // <-- schimbat

      await addListing(formData);
      setSuccess(true);
      setForm(INITIAL_FORM);
      setImages([]); // <-- schimbat
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la adăugarea ofertei. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Box sx={{
          backgroundColor: '#0f1525',
          border: '1px solid #1e2a3a',
          borderRadius: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AddCircleOutlineIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">
                Adaugă o ofertă
              </Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>
                Completează detaliile componentei tale
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#1e2a3a' }} />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Ofertă adăugată cu succes! Redirecționare...</Alert>}

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
              sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
            />

            {/* Categorie + Conditie */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" fullWidth sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}>
                <InputLabel>Categorie *</InputLabel>
                <Select name="category" value={form.category} onChange={handleChange} label="Categorie *">
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}>
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
                backgroundColor: '#080d1a',
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
                sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
              />
              <TextField
                label="Model"
                name="model"
                value={form.model}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="ex: ROG Strix B550-F"
                sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
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
              sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
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
                sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
              />
              {/* Contor caractere */}
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                  color: form.description.length < 50 ? '#f44336' : '#4caf50',
                }}
              >
                {form.description.length}/50 caractere minime
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a' }} />

            {/* Upload imagini */}
            <Box>
              <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                Imagini produs * (minim 1, maxim 3)
              </Typography>

              {/* Zona drag & drop — ascunde daca am 3 imagini */}
              {images.length < 3 && (
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    mt: 1,
                    border: `2px dashed ${isDragging ? '#00bcd4' : '#1e2a3a'}`,
                    borderRadius: 2,
                    backgroundColor: isDragging ? '#00bcd411' : '#080d1a',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#00bcd4', backgroundColor: '#00bcd411' },
                  }}
                >
                  <UploadFileIcon sx={{ fontSize: 36, color: isDragging ? '#00bcd4' : '#555' }} />
                  <Typography variant="body2" sx={{ color: isDragging ? '#00bcd4' : '#888' }}>
                    Trage imaginile aici sau apasă pentru a selecta
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#555' }}>
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

              {/* Preview imagini */}
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
                        border: '1px solid #1e2a3a',
                        backgroundColor: '#080d1a',
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
                      {/* Buton sterge */}
                      <Box
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: '#f44336',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#d32f2f' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14, color: 'white' }} />
                      </Box>

                      {/* Badge index */}
                      {index === 0 && (
                        <Box sx={{
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#00bcd4',
                          borderRadius: 1,
                          px: 0.8,
                          py: 0.2,
                        }}>
                          <Typography variant="caption" sx={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>
                            Principală
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a' }} />

            {/* Butoane */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/')}
                sx={{
                  color: '#888',
                  borderColor: '#1e2a3a',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#888' },
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
                  backgroundColor: '#00bcd4',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#0097a7' },
                }}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: 'white' }} />
                  : 'Publică oferta'
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