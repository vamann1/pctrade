import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container, Typography, Box,
  Select, MenuItem, FormControl,
  CircularProgress, Divider, Chip, TextField
} from '@mui/material';
import { getListings } from '../api/listings';
import ListingCard from '../components/ListingCard';
import mockListings from '../data/mockListings.json';

const CATEGORIES = [
  'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
  'Motherboard', 'PSU', 'Case', 'Cooling',
  'Monitor', 'Laptop', 'Full PC', 'Peripheral', 'Other'
];

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Acceptable', 'For Parts'];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const selectedCategories = categoryFromUrl ? categoryFromUrl.split(',') : [];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await getListings();
        setListings(data);
      } catch {
        console.warn('Backend indisponibil, folosim date mock.');
        setListings(mockListings);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const toggleCategory = (cat) => {
    const newList = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];

    const newParams = new URLSearchParams(searchParams);
    if (newList.length === 0) {
      newParams.delete('category');
    } else {
      newParams.set('category', newList.join(','));
    }
    setSearchParams(newParams);
  };

  const toggleCondition = (cond) =>
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );

  const filtered = listings
    .filter((l) => l.title.toLowerCase().includes(searchFromUrl.toLowerCase()))
    .filter((l) => selectedCategories.length === 0 || selectedCategories.some(cat => l.category === cat))
    .filter((l) => selectedConditions.length === 0 || selectedConditions.includes(l.condition))
    .filter((l) => priceMin === '' || l.price >= Number(priceMin))
    .filter((l) => priceMax === '' || l.price <= Number(priceMax))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', gap: '3%' }}>

          {/* ── SIDEBAR FILTRE ── */}
          <Box sx={{
            width: '18%',
            flexShrink: 0,
            backgroundColor: '#0f1525',
            border: '1px solid #1e2a3a',
            borderRadius: 2,
            p: 2.5,
            height: 'fit-content',
            position: 'sticky',
            top: 80,
          }}>
            <Typography variant="subtitle1" fontWeight="bold" color="white" mb={2}>
              Filtre
            </Typography>

            {/* Sortare */}
            <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
              Sortează
            </Typography>
            <FormControl size="small" fullWidth sx={{ mt: 1, mb: 3, backgroundColor: '#080d1a', borderRadius: 1 }}>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="newest">Cele mai noi</MenuItem>
                <MenuItem value="price_asc">Preț crescător</MenuItem>
                <MenuItem value="price_desc">Preț descrescător</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ borderColor: '#1e2a3a', mb: 2 }} />

            {/* Pret */}
            <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
              Preț (RON)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 3 }}>
            <TextField
              placeholder="Min"
              size="small"
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              inputProps={{ min: 0 }}
              sx={{
                backgroundColor: '#080d1a',
                borderRadius: 1,
                '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                '& input[type=number]': { MozAppearance: 'textfield' },
              }}
            />
            <TextField
              placeholder="Max"
              size="small"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              inputProps={{ min: 0 }}
              sx={{
                backgroundColor: '#080d1a',
                borderRadius: 1,
                '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                '& input[type=number]': { MozAppearance: 'textfield' },
              }}
            />
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a', mb: 2 }} />

            {/* Categorii */}
            <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
              Categorie
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1, mb: 3 }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  onClick={() => toggleCategory(cat)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: selectedCategories.includes(cat) ? '#00bcd4' : '#1e2a3a',
                    color: selectedCategories.includes(cat) ? '#000' : '#aaa',
                    fontWeight: selectedCategories.includes(cat) ? 'bold' : 'normal',
                    '&:hover': { backgroundColor: selectedCategories.includes(cat) ? '#00acc1' : '#2a3a4a' },
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ borderColor: '#1e2a3a', mb: 2 }} />

            {/* Stare */}
            <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
              Stare
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
              {CONDITIONS.map((cond) => (
                <Chip
                  key={cond}
                  label={cond}
                  size="small"
                  onClick={() => toggleCondition(cond)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: selectedConditions.includes(cond) ? '#00bcd4' : '#1e2a3a',
                    color: selectedConditions.includes(cond) ? '#000' : '#aaa',
                    fontWeight: selectedConditions.includes(cond) ? 'bold' : 'normal',
                    '&:hover': { backgroundColor: selectedConditions.includes(cond) ? '#00acc1' : '#2a3a4a' },
                  }}
                />
              ))}
            </Box>

          </Box>

          {/* ── GRID PRODUSE ── */}
          <Box sx={{ width: '79%', minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="white">
                {searchFromUrl ? `Rezultate pentru "${searchFromUrl}"` : 'Componente disponibile'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                {filtered.length} oferte găsite
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress sx={{ color: '#00bcd4' }} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Typography color="#888">Nicio ofertă găsită.</Typography>
              </Box>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
              }}>
                {filtered.map((listing) => (
                  <Box key={listing._id} sx={{ display: 'flex' }}>
                    <ListingCard listing={listing} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default Browse;