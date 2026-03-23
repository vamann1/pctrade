import axiosInstance from './axiosInstance';

export const getNotifications = async (userId) => {
  const response = await axiosInstance.get(`/notifications/${userId}`);
  return response.data;
};

export const getUnreadCount = async (userId) => {
  const response = await axiosInstance.get(`/notifications/${userId}/unread-count`);
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async (userId) => {
  const response = await axiosInstance.patch(`/notifications/${userId}/read-all`);
  return response.data;
};