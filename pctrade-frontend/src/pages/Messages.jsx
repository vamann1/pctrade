import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getConversationMessages, sendMessage, sendPriceOffer, respondToOffer } from '../api/messages';
import {
  Box, Container, Typography, Avatar, TextField,
  Button, CircularProgress, InputAdornment, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ComputerIcon from '@mui/icons-material/Computer';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { createTransaction } from '../api/transactions';

const POLL_INTERVAL = 30000;

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const userId = user?.id || user?._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getConversations(userId);
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, [userId]);

  const fetchMessages = useCallback(async (conv) => {
    if (!conv) return;
    try {
      const data = await getConversationMessages(conv.listingId, userId, conv.otherUserId);
      setMessages(data);
    } catch {
      setMessages([]);
    }
    scrollToBottom();
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handlePayOffer = async (listingId, offeredPrice) => {
  try {
    await createTransaction(userId, listingId);
    alert(`Comandă plasată cu succes pentru ${offeredPrice} RON!`);
  } catch (err) {
    console.error('Eroare la plasarea comenzii:', err);
    alert('Eroare la plasarea comenzii. Încearcă din nou.');
  }
};

  useEffect(() => {
    const listingId = searchParams.get('listingId');
    const sellerId = searchParams.get('sellerId');

    if (listingId && sellerId && conversations.length >= 0) {
      const key = `${listingId}_${sellerId}`;
      const existing = conversations.find((c) => c.key === key);

      if (existing) {
        setActiveConv(existing);
      } else {
        setActiveConv({
          key,
          listingId: Number(listingId),
          otherUserId: Number(sellerId),
          listing: { id: Number(listingId) },
          otherUser: { id: Number(sellerId), username: '...' },
          lastMessage: null,
        });
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    fetchMessages(activeConv).finally(() => setLoadingMsgs(false));

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(activeConv), POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [activeConv, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    navigate(`/messages?listingId=${conv.listingId}&sellerId=${conv.otherUserId}`);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConv) return;
    setSending(true);
    try {
      await sendMessage(userId, activeConv.otherUserId, activeConv.listingId, messageInput.trim());
      const newMsg = {
        id: Date.now(),
        content: messageInput.trim(),
        senderId: userId,
        senderName: user.username,
        createdAt: new Date().toISOString(),
        messageType: 'text',
      };
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
    } catch (err) {
      console.error('Eroare la trimitere mesaj:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendOffer = async () => {
    if (!offerPrice || isNaN(offerPrice) || Number(offerPrice) <= 0) return;
    setSending(true);
    try {
      const newMsg = await sendPriceOffer(
        userId,
        activeConv.otherUserId,
        activeConv.listingId,
        Number(offerPrice)
      );
      setMessages((prev) => [...prev, newMsg]);
      setOfferPrice('');
      setShowOfferInput(false);
    } catch (err) {
      console.error('Eroare la trimitere oferta:', err);
    } finally {
      setSending(false);
    }
  };

  const handleRespondOffer = async (messageId, action) => {
    try {
      const updated = await respondToOffer(messageId, action);
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? updated : m)
      );
    } catch (err) {
      console.error('Eroare la raspuns oferta:', err);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{
          display: 'flex',
          height: 'calc(100vh - 100px)',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>

          {/* ── STANGA: Lista conversatii ── */}
          <Box sx={{
            width: 320,
            flexShrink: 0,
            borderRight: '1px solid #e5e5ea',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f9f9fb',
          }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e5e5ea' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                Mesaje
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {loadingConvs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress size={24} sx={{ color: '#5856d6' }} />
                </Box>
              ) : conversations.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 6, px: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                    Nicio conversație încă.
                  </Typography>
                </Box>
              ) : (
                conversations.map((conv) => {
                  const isActive = activeConv?.key === conv.key;
                  return (
                    <Box
                      key={conv.key}
                      onClick={() => handleSelectConv(conv)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#5856d611' : 'transparent',
                        borderLeft: `3px solid ${isActive ? '#5856d6' : 'transparent'}`,
                        '&:hover': { backgroundColor: isActive ? '#5856d611' : '#f2f2f7' },
                        transition: 'all 0.15s',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Avatar sx={{ bgcolor: '#5856d6', width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
                          {conv.otherUser?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1c1c1e' }} noWrap>
                              @{conv.otherUser?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#aeaeb2', flexShrink: 0, ml: 1 }}>
                              {conv.lastMessageTime ? formatTime(conv.lastMessageTime) : ''}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#6b6b6b' }} noWrap>
                            {conv.listing?.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#aeaeb2', display: 'block' }} noWrap>
                            {conv.lastMessage}
                          </Typography>
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
                borderBottom: '1px solid #e5e5ea',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: '#ffffff',
              }}>
                <Avatar sx={{ bgcolor: '#5856d6', width: 36, height: 36, fontSize: 14 }}>
                  {activeConv.otherUser?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1c1c1e' }}>
                    @{activeConv.otherUser?.username}
                  </Typography>
                </Box>

                <Box
                  onClick={() => navigate(`/listing/${activeConv.listingId}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: '#f9f9fb',
                    border: '1px solid #e5e5ea',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.8,
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#5856d6' },
                    transition: 'border-color 0.15s',
                  }}
                >
                  <ComputerIcon sx={{ fontSize: 16, color: '#5856d6' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block' }} noWrap>
                      {activeConv.listing?.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5856d6', fontWeight: 'bold' }}>
                      {activeConv.listing?.price} RON
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Mesaje */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, backgroundColor: '#f9f9fb' }}>
                {loadingMsgs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress size={24} sx={{ color: '#5856d6' }} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                      Niciun mesaj încă. Începe conversația!
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === userId;

                    if (msg.messageType === 'price_offer') {
                      return (
                        <Box key={msg.id} sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                          <Box sx={{
                            backgroundColor: '#ffffff',
                            border: `1px solid ${msg.offerStatus === 'accepted' ? '#34c75944' : msg.offerStatus === 'rejected' ? '#ff3b3044' : '#5856d644'}`,
                            borderRadius: 2,
                            p: 2,
                            maxWidth: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocalOfferIcon sx={{ fontSize: 16, color: '#5856d6' }} />
                              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
                                Ofertă de preț
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#5856d6' }}>
                              {msg.offeredPrice} RON
                            </Typography>

                            {msg.offerStatus === 'accepted' && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Chip label="Acceptată" size="small" sx={{ backgroundColor: '#34c75922', color: '#34c759', width: 'fit-content', border: '1px solid #34c75944' }} />
                                {/* Buton plateste doar pentru cumparator */}
                                {msg.senderId === userId && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handlePayOffer(activeConv.listingId, msg.offeredPrice)}
                                    sx={{ backgroundColor: '#34c759', textTransform: 'none', '&:hover': { backgroundColor: '#2db34a' } }}
                                  >
                                    Plătește {msg.offeredPrice} RON
                                  </Button>
                                )}
                              </Box>
                            )}
                            {msg.offerStatus === 'rejected' && (
                              <Chip label="Respinsă" size="small" sx={{ backgroundColor: '#ff3b3022', color: '#ff3b30', width: 'fit-content', border: '1px solid #ff3b3044' }} />
                            )}
                            {msg.offerStatus === 'pending' && !isOwn && (
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CheckIcon />}
                                  onClick={() => handleRespondOffer(msg.id, 'accept')}
                                  sx={{ backgroundColor: '#34c759', textTransform: 'none', flex: 1, '&:hover': { backgroundColor: '#2db34a' } }}
                                >
                                  Acceptă
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CloseIcon />}
                                  onClick={() => handleRespondOffer(msg.id, 'reject')}
                                  sx={{ color: '#ff3b30', borderColor: '#ff3b3044', textTransform: 'none', flex: 1, '&:hover': { borderColor: '#ff3b30' } }}
                                >
                                  Respinge
                                </Button>
                              </Box>
                            )}
                            {msg.offerStatus === 'pending' && isOwn && (
                              <Chip label="În așteptare" size="small" sx={{ backgroundColor: '#5856d611', color: '#5856d6', width: 'fit-content', border: '1px solid #5856d633' }} />
                            )}

                            <Typography variant="caption" sx={{ color: '#aeaeb2', textAlign: isOwn ? 'right' : 'left' }}>
                              {formatTime(msg.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }

                    return (
                      <Box
                        key={msg.id}
                        sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 1 }}
                      >
                        {!isOwn && (
                          <Avatar sx={{ bgcolor: '#f2f2f7', color: '#1c1c1e', width: 28, height: 28, fontSize: 12, alignSelf: 'flex-end', border: '1px solid #e5e5ea' }}>
                            {msg.senderName?.[0]?.toUpperCase()}
                          </Avatar>
                        )}
                        <Box sx={{ maxWidth: '65%' }}>
                          <Box sx={{
                            backgroundColor: isOwn ? '#5856d6' : '#ffffff',
                            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            px: 2,
                            py: 1,
                            border: isOwn ? 'none' : '1px solid #e5e5ea',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                          }}>
                            <Typography variant="body2" sx={{ color: isOwn ? '#ffffff' : '#1c1c1e' }}>
                              {msg.content}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#aeaeb2', display: 'block', mt: 0.3, textAlign: isOwn ? 'right' : 'left' }}>
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
              <Box sx={{ p: 2, borderTop: '1px solid #e5e5ea', backgroundColor: '#ffffff' }}>

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
                        backgroundColor: '#f9f9fb',
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
                      sx={{ backgroundColor: '#5856d6', textTransform: 'none', '&:hover': { backgroundColor: '#4745c0' } }}
                    >
                      Trimite
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => { setShowOfferInput(false); setOfferPrice(''); }}
                      sx={{ color: '#6b6b6b', borderColor: '#e5e5ea', textTransform: 'none' }}
                    >
                      Anulează
                    </Button>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LocalOfferIcon />}
                    onClick={() => setShowOfferInput(!showOfferInput)}
                    sx={{
                      color: '#5856d6',
                      borderColor: '#5856d644',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { borderColor: '#5856d6', backgroundColor: '#5856d608' },
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
                    sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    sx={{
                      backgroundColor: '#5856d6',
                      minWidth: 44,
                      px: 1.5,
                      '&:hover': { backgroundColor: '#4745c0' },
                    }}
                  >
                    <SendIcon sx={{ fontSize: 20 }} />
                  </Button>
                </Box>
              </Box>

            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
              <ComputerIcon sx={{ fontSize: 64, color: '#c7c7cc' }} />
              <Typography sx={{ color: '#6b6b6b' }}>Selectează o conversație</Typography>
            </Box>
          )}

        </Box>
      </Container>
    </Box>
  );
};

export default Messages;