import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTransactionsByBuyer, getTransactionsBySeller } from '../api/transactions';
import { addReview, checkReviewExists } from '../api/reviews';
import axiosInstance from '../api/axiosInstance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SellIcon from '@mui/icons-material/Sell';
import StarIcon from '@mui/icons-material/Star';
import {
  Box, Container, Typography, Button,
  CircularProgress, Chip, Tab, Tabs,
  Rating, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField as MuiTextField, Stepper, Step, StepLabel, InputAdornment
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';

const statusColors = {
  PENDING: { bg: '#ff980022', color: '#ff9800', label: 'În așteptare' },
  PAID: { bg: '#5856d622', color: '#5856d6', label: 'Plătit - Escrow' },
  CONFIRMED_BY_SELLER: { bg: '#2196f322', color: '#2196f3', label: 'Confirmat de vânzător' },
  SHIPPED: { bg: '#ff980022', color: '#ff9800', label: 'Expediat' },
  COMPLETED: { bg: '#34c75922', color: '#34c759', label: 'Finalizat' },
  CANCELLED: { bg: '#ff3b3022', color: '#ff3b30', label: 'Anulat' },
  DISPUTED: { bg: '#f4433622', color: '#f44336', label: 'Dispută' },
};

const TransactionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?._id;

  const [tab, setTab] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedTransactions, setReviewedTransactions] = useState({});
  const [paymentModal, setPaymentModal] = useState(null); // { transactionId, price, title }
  const [paymentStep, setPaymentStep] = useState(0); // 0 = form, 1 = processing, 2 = success
  const [cardForm, setCardForm] = useState({cardNumber: '', cardName: '', expiry: '', cvv: '',});

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [buyerData, sellerData] = await Promise.all([
        getTransactionsByBuyer(userId),
        getTransactionsBySeller(userId),
      ]);
      setPurchases(buyerData);
      setSales(sellerData);

      // Verifica review-urile existente pentru tranzactiile COMPLETED
      const completedPurchases = buyerData.filter(t => t.status === 'COMPLETED');
      const reviewChecks = await Promise.all(
        completedPurchases.map(async (t) => {
          const exists = await checkReviewExists(t.transactionId);
          return [t.transactionId, exists];
        })
      );
      setReviewedTransactions(Object.fromEntries(reviewChecks));

    } catch (err) {
      console.error('Eroare la fetch tranzacții:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      await axiosInstance.patch(`/transactions/${transactionId}/status`, null, {
        params: { status: newStatus }
      });
      await fetchTransactions();
    } catch (err) {
      console.error('Eroare la actualizare status:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await addReview(reviewModal.transactionId, reviewModal.reviewerId, rating, comment);
      // Marcheaza tranzactia ca reviewed in state
      setReviewedTransactions(prev => ({
        ...prev,
        [reviewModal.transactionId]: true
      }));
      setReviewModal(null);
      setRating(5);
      setComment('');
    } catch (err) {
      console.error('Eroare la trimitere recenzie:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleOpenPayment = (transaction) => {
  setPaymentModal({
    transactionId: transaction.transactionId,
    price: transaction.price,
    title: transaction.listingTitle,
  });
  setPaymentStep(0);
  setCardForm({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
};

const handleCardInput = (e) => {
  const { name, value } = e.target;
  let formatted = value;

  if (name === 'cardNumber') {
    formatted = value.replace(/\D/g, '').slice(0, 16)
      .replace(/(.{4})/g, '$1 ').trim();
  }
  if (name === 'expiry') {
    formatted = value.replace(/\D/g, '').slice(0, 4);
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
  }
  if (name === 'cvv') {
    formatted = value.replace(/\D/g, '').slice(0, 3);
  }

  setCardForm((prev) => ({ ...prev, [name]: formatted }));
};

const handlePaymentSubmit = async () => {
  // Validare simpla
  if (!cardForm.cardNumber || !cardForm.cardName || !cardForm.expiry || !cardForm.cvv) return;

  setPaymentStep(1); // Processing

  // Simulam procesarea platii
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Actualizam statusul tranzactiei la PAID
  try {
    await handleUpdateStatus(paymentModal.transactionId, 'PAID');
  } catch {}

  setPaymentStep(2); // Success
};

const handlePaymentClose = () => {
  if (paymentStep === 1) return; // Nu inchidem in timp ce proceseaza
  setPaymentModal(null);
  setPaymentStep(0);
  if (paymentStep === 2) {
    fetchTransactions(); // Refresh dupa plata reusita
  }
};

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
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', borderColor: '#5856d633' },
              }}
            >
              {/* Info tranzactie */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
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

              {/* Descriere status */}
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                {type === 'purchases' && t.status === 'PENDING' && '⏳ Așteaptă confirmarea ta. Plătește pentru a bloca banii în escrow.'}
                {type === 'purchases' && t.status === 'PAID' && '🔒 Banii sunt blocați în escrow. Așteaptă confirmarea vânzătorului.'}
                {type === 'purchases' && t.status === 'CONFIRMED_BY_SELLER' && '📦 Vânzătorul pregătește coletul pentru expediere.'}
                {type === 'purchases' && t.status === 'SHIPPED' && '🚚 Coletul este în drum spre tine. Confirmă primirea când ajunge!'}
                {type === 'purchases' && t.status === 'COMPLETED' && '✅ Tranzacție finalizată. Banii au fost eliberați vânzătorului.'}
                {type === 'sales' && t.status === 'PENDING' && '⏳ Așteaptă ca cumpărătorul să plătească.'}
                {type === 'sales' && t.status === 'PAID' && '💰 Banii sunt blocați în escrow. Confirmă că vei trimite produsul!'}
                {type === 'sales' && t.status === 'CONFIRMED_BY_SELLER' && '📦 Ai confirmat expedierea. Actualizează când trimiți coletul.'}
                {type === 'sales' && t.status === 'SHIPPED' && '🚚 Coletul a fost expediat. Așteaptă confirmarea cumpărătorului.'}
                {type === 'sales' && t.status === 'COMPLETED' && '✅ Tranzacție finalizată. Banii au fost eliberați către tine!'}
                {t.status === 'CANCELLED' && '❌ Tranzacție anulată.'}
                {t.status === 'DISPUTED' && '⚠️ Dispută deschisă. Echipa noastră va analiza situația.'}
              </Typography>

              {/* Butoane actiuni */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {type === 'purchases' && t.status === 'PENDING' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CreditCardIcon />}
                    onClick={() => navigate(`/checkout/${t.transactionId}`)}
                    sx={{ backgroundColor: '#5856d6', textTransform: 'none', '&:hover': { backgroundColor: '#4745c0' } }}
                  >
                    Mergi la plată
                  </Button>
                )}
                {type === 'sales' && t.status === 'PAID' && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleUpdateStatus(t.transactionId, 'CONFIRMED_BY_SELLER')}
                    sx={{ backgroundColor: '#2196f3', textTransform: 'none', '&:hover': { backgroundColor: '#1976d2' } }}
                  >
                    ✅ Confirmă că vei trimite
                  </Button>
                )}
                {type === 'sales' && t.status === 'CONFIRMED_BY_SELLER' && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleUpdateStatus(t.transactionId, 'SHIPPED')}
                    sx={{ backgroundColor: '#ff9800', textTransform: 'none', '&:hover': { backgroundColor: '#f57c00' } }}
                  >
                    📦 Confirmă expedierea
                  </Button>
                )}
                {type === 'purchases' && t.status === 'SHIPPED' && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleUpdateStatus(t.transactionId, 'COMPLETED')}
                    sx={{ backgroundColor: '#34c759', textTransform: 'none', '&:hover': { backgroundColor: '#2db34a' } }}
                  >
                    📬 Confirmă primirea — eliberează banii
                  </Button>
                )}
                {type === 'purchases' && t.status === 'PENDING' && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUpdateStatus(t.transactionId, 'CANCELLED')}
                    sx={{ color: '#ff3b30', borderColor: '#ff3b3033', textTransform: 'none', '&:hover': { borderColor: '#ff3b30' } }}
                  >
                    Anulează
                  </Button>
                )}
                {type === 'purchases' && t.status === 'SHIPPED' && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUpdateStatus(t.transactionId, 'DISPUTED')}
                    sx={{ color: '#f44336', borderColor: '#f4433633', textTransform: 'none', '&:hover': { borderColor: '#f44336' } }}
                  >
                    ⚠️ Deschide dispută
                  </Button>
                )}
                {type === 'purchases' && t.status === 'COMPLETED' && (
                  reviewedTransactions[t.transactionId] ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      backgroundColor: '#ff980011',
                      border: '1px solid #ff980033',
                      borderRadius: 1.5,
                      px: 1.5,
                      py: 0.6,
                    }}>
                      <StarIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                      <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                        Ai lăsat deja o recenzie pentru această achiziție
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<StarIcon />}
                      onClick={() => setReviewModal({ 
                        transactionId: t.transactionId, 
                        reviewerId: userId 
                      })}
                      sx={{
                        color: '#ff9800',
                        borderColor: '#ff980044',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#ff980011', borderColor: '#ff9800' },
                      }}
                    >
                      Lasă o recenzie
                    </Button>
                  )
                )}
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

      {/* Modal recenzie */}
      <Dialog
        open={Boolean(reviewModal)}
        onClose={() => setReviewModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1c1c1e' }}>
          Lasă o recenzie
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#6b6b6b', mb: 1 }}>
              Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, val) => setRating(val)}
              size="large"
              sx={{ color: '#ff9800' }}
            />
          </Box>
          <MuiTextField
            label="Comentariu (opțional)"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            size="small"
            placeholder="Descrie experiența ta cu acest vânzător..."
            sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setReviewModal(null)}
            sx={{ color: '#6b6b6b', textTransform: 'none' }}
          >
            Anulează
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={reviewLoading}
            sx={{
              backgroundColor: '#5856d6',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#4745c0' },
            }}
          >
            {reviewLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Trimite recenzia'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal plata Start*/}

      {/* Modal plata End */}
    </Box>
  );
};

export default TransactionHistory;