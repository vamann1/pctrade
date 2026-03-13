import axiosInstance from './axiosInstance';

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

export const getUserListings = async () => {
  const response = await axiosInstance.get('/users/listings');
  return response.data;
};