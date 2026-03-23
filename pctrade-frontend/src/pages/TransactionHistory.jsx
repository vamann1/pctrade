import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTransactionsByBuyer, getTransactionsBySeller } from '../api/transactions';
import {
  Box, Container, Typography, Button,
  CircularProgress, Chip, Divider, Tab, Tabs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SellIcon from '@mui/icons-material/Sell';

const statusColors = {
  PENDING: { bg: '#ff980022', color: '#ff9800', label: 'În așteptare' },
  COMPLETED: { bg: '#34c75922', color: '#34c759', label: 'Finalizată' },
  CANCELLED: { bg: '#ff3b3022', color: '#ff3b30', label: 'Anulată' },
};

const TransactionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?._id;

  const [tab, setTab] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const [buyerData, sellerData] = await Promise.all([
          getTransactionsByBuyer(userId),
          getTransactionsBySeller(userId),
        ]);
        setPurchases(buyerData);
        setSales(sellerData);
      } catch (err) {
        console.error('Eroare la fetch tranzacții:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [userId]);

  const renderTransactions = (transactions, type) => {
    if (transactions.length === 0) {
      return (
        <Box sx={{
          textAlign: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          {type === 'purchases'
            ? <ShoppingBagIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
            : <SellIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
          }
          <Typography variant="h6" sx={{ color: '#1c1c1e' }}>
            {type === 'purchases' ? 'Nu ai nicio achiziție încă' : 'Nu ai nicio vânzare încă'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
            {type === 'purchases'
              ? 'Explorează anunțurile disponibile!'
              : 'Adaugă un anunț și începe să vinzi!'
            }
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(type === 'purchases' ? '/browse' : '/add-listing')}
            sx={{
              color: '#5856d6',
              borderColor: '#5856d644',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#5856d611', borderColor: '#5856d6' },
            }}
          >
            {type === 'purchases' ? 'Explorează anunțuri' : 'Adaugă anunț'}
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {transactions.map((t) => {
          const status = statusColors[t.status] || statusColors.PENDING;
          return (
            <Box
              key={t.transactionId}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: 3,
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderColor: '#5856d633' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }} noWrap>
                  {t.listingTitle}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                  {type === 'purchases' ? `Vânzător: @${t.sellerName}` : `Cumpărător: @${t.buyerName}`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#5856d6' }}>
                  {t.price} RON
                </Typography>
                <Chip
                  label={status.label}
                  size="small"
                  sx={{
                    backgroundColor: status.bg,
                    color: status.color,
                    border: `1px solid ${status.color}44`,
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/profile')}
            sx={{ color: '#6b6b6b', textTransform: 'none', '&:hover': { color: '#1c1c1e' } }}
          >
            Înapoi la profil
          </Button>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
              Istoric tranzacții
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
              {purchases.length + sales.length} tranzacții totale
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden',
        }}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            sx={{
              px: 2,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: '#5856d6' },
              '& .MuiTabs-indicator': { backgroundColor: '#5856d6' },
            }}
          >
            <Tab
              label={`Achiziții (${purchases.length})`}
              icon={<ShoppingBagIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
            <Tab
              label={`Vânzări (${sales.length})`}
              icon={<SellIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Continut */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#5856d6' }} />
          </Box>
        ) : (
          <>
            {tab === 0 && renderTransactions(purchases, 'purchases')}
            {tab === 1 && renderTransactions(sales, 'sales')}
          </>
        )}

      </Container>
    </Box>
  );
};

export default TransactionHistory;