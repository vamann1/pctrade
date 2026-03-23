import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardActions,
  Typography, Button, Chip, Box
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import { getListingImages } from '../api/listings';

const MINIO_URL = 'http://localhost:9000/pctrade-images';

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
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const id = listing._id || listing.id;
        // Doar daca e un ID numeric (produs real din backend)
        if (!id || isNaN(id)) return;
        const imgs = await getListingImages(id);
        if (imgs.length > 0) {
          setImageUrl(`${MINIO_URL}/${imgs[0].imageUrl}`);
        }
      } catch {
        // Nicio imagine disponibila
      }
    };
    fetchImage();
  }, [listing]);

  return (
    <Card
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5ea',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
      onClick={() => navigate(`/listing/${listing._id || listing.id}`)}
    >
      {/* Imagine */}
      <Box sx={{
        height: 180,
        flexShrink: 0,
        backgroundColor: '#f2f2f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
          />
        ) : (
          <ComputerIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
        )}
      </Box>

      {/* Detalii */}
      <Box sx={{
        height: 130,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
      }}>
        <Box>
          <Chip
            label={listing.category || 'Other'}
            size="small"
            sx={{
              backgroundColor: chipColor + '18',
              color: chipColor,
              border: `1px solid ${chipColor}33`,
              mb: 0.8,
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{
              color: '#1c1c1e',
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#5856d6' }}>
            {listing.price} RON
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: '#5856d6',
              borderColor: '#5856d644',
              fontSize: 12,
              py: 0.3,
              '&:hover': { backgroundColor: '#5856d611', borderColor: '#5856d6' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/listing/${listing._id || listing.id}`);
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