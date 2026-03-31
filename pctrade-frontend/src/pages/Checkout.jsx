import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  Box, Container, Typography, TextField,
  Button, CircularProgress, Divider,
  Radio, RadioGroup, FormControlLabel,
  Stepper, Step, StepLabel, Alert,
  InputAdornment, Chip
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DELIVERY_FEE = 65;
const STEPS = ['Detalii livrare', 'Plată', 'Confirmare'];

const Checkout = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 - Livrare
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [address, setAddress] = useState({
    fullName: user?.username || '',
    phone: '',
    street: '',
    city: '',
    county: '',
    postalCode: '',
  });

  // Step 2 - Plata
  const [cardType, setCardType] = useState('visa');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axiosInstance.get(`/transactions/${transactionId}`);
        setTransaction(response.data);
      } catch {
        setError('Tranzacția nu a fost găsită.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const handleAddressChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    setCardForm(prev => ({ ...prev, [name]: formatted }));
  };

  const isAddressValid = () => {
    if (deliveryMethod === 'pickup') return true;
    return address.fullName && address.phone && address.street && address.city;
  };

  const isCardValid = () => {
    return cardForm.cardNumber.replace(/\s/g, '').length === 16 &&
      cardForm.cardName && cardForm.expiry.length === 5 && cardForm.cvv.length === 3;
  };

  const totalPrice = transaction
    ? Number(transaction.priceAtPurchase) + (deliveryMethod === 'delivery' ? DELIVERY_FEE : 0)
    : 0;

  const handlePayment = async () => {
    setPaymentLoading(true);
    // Simulam procesarea
    await new Promise(resolve => setTimeout(resolve, 2500));
    try {
      await axiosInstance.patch(`/transactions/${transactionId}/status`, null, {
        params: { status: 'PAID' }
      });
      setStep(2);
    } catch {
      setError('Eroare la procesarea plății.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9fb' }}>
      <CircularProgress sx={{ color: '#5856d6' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100vh', p: 4, backgroundColor: '#f9f9fb' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/profile/transactions')}
            sx={{ color: '#6b6b6b', textTransform: 'none' }}
          >
            Înapoi la tranzacții
          </Button>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
            Finalizare comandă
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { fontWeight: 600 },
                  '& .MuiStepIcon-root.Mui-active': { color: '#5856d6' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#34c759' },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

          {/* ── STANGA: Continut step ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* STEP 0 — Livrare */}
            {step === 0 && (
              <Box sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: 3,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                  Metodă de livrare
                </Typography>

                <RadioGroup value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
                  <Box sx={{
                    border: `2px solid ${deliveryMethod === 'delivery' ? '#5856d6' : '#e5e5ea'}`,
                    borderRadius: 2,
                    p: 2,
                    mb: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    backgroundColor: deliveryMethod === 'delivery' ? '#5856d608' : 'transparent',
                  }}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    <FormControlLabel
                      value="delivery"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#5856d6' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <LocalShippingIcon sx={{ color: '#5856d6' }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                              Livrare la domiciliu
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                              Estimat 2-3 zile lucrătoare
                            </Typography>
                          </Box>
                          <Chip
                            label={`+${DELIVERY_FEE} RON`}
                            size="small"
                            sx={{ ml: 'auto', backgroundColor: '#5856d611', color: '#5856d6', fontWeight: 'bold' }}
                          />
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Box>

                  <Box sx={{
                    border: `2px solid ${deliveryMethod === 'pickup' ? '#5856d6' : '#e5e5ea'}`,
                    borderRadius: 2,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    backgroundColor: deliveryMethod === 'pickup' ? '#5856d608' : 'transparent',
                  }}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    <FormControlLabel
                      value="pickup"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#5856d6' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <StoreIcon sx={{ color: '#34c759' }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                              Ridicare personală
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                              {transaction?.listing?.location
                                ? `De la: ${transaction.listing.location}`
                                : 'Locație stabilită cu vânzătorul'}
                            </Typography>
                          </Box>
                          <Chip
                            label="Gratuit"
                            size="small"
                            sx={{ ml: 'auto', backgroundColor: '#34c75922', color: '#34c759', fontWeight: 'bold' }}
                          />
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Box>
                </RadioGroup>

                {/* Adresa - doar daca e delivery */}
                {deliveryMethod === 'delivery' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                      Adresă de livrare
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Nume complet *"
                        name="fullName"
                        value={address.fullName}
                        onChange={handleAddressChange}
                        fullWidth
                        size="small"
                        sx={{ backgroundColor: '#f9f9fb' }}
                      />
                      <TextField
                        label="Telefon *"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        fullWidth
                        size="small"
                        sx={{ backgroundColor: '#f9f9fb' }}
                      />
                    </Box>
                    <TextField
                      label="Stradă și număr *"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      fullWidth
                      size="small"
                      placeholder="ex: Str. Mihai Eminescu, nr. 10, ap. 5"
                      sx={{ backgroundColor: '#f9f9fb' }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Oraș *"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        fullWidth
                        size="small"
                        sx={{ backgroundColor: '#f9f9fb' }}
                      />
                      <TextField
                        label="Județ"
                        name="county"
                        value={address.county}
                        onChange={handleAddressChange}
                        fullWidth
                        size="small"
                        sx={{ backgroundColor: '#f9f9fb' }}
                      />
                      <TextField
                        label="Cod poștal"
                        name="postalCode"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        fullWidth
                        size="small"
                        sx={{ backgroundColor: '#f9f9fb' }}
                      />
                    </Box>
                  </Box>
                )}

                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setStep(1)}
                  disabled={!isAddressValid()}
                  sx={{
                    backgroundColor: '#5856d6',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    alignSelf: 'flex-end',
                    px: 3,
                    '&:hover': { backgroundColor: '#4745c0' },
                  }}
                >
                  Continuă spre plată
                </Button>
              </Box>
            )}

            {/* STEP 1 — Plata */}
            {step === 1 && (
              <Box sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                {/* Header plata */}
                <Box sx={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  p: 2.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CreditCardIcon sx={{ color: '#ffffff' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffffff' }}>
                        Plată securizată
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ffffff88' }}>
                        Powered by ReSpec Escrow
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LockIcon sx={{ fontSize: 14, color: '#34c759' }} />
                    <Typography variant="caption" sx={{ color: '#34c759' }}>SSL Secured</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* Tip card */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 1.5 }}>
                      Tip card
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {['visa', 'mastercard'].map((type) => (
                        <Box
                          key={type}
                          onClick={() => setCardType(type)}
                          sx={{
                            border: `2px solid ${cardType === type ? '#5856d6' : '#e5e5ea'}`,
                            borderRadius: 2,
                            p: 1.5,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flex: 1,
                            backgroundColor: cardType === type ? '#5856d608' : 'transparent',
                            transition: 'all 0.15s',
                          }}
                        >
                          {type === 'visa' ? (
                            <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#1a1f71', fontStyle: 'italic' }}>
                              VISA
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#eb001b' }} />
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#f79e1b', ml: -1.5 }} />
                            </Box>
                          )}
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', textTransform: 'capitalize' }}>
                            {type === 'visa' ? 'Visa' : 'Mastercard'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Preview card */}
                  <Box sx={{
                    background: cardType === 'visa'
                      ? 'linear-gradient(135deg, #1a1f71 0%, #2196f3 100%)'
                      : 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)',
                    borderRadius: 3,
                    p: 3,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 180,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -30, right: -30,
                      width: 150, height: 150,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    },
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>
                        {cardType === 'visa' ? 'VISA' : 'MASTERCARD'}
                      </Typography>
                      {cardType === 'mastercard' && (
                        <Box sx={{ display: 'flex' }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#eb001b', opacity: 0.9 }} />
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f79e1b', opacity: 0.9, ml: -1.5 }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 2, letterSpacing: 3, fontFamily: 'monospace' }}>
                      {cardForm.cardNumber || '•••• •••• •••• ••••'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>Titular</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {cardForm.cardName || 'NUME PRENUME'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>Expiră</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {cardForm.expiry || 'MM/YY'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Campuri card */}
                  <TextField
                    label="Număr card *"
                    name="cardNumber"
                    value={cardForm.cardNumber}
                    onChange={handleCardInput}
                    placeholder="1234 5678 9012 3456"
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon sx={{ color: '#6b6b6b', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ backgroundColor: '#f9f9fb' }}
                  />
                  <TextField
                    label="Nume titular *"
                    name="cardName"
                    value={cardForm.cardName}
                    onChange={handleCardInput}
                    placeholder="Ion Popescu"
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: '#f9f9fb' }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Dată expirare *"
                      name="expiry"
                      value={cardForm.expiry}
                      onChange={handleCardInput}
                      placeholder="MM/YY"
                      fullWidth
                      size="small"
                      sx={{ backgroundColor: '#f9f9fb' }}
                    />
                    <TextField
                      label="CVV *"
                      name="cvv"
                      value={cardForm.cvv}
                      onChange={handleCardInput}
                      placeholder="123"
                      fullWidth
                      size="small"
                      type="password"
                      sx={{ backgroundColor: '#f9f9fb' }}
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#aeaeb2', textAlign: 'center' }}>
                    🔒 Datele cardului sunt protejate prin criptare SSL 256-bit. Aceasta este o simulare.
                  </Typography>

                  {/* Butoane */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setStep(0)}
                      sx={{ color: '#6b6b6b', borderColor: '#e5e5ea', textTransform: 'none' }}
                    >
                      Înapoi
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handlePayment}
                      disabled={!isCardValid() || paymentLoading}
                      sx={{
                        backgroundColor: '#5856d6',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        py: 1.2,
                        '&:hover': { backgroundColor: '#4745c0' },
                      }}
                    >
                      {paymentLoading
                        ? <CircularProgress size={22} sx={{ color: 'white' }} />
                        : `🔒 Plătește ${totalPrice} RON`
                      }
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {/* STEP 2 — Confirmare */}
            {step === 2 && (
              <Box sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5ea',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2.5,
              }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: '#34c75922',
                  border: '2px solid #34c75944',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#34c759' }} />
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                    Comandă plasată cu succes!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b6b6b', mt: 0.5 }}>
                    {totalPrice} RON blocați în escrow
                  </Typography>
                </Box>

                <Box sx={{
                  backgroundColor: '#f9f9fb',
                  border: '1px solid #e5e5ea',
                  borderRadius: 2,
                  p: 2.5,
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 0.5 }}>
                    Ce urmează:
                  </Typography>
                  {deliveryMethod === 'delivery' ? (
                    <>
                      <Typography variant="body2" sx={{ color: '#6b6b6b' }}>📦 Vânzătorul va confirma și expedia produsul</Typography>
                      <Typography variant="body2" sx={{ color: '#6b6b6b' }}>🚚 Livrare estimată în 2-3 zile lucrătoare la {address.city}</Typography>
                      <Typography variant="body2" sx={{ color: '#6b6b6b' }}>✅ Confirmă primirea pentru a elibera banii</Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ color: '#6b6b6b' }}>📍 Contactează vânzătorul pentru a stabili locul și ora ridicării</Typography>
                      <Typography variant="body2" sx={{ color: '#6b6b6b' }}>✅ Confirmă ridicarea pentru a elibera banii din escrow</Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/profile/transactions')}
                    sx={{
                      color: '#5856d6',
                      borderColor: '#5856d644',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#5856d611' },
                    }}
                  >
                    Vezi tranzacțiile
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/browse')}
                    sx={{
                      backgroundColor: '#5856d6',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': { backgroundColor: '#4745c0' },
                    }}
                  >
                    Continuă cumpărăturile
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* ── DREAPTA: Sumar comandă ── */}
          <Box sx={{
            width: 320,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
          }}>
            <Box sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5ea',
              borderRadius: 3,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Sumar comandă
              </Typography>

              <Box sx={{
                backgroundColor: '#f9f9fb',
                border: '1px solid #e5e5ea',
                borderRadius: 2,
                p: 2,
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }} noWrap>
                  {transaction?.listing?.title || 'Produs'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                  Vânzător: @{transaction?.listing?.seller?.username}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#e5e5ea' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Preț produs</Typography>
                  <Typography variant="body2" sx={{ color: '#1c1c1e', fontWeight: 'bold' }}>
                    {transaction?.priceAtPurchase} RON
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#6b6b6b' }}>Livrare</Typography>
                  <Typography variant="body2" sx={{ color: deliveryMethod === 'pickup' ? '#34c759' : '#1c1c1e', fontWeight: 'bold' }}>
                    {deliveryMethod === 'pickup' ? 'Gratuit' : `${DELIVERY_FEE} RON`}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#e5e5ea' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }}>Total</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#5856d6' }}>
                  {totalPrice} RON
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#34c75911',
                border: '1px solid #34c75933',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <LockIcon sx={{ fontSize: 16, color: '#34c759' }} />
                <Typography variant="caption" sx={{ color: '#34c759', fontWeight: 'bold' }}>
                  Plată protejată prin escrow ReSpec
                </Typography>
              </Box>
            </Box>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default Checkout;