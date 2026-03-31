import axiosInstance from './axiosInstance';

export const checkCompatibility = async (components) => {
  const response = await axiosInstance.post('/ai/compatibility-check', { components });
  return response.data;
};

export const chatWithAI = async (message, history) => {
  const response = await axiosInstance.post('/ai/chat', { message, history });
  return response.data;
};

export const getSimilarListings = async (title, category, brand, productModel, price, listingId) => {
  const response = await axiosInstance.get('/ai/similar', {
    params: { title, category, brand, productModel, price, listingId }
  });
  return response.data;
};