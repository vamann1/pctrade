import axiosInstance from './axiosInstance';

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data; // { token, user }
};

export const registerUser = async (username, email, password) => {
  const response = await axiosInstance.post('/auth/register', { username, email, password });
  return response.data;
};