import axiosInstance from './axiosInstance';

export const loginUser = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', { username, password });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await axiosInstance.post('/auth/register', { username, email, password });
  return response.data;
};