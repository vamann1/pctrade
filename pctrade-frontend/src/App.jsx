import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';

import Navbar from './components/Navbar';
import Browse from './pages/Browse';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddListing from './pages/AddListing';
import ListingDetail from './pages/ListingDetail';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Footer from './components/Footer';

// Tema dark globala
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00bcd4' },
    background: {
      default: '#080d1a',
      paper: '#0f1525',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
});

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/add-listing" element={
                <ProtectedRoute><AddListing /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute><Messages /></ProtectedRoute>
              } />
              <Route path="/messages/:conversationId" element={
                <ProtectedRoute><Messages /></ProtectedRoute>
              } />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;