import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

// User mock pentru testing
const MOCK_USER = {
  _id: 'mock123',
  username: 'george_pc',
  email: 'george@example.com',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      // Daca backend-ul nu e disponibil, folosim mock
      if (!err.response) {
        console.warn('Backend indisponibil, login mock activat.');
        localStorage.setItem('token', 'mock-token-123');
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      } else {
        // Daca backend-ul a raspuns cu eroare (ex: parola gresita), aruncam eroarea mai departe
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