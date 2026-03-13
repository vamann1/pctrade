import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

const POLL_INTERVAL = 60000; // 60 secunde

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const pollRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [user]);

  // Porneste polling cand userul e logat
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      clearInterval(pollRef.current);
      return;
    }
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => n._id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);