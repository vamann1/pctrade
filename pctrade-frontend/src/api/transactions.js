import axiosInstance from './axiosInstance';

export const createTransaction = async (buyerId, listingId) => {
  const response = await axiosInstance.post('/transactions', null, {
    params: { buyerId, listingId }
  });
  return response.data;
};

export const getTransactionsByBuyer = async (buyerId) => {
  const response = await axiosInstance.get(`/transactions/buyer/${buyerId}`);
  return response.data;
};

export const getTransactionsBySeller = async (sellerId) => {
  const response = await axiosInstance.get(`/transactions/seller/${sellerId}`);
  return response.data;
};