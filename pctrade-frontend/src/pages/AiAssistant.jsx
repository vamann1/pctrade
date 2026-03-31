import { useState, useRef, useEffect } from 'react';
import {
  Box, Container, Typography, TextField,
  Button, CircularProgress, Avatar, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import { chatWithAI } from '../api/ai';
import { useNavigate } from 'react-router-dom';

const SUGGESTED_QUESTIONS = [
  '🖥️ Sugerează-mi un setup gaming cu buget de 3000 RON',
  '🔍 Ce GPU-uri sunt disponibile acum?',
  '⚡ Sunt compatibile un i7-12700K cu o placă B550?',
  '💡 Cum funcționează sistemul escrow?',
  '🔄 Care sunt alternativele pentru un RTX 3080?',
  '📦 Care sunt pașii pentru a vinde o componentă?',
];

const formatMessage = (text) => {
  return text
    .split('\n')
    .map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
};

const AiAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salut! Sunt ReSpec AI 👋\n\nTe pot ajuta cu:\n- 🖥️ Sugestii de componente după buget și nevoi\n- ✅ Verificare compatibilitate hardware\n- 💡 Propuneri de setup-uri complete\n- 🔄 Alternative pentru componente\n- ❓ Întrebări despre platformă\n\nCu ce te pot ajuta azi?',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Trimitem history-ul fara primul mesaj de bun venit
      const history = newMessages
        .slice(1)
        .slice(-10) // Ultimele 10 mesaje pentru context
        .map(m => ({ role: m.role, content: m.content }));

      const data = await chatWithAI(messageText, history.slice(0, -1));
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Eroare la conectarea cu AI-ul. Încearcă din nou.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9fb', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">

        {/* Header */}
        <Box sx={{
          textAlign: 'center',
          mb: 4,
        }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#5856d611',
            border: '1px solid #5856d633',
            borderRadius: 10,
            px: 2,
            py: 0.6,
            mb: 2,
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 14, color: '#5856d6' }} />
            <Typography variant="caption" sx={{ color: '#5856d6', fontWeight: 'bold', letterSpacing: 1 }}>
              RESPEC AI ASSISTANT
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1c1c1e', mb: 1 }}>
            Asistentul tău AI pentru hardware
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
            Întreabă-mă orice despre componente, compatibilitate sau platformă
          </Typography>
        </Box>

        {/* Chat container */}
        <Box sx={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5ea',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 320px)',
          minHeight: 400,
        }}>

          {/* Mesaje */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            backgroundColor: '#f9f9fb',
          }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{
                    bgcolor: '#5856d6',
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}

                <Box sx={{
                  maxWidth: '75%',
                  backgroundColor: msg.role === 'user' ? '#5856d6' : '#ffffff',
                  border: msg.role === 'user' ? 'none' : '1px solid #e5e5ea',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  px: 2.5,
                  py: 1.5,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: msg.role === 'user' ? '#ffffff' : '#1c1c1e',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {formatMessage(msg.content)}
                  </Typography>
                </Box>

                {msg.role === 'user' && (
                  <Avatar sx={{
                    bgcolor: '#f2f2f7',
                    border: '1px solid #e5e5ea',
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                  }}>
                    <PersonIcon sx={{ fontSize: 16, color: '#6b6b6b' }} />
                  </Avatar>
                )}
              </Box>
            ))}

            {/* Loading indicator */}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#5856d6', width: 32, height: 32 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  borderRadius: '16px 16px 16px 4px',
                  px: 2.5,
                  py: 1.5,
                  display: 'flex',
                  gap: 0.8,
                  alignItems: 'center',
                }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#5856d6',
                        opacity: 0.4,
                        animation: 'pulse 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                          '50%': { opacity: 1, transform: 'scale(1.3)' },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{
            p: 2,
            borderTop: '1px solid #e5e5ea',
            backgroundColor: '#ffffff',
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Întreabă-mă ceva despre hardware sau platformă..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                size="small"
                multiline
                maxRows={3}
                sx={{ backgroundColor: '#f9f9fb', borderRadius: 1 }}
              />
              <Button
                variant="contained"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                sx={{
                  backgroundColor: '#5856d6',
                  minWidth: 44,
                  px: 1.5,
                  alignSelf: 'flex-end',
                  '&:hover': { backgroundColor: '#4745c0' },
                }}
              >
                <SendIcon sx={{ fontSize: 20 }} />
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Intrebari sugerate */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{
            color: '#6b6b6b',
            textTransform: 'uppercase',
            letterSpacing: 1,
            display: 'block',
            mb: 1.5,
          }}>
            Întrebări sugerate
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <Chip
                key={i}
                label={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5ea',
                  color: '#1c1c1e',
                  cursor: 'pointer',
                  fontSize: 12,
                  '&:hover': {
                    backgroundColor: '#5856d611',
                    borderColor: '#5856d644',
                    color: '#5856d6',
                  },
                  '&:disabled': { opacity: 0.5 },
                }}
              />
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default AiAssistant;