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
import ProfileListings from './pages/ProfileListings';
import EditProfile from './pages/EditProfile';
import EditListing from './pages/EditListing';
import TransactionHistory from './pages/TransactionHistory';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5856d6' },
    background: {
      default: '#f2f2f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1c1e',
      secondary: '#6b6b6b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
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
              <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/listings" element={<ProtectedRoute><ProfileListings /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/listing/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
              <Route path="/profile/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;