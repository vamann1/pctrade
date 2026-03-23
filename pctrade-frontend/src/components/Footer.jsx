import { Box, Container, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ComputerIcon from '@mui/icons-material/Computer';

const CATEGORIES = [
  'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
  'Motherboard', 'PSU', 'Case', 'Cooling',
  'Monitor', 'Laptop', 'Full PC', 'Peripheral', 'Other'
];

const INFO_LINKS = [
  'Cum funcționează',
  'Siguranță',
  'Comisioane',
  'Termeni și condiții',
  'Politică confidențialitate',
];

const SUPPORT_LINKS = [
  'Centru de ajutor',
  'Contact',
  'Raportare problemă',
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      backgroundColor: '#f2f2f7',
      borderTop: '1px solid #e5e5ea',
      pt: 6,
      pb: 3,
      mt: 'auto',
    }}>
      <Container maxWidth="xl">

        {/* Cele 4 coloane */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 2fr 1.5fr 1.5fr' },
          gap: 4,
          mb: 5,
        }}>

          {/* Coloana 1 — Brand */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ComputerIcon sx={{ color: '#5856d6', fontSize: 26 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Re<span style={{ color: '#5856d6' }}>Spec</span>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6b6b6b', lineHeight: 1.8, maxWidth: 260 }}>
              Marketplace-ul tău de încredere pentru componente PC second-hand. Tranzacții sigure, prețuri corecte.
            </Typography>
          </Box>

          {/* Coloana 2 — Categorii */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
              Categorii
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {CATEGORIES.slice(0, 7).map((cat) => (
                  <Typography
                    key={cat}
                    variant="body2"
                    onClick={() => navigate(`/browse?category=${encodeURIComponent(cat)}`)}
                    sx={{
                      color: '#6b6b6b',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                      '&:hover': { color: '#5856d6' },
                    }}
                  >
                    {cat}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {CATEGORIES.slice(7).map((cat) => (
                  <Typography
                    key={cat}
                    variant="body2"
                    onClick={() => navigate(`/browse?category=${encodeURIComponent(cat)}`)}
                    sx={{
                      color: '#6b6b6b',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                      '&:hover': { color: '#5856d6' },
                    }}
                  >
                    {cat}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Coloana 3 — Informatii */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
              Informații
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {INFO_LINKS.map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    color: '#6b6b6b',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                    '&:hover': { color: '#5856d6' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Coloana 4 — Suport */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
              Suport
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {SUPPORT_LINKS.map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    color: '#6b6b6b',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                    '&:hover': { color: '#5856d6' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>

        </Box>

        <Divider sx={{ borderColor: '#e5e5ea', mb: 3 }} />

        {/* Bottom bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#aeaeb2' }}>
            © {new Date().getFullYear()} ReSpec. Toate drepturile rezervate.
          </Typography>
          <Typography variant="caption" sx={{ color: '#aeaeb2' }}>
            Făcut cu ❤️ în România
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;