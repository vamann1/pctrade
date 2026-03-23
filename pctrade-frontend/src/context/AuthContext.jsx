import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

// User mock pentru testing
const MOCK_USER = {
  _id: 1,
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

const login = async (username, password) => {
  try {
    const data = await loginUser(username, password);
    const normalizedUser = {
      ...data.user,
      _id: data.user._id || data.user.id,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  } catch (err) {
    if (!err.response) {
      // Backend indisponibil
      console.warn('Backend indisponibil, login mock activat.');
      localStorage.setItem('token', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      setUser(MOCK_USER);
    } else {
      // Eroare reala de la backend — aruncam mai departe
      throw err;
    }
  }
};

  const register = async (username, email, password) => {
    await registerUser(username, email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);