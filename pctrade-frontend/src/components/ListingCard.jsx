import { useNavigate } from 'react-router-dom';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Chip, Box
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

const categoryColors = {
  CPU: '#f44336',
  GPU: '#9c27b0',
  RAM: '#2196f3',
  SSD: '#ff9800',
  HDD: '#795548',
  Motherboard: '#4caf50',
  PSU: '#ffeb3b',
  Case: '#607d8b',
  Cooling: '#00bcd4',
  Monitor: '#3f51b5',
  Laptop: '#009688',
  'Full PC': '#ff5722',
  Peripheral: '#e91e63',
  Other: '#9e9e9e',
};

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const chipColor = categoryColors[listing.category] || '#9e9e9e';

  return (
    <Card
      sx={{
        backgroundColor: '#0f1525',
        border: '1px solid #1e2a3a',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: '#00bcd4',
        },
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
      onClick={() => navigate(`/listing/${listing._id}`)}
    >
      {/* Imagine — inaltime fixa */}
      {listing.imageUrl ? (
        <CardMedia
          component="img"
          image={listing.imageUrl}
          alt={listing.title}
          sx={{ height: 180, objectFit: 'contain', backgroundColor: '#080d1a', p: 1 }}
        />
      ) : (
        <Box sx={{
          height: 180,
          flexShrink: 0,
          backgroundColor: '#080d1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ComputerIcon sx={{ fontSize: 64, color: '#1e2a3a' }} />
        </Box>
      )}

      {/* Detalii — inaltime fixa */}
      <Box sx={{
        height: 130,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
      }}>
        {/* Sus: chip + titlu */}
        <Box>
          <Chip
            label={listing.category || 'Other'}
            size="small"
            sx={{
              backgroundColor: chipColor + '22',
              color: chipColor,
              border: `1px solid ${chipColor}44`,
              mb: 0.8,
              fontSize: 11,
            }}
          />
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{
              color: 'white',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {listing.title}
          </Typography>
        </Box>

        {/* Jos: pret + buton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#00bcd4' }}>
            {listing.price} RON
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: '#00bcd4',
              borderColor: '#00bcd4',
              textTransform: 'none',
              fontSize: 12,
              py: 0.3,
              '&:hover': { backgroundColor: '#00bcd422' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/listing/${listing._id}`);
            }}
          >
            Vezi detalii
          </Button>
        </Box>
      </Box>

    </Card>
  );
};

export default ListingCard;