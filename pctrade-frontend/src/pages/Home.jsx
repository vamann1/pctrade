import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getListings } from '../api/listings';
import mockListings from '../data/mockListings.json';
import {
  Box, Container, Typography,
  Button, Divider
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListingCard from '../components/ListingCard';

/* Import Iconite Google */
import MemoryIcon from '@mui/icons-material/Memory';
import SearchIcon from '@mui/icons-material/Search';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import StorageIcon from '@mui/icons-material/Storage';
import SdCardIcon from '@mui/icons-material/SdCard';
import AlbumIcon from '@mui/icons-material/Album';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import BoltIcon from '@mui/icons-material/Bolt';
import ScreenshotIcon from '@mui/icons-material/Screenshot';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MonitorIcon from '@mui/icons-material/Monitor';
import LaptopIcon from '@mui/icons-material/Laptop';
import QuizIcon from '@mui/icons-material/Quiz'
import MouseIcon from '@mui/icons-material/Mouse';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';

const CATEGORIES = [
  { label: 'CPU', icon: <MemoryIcon sx={{ fontSize: 32, color: '#f44336' }} /> },
  { label: 'GPU', icon: <VideogameAssetIcon sx={{ fontSize: 32, color: '#9c27b0' }} /> },
  { label: 'RAM', icon: <StorageIcon sx={{ fontSize: 32, color: '#2196f3' }} /> },
  { label: 'SSD', icon: <SdCardIcon sx={{ fontSize: 32, color: '#ff9800' }} /> },
  { label: 'HDD', icon: <AlbumIcon sx={{ fontSize: 32, color: '#795548' }} /> },
  { label: 'Motherboard', icon: <DeveloperBoardIcon sx={{ fontSize: 32, color: '#4caf50' }} /> },
  { label: 'PSU', icon: <BoltIcon sx={{ fontSize: 32, color: '#ffeb3b' }} /> },
  { label: 'Case', icon: <ScreenshotIcon sx={{ fontSize: 32, color: '#607d8b' }} /> },
  { label: 'Cooling', icon: <AcUnitIcon sx={{ fontSize: 32, color: '#00bcd4' }} /> },
  { label: 'Monitor', icon: <MonitorIcon sx={{ fontSize: 32, color: '#3f51b5' }} /> },
  { label: 'Laptop', icon: <LaptopIcon sx={{ fontSize: 32, color: '#009688' }} /> },
  { label: 'Full PC', icon: <DevicesOtherIcon sx={{ fontSize: 32, color: '#ff5722' }} /> },
  { label: 'Peripheral', icon: <MouseIcon sx={{ fontSize: 32, color: '#e91e63' }} /> },
  { label: 'Other', icon: <QuizIcon sx={{ fontSize: 32, color: '#9e9e9e' }} /> },
];

const STATS = [
  { value: '12K+', label: 'Produse active' },
  { value: '5K+', label: 'Utilizatori' },
  { value: '99%', label: 'Satisfacție' },
];

const HOW_IT_WORKS = [
  {
    icon: <SearchIcon sx={{ fontSize: 32, color: '#5856d6' }} />,
    step: '01',
    title: 'Găsește',
    description: 'Caută componenta dorită din mii de anunțuri verificate.',
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: 32, color: '#5856d6' }} />,
    step: '02',
    title: 'Plătește sigur',
    description: 'Suma este blocată în escrow până confirmi funcționarea.',
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 32, color: '#5856d6' }} />,
    step: '03',
    title: 'Primești',
    description: 'Produsul ajunge la tine cu tracking în timp real.',
  },
  {
    icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#5856d6' }} />,
    step: '04',
    title: 'Confirmă',
    description: 'Testează și confirmă. Banii sunt eliberați vânzătorului.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getListings();
        setRecentListings([...data].reverse().slice(0, 6));
      } catch {
        console.warn('Backend indisponibil, folosim date mock.');
        setRecentListings([...mockListings].slice(0, 6));
      }
    };
    fetchRecent();
  }, []);

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════
          SECTIUNEA 1 — Hero
      ══════════════════════════════════════ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f2f2f7 100%)',
        borderBottom: '1px solid #e5e5ea',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(ellipse, #5856d615 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        <Container maxWidth="md">

          {/* Badge */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            backgroundColor: '#5856d611',
            border: '1px solid #5856d633',
            borderRadius: 10,
            px: 2,
            py: 0.6,
            mb: 3,
          }}>
            <VerifiedIcon sx={{ fontSize: 14, color: '#5856d6' }} />
            <Typography variant="caption" sx={{ color: '#5856d6', fontWeight: 'bold', letterSpacing: 1 }}>
              PLATĂ PROTEJATĂ PRIN ESCROW
            </Typography>
          </Box>

          {/* Titlu */}
          <Typography
            variant="h2"
            fontWeight="black"
            sx={{
              color: '#1c1c1e',
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Cumpără & Vinde<br />
            <span style={{ color: '#5856d6' }}>Componente PC</span>
          </Typography>

          {/* Subtitlu */}
          <Typography
            variant="h6"
            sx={{
              color: '#6b6b6b',
              fontWeight: 'normal',
              fontSize: { xs: '1rem', md: '1.15rem' },
              mb: 5,
              maxWidth: 560,
              mx: 'auto',
            }}
          >
            Marketplace-ul <strong style={{ color: '#1c1c1e' }}>#1 din România</strong> pentru hardware second-hand.
            Verificat, sigur, cu suport AI.
          </Typography>

          {/* Statistici */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 3, md: 6 },
            flexWrap: 'wrap',
          }}>
            {STATS.map((stat, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#5856d6' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

        </Container>
      </Box>

      {/* ══════════════════════════════════════
          SECTIUNEA 2 — Categorii + Recente
      ══════════════════════════════════════ */}
      <Box sx={{
        py: 8,
        backgroundColor: '#f2f2f7',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(ellipse, #5856d608 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        <Container maxWidth="xl">

          {/* Categorii */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Categorii
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/browse')}
              sx={{ color: '#5856d6', textTransform: 'none' }}
            >
              Vezi toate
            </Button>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1.5,
            mb: 8,
          }}>
            {CATEGORIES.map((cat) => (
              <Box
                key={cat.label}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.label)}`)}
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                    transform: 'translateY(-2px)',
                    borderColor: '#5856d633',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cat.icon}
                </Box>
                <Typography variant="caption" sx={{ color: '#1c1c1e', fontWeight: 'bold', textAlign: 'center' }}>
                  {cat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: '#e5e5ea', mb: 8 }} />

          {/* Adaugate recent */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Adăugate recent
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/browse')}
              sx={{ color: '#5856d6', textTransform: 'none' }}
            >
              Vezi toate
            </Button>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 2,
          }}>
            {recentListings.map((listing) => (
              <Box key={listing._id || listing.id} sx={{ display: 'flex' }}>
                <ListingCard listing={listing} />
              </Box>
            ))}
          </Box>

        </Container>
      </Box>

      {/* ══════════════════════════════════════
          SECTIUNEA 3 — Cum functioneaza
      ══════════════════════════════════════ */}
      <Box sx={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e5ea',
        py: 10,
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(ellipse, #5856d608 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        <Container maxWidth="lg">

          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1c1c1e' }} mb={1}>
              Cum funcționează
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b6b6b' }}>
              Simplu, sigur și transparent — de la căutare până la livrare.
            </Typography>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 3,
            position: 'relative',
          }}>
            {HOW_IT_WORKS.map((step, i) => (
              <Box key={i} sx={{ position: 'relative' }}>

                {/* Linie de conectare */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <Box sx={{
                    position: 'absolute',
                    top: 28,
                    right: -16,
                    width: 32,
                    height: 1,
                    backgroundColor: '#e5e5ea',
                    zIndex: 0,
                  }} />
                )}

                <Box sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  borderRadius: 3,
                  p: 3,
                  height: '100%',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)',
                    borderColor: '#5856d633',
                  },
                }}>
                  {/* Numar pas */}
                  <Typography sx={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: '#5856d6',
                    letterSpacing: 2,
                    mb: 1.5,
                  }}>
                    {step.step}
                  </Typography>

                  {/* Icon */}
                  <Box sx={{ mb: 2 }}>{step.icon}</Box>

                  {/* Titlu */}
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }} mb={1}>
                    {step.title}
                  </Typography>

                  {/* Descriere */}
                  <Typography variant="body2" sx={{ color: '#6b6b6b', lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

        </Container>
      </Box>

    </Box>
  );
};

export default Home;