import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getMessages, sendMessage, sendPriceOffer, respondToOffer } from '../api/messages';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../data/mockConversations';
import {
  Box, Container, Typography, Avatar, TextField,
  Button, Divider, CircularProgress, Chip, InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ComputerIcon from '@mui/icons-material/Computer';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const POLL_INTERVAL = 30000; // 30 secunde

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return 'Acum';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
};

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Scroll la ultimul mesaj
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

  // Fetch conversatii
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      setConversations(MOCK_CONVERSATIONS);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  // Fetch mesaje pentru conversatia activa
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const data = await getMessages(convId);
      setMessages(data);
    } catch {
      setMessages(MOCK_MESSAGES[convId] || []);
    }
    scrollToBottom();
  }, []);

  // La mount — fetch conversatii
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Cand se schimba conversatia activa
  useEffect(() => {
    if (!conversationId && conversations.length > 0) {
      navigate(`/messages/${conversations[0]._id}`, { replace: true });
      return;
    }
    if (conversationId) {
      const conv = conversations.find((c) => c._id === conversationId);
      setActiveConv(conv || null);
      setLoadingMsgs(true);
      fetchMessages(conversationId).finally(() => setLoadingMsgs(false));

      // Polling la 30 secunde
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(conversationId), POLL_INTERVAL);
    }
    return () => clearInterval(pollRef.current);
  }, [conversationId, conversations, fetchMessages, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConv = (convId) => {
    navigate(`/messages/${convId}`);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return;
    setSending(true);
    try {
      await sendMessage(conversationId, messageInput.trim());
      // Mock: adauga mesajul local
      const newMsg = {
        _id: Date.now().toString(),
        type: 'text',
        content: messageInput.trim(),
        sender: { _id: user._id, username: user.username },
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
    } catch {
      const newMsg = {
        _id: Date.now().toString(),
        type: 'text',
        content: messageInput.trim(),
        sender: { _id: user._id, username: user.username },
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
    } finally {
      setSending(false);
    }
  };

  const handleSendOffer = async () => {
    if (!offerPrice || isNaN(offerPrice) || Number(offerPrice) <= 0) return;
    setSending(true);
    try {
      await sendPriceOffer(conversationId, Number(offerPrice));
    } catch {}
    const newMsg = {
      _id: Date.now().toString(),
      type: 'price_offer',
      content: `Ofertă de preț: ${offerPrice} RON`,
      offeredPrice: Number(offerPrice),
      offerStatus: 'pending',
      sender: { _id: user._id, username: user.username },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setOfferPrice('');
    setShowOfferInput(false);
    setSending(false);
  };

  const handleRespondOffer = async (messageId, action) => {
    try {
      await respondToOffer(conversationId, messageId, action);
    } catch {}
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId ? { ...m, offerStatus: action === 'accept' ? 'accepted' : 'rejected' } : m
      )
    );
  };

  const getOtherParticipant = (conv) => {
    return conv?.participants?.find((p) => p._id !== user?._id);
  };

  const isSeller = (conv) => {
    return conv?.listing?.seller?._id === user?._id ||
      conv?.participants?.find(p => p._id === user?._id)?.role === 'seller';
  };

  return (
    <Box sx={{ backgroundColor: '#080d1a', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{
          display: 'flex',
          height: 'calc(100vh - 100px)',
          backgroundColor: '#0f1525',
          border: '1px solid #1e2a3a',
          borderRadius: 3,
          overflow: 'hidden',
        }}>

          {/* ── STANGA: Lista conversatii ── */}
          <Box sx={{
            width: 320,
            flexShrink: 0,
            borderRight: '1px solid #1e2a3a',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #1e2a3a' }}>
              <Typography variant="h6" fontWeight="bold" color="white">
                Mesaje
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {loadingConvs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress size={24} sx={{ color: '#00bcd4' }} />
                </Box>
              ) : conversations.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 6, px: 2 }}>
                  <Typography variant="body2" color="#888">
                    Nicio conversație încă.
                  </Typography>
                </Box>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isActive = conv._id === conversationId;
                  return (
                    <Box
                      key={conv._id}
                      onClick={() => handleSelectConv(conv._id)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#00bcd411' : 'transparent',
                        borderLeft: isActive ? '3px solid #00bcd4' : '3px solid transparent',
                        '&:hover': { backgroundColor: '#ffffff08' },
                        transition: 'all 0.15s',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Avatar sx={{ bgcolor: '#00bcd4', width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
                          {other?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="white" noWrap>
                              @{other?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#555', flexShrink: 0, ml: 1 }}>
                              {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#888' }} noWrap>
                            {conv.listing?.title}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                            <Typography variant="caption" sx={{ color: '#555' }} noWrap>
                              {conv.lastMessage?.content}
                            </Typography>
                            {conv.unreadCount > 0 && (
                              <Box sx={{
                                backgroundColor: '#00bcd4',
                                borderRadius: '50%',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                ml: 1,
                              }}>
                                <Typography sx={{ fontSize: 10, color: '#000', fontWeight: 'bold' }}>
                                  {conv.unreadCount}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>

          {/* ── DREAPTA: Chat ── */}
          {activeConv ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

              {/* Header chat */}
              <Box sx={{
                p: 2,
                borderBottom: '1px solid #1e2a3a',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                <Avatar sx={{ bgcolor: '#00bcd4', width: 36, height: 36, fontSize: 14 }}>
                  {getOtherParticipant(activeConv)?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="white">
                    @{getOtherParticipant(activeConv)?.username}
                  </Typography>
                </Box>
                {/* Info listing */}
                <Box
                  onClick={() => navigate(`/listing/${activeConv.listing?._id}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: '#080d1a',
                    border: '1px solid #1e2a3a',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.8,
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#00bcd4' },
                  }}
                >
                  <ComputerIcon sx={{ fontSize: 16, color: '#00bcd4' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#aaa', display: 'block' }} noWrap>
                      {activeConv.listing?.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#00bcd4', fontWeight: 'bold' }}>
                      {activeConv.listing?.price} RON
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Mesaje */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {loadingMsgs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress size={24} sx={{ color: '#00bcd4' }} />
                  </Box>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender?._id === user?._id;

                    // Mesaj de tip oferta de pret
                    if (msg.type === 'price_offer') {
                      return (
                        <Box key={msg._id} sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                          <Box sx={{
                            backgroundColor: '#080d1a',
                            border: `1px solid ${msg.offerStatus === 'accepted' ? '#4caf5044' : msg.offerStatus === 'rejected' ? '#f4433644' : '#00bcd444'}`,
                            borderRadius: 2,
                            p: 2,
                            maxWidth: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocalOfferIcon sx={{ fontSize: 16, color: '#00bcd4' }} />
                              <Typography variant="caption" sx={{ color: '#888' }}>
                                Ofertă de preț
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#00bcd4' }}>
                              {msg.offeredPrice} RON
                            </Typography>

                            {/* Status oferta */}
                            {msg.offerStatus === 'accepted' && (
                              <Chip label="Acceptată" size="small" sx={{ backgroundColor: '#4caf5022', color: '#4caf50', width: 'fit-content' }} />
                            )}
                            {msg.offerStatus === 'rejected' && (
                              <Chip label="Respinsă" size="small" sx={{ backgroundColor: '#f4433622', color: '#f44336', width: 'fit-content' }} />
                            )}

                            {/* Butoane accept/reject — doar pentru vanzator si doar daca e pending */}
                            {!isOwn && msg.offerStatus === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CheckIcon />}
                                  onClick={() => handleRespondOffer(msg._id, 'accept')}
                                  sx={{ backgroundColor: '#4caf50', textTransform: 'none', flex: 1, '&:hover': { backgroundColor: '#388e3c' } }}
                                >
                                  Acceptă
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CloseIcon />}
                                  onClick={() => handleRespondOffer(msg._id, 'reject')}
                                  sx={{ color: '#f44336', borderColor: '#f4433644', textTransform: 'none', flex: 1, '&:hover': { borderColor: '#f44336' } }}
                                >
                                  Respinge
                                </Button>
                              </Box>
                            )}

                            <Typography variant="caption" sx={{ color: '#555', textAlign: isOwn ? 'right' : 'left' }}>
                              {formatTime(msg.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }

                    // Mesaj text normal
                    return (
                      <Box
                        key={msg._id}
                        sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 1 }}
                      >
                        {!isOwn && (
                          <Avatar sx={{ bgcolor: '#1e2a3a', width: 28, height: 28, fontSize: 12, alignSelf: 'flex-end' }}>
                            {msg.sender?.username?.[0]?.toUpperCase()}
                          </Avatar>
                        )}
                        <Box sx={{ maxWidth: '65%' }}>
                          <Box sx={{
                            backgroundColor: isOwn ? '#00bcd4' : '#1e2a3a',
                            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            px: 2,
                            py: 1,
                          }}>
                            <Typography variant="body2" sx={{ color: isOwn ? '#000' : '#ddd' }}>
                              {msg.content}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#555', display: 'block', mt: 0.3, textAlign: isOwn ? 'right' : 'left' }}>
                            {formatTime(msg.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input mesaj */}
              <Box sx={{ p: 2, borderTop: '1px solid #1e2a3a' }}>

                {/* Input oferta de pret */}
                {showOfferInput && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <TextField
                      placeholder="Suma oferită (RON)"
                      size="small"
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      sx={{
                        flex: 1,
                        backgroundColor: '#080d1a',
                        borderRadius: 1,
                        '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                        '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">RON</InputAdornment>,
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendOffer}
                      disabled={sending}
                      sx={{ backgroundColor: '#00bcd4', textTransform: 'none', '&:hover': { backgroundColor: '#0097a7' } }}
                    >
                      Trimite oferta
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => { setShowOfferInput(false); setOfferPrice(''); }}
                      sx={{ color: '#888', borderColor: '#1e2a3a', textTransform: 'none' }}
                    >
                      Anulează
                    </Button>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Buton oferta pret */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocalOfferIcon />}
                    onClick={() => setShowOfferInput(!showOfferInput)}
                    sx={{
                      color: '#00bcd4',
                      borderColor: '#00bcd444',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { borderColor: '#00bcd4' },
                    }}
                  >
                    Fă o ofertă
                  </Button>

                  <TextField
                    placeholder="Scrie un mesaj..."
                    size="small"
                    fullWidth
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    sx={{ backgroundColor: '#080d1a', borderRadius: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    sx={{
                      backgroundColor: '#00bcd4',
                      minWidth: 44,
                      px: 1.5,
                      '&:hover': { backgroundColor: '#0097a7' },
                    }}
                  >
                    <SendIcon sx={{ fontSize: 20 }} />
                  </Button>
                </Box>
              </Box>

            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="#555">Selectează o conversație</Typography>
            </Box>
          )}

        </Box>
      </Container>
    </Box>
  );
};

export default Messages;