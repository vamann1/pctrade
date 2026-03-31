import axiosInstance from './axiosInstance';

export const getFavorites = async (userId) => {
  const response = await axiosInstance.get(`/favorites/${userId}`);
  return response.data;
};

export const checkIsFavorite = async (userId, listingId) => {
  const response = await axiosInstance.get(`/favorites/${userId}/check/${listingId}`);
  return response.data;
};

export const addFavorite = async (userId, listingId) => {
  const response = await axiosInstance.post('/favorites', null, {
    params: { userId, listingId }
  });
  return response.data;
};

export const removeFavorite = async (userId, listingId) => {
  const response = await axiosInstance.delete('/favorites', {
    params: { userId, listingId }
  });
  return response.data;
};