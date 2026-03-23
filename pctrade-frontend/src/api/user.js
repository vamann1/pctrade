import axiosInstance from './axiosInstance';

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

export const getUserListings = async (userId) => {
  const response = await axiosInstance.get(`/listings/seller/${userId}`);
  return response.data;
};

export const updateUser = async (userId, updates) => {
  const response = await axiosInstance.patch(`/users/${userId}`, updates);
  return response.data;
};