import axiosInstance from './axiosInstance';

export const loginUser = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', { username, password });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await axiosInstance.post('/auth/register', { username, email, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (code, newPassword) => {
  const response = await axiosInstance.post('/auth/reset-password', { code, newPassword });
  return response.data;
};