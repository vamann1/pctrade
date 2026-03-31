import axiosInstance from './axiosInstance';

export const addReview = async (transactionId, reviewerId, rating, comment) => {
  const response = await axiosInstance.post('/reviews', {
    transactionId,
    reviewerId,
    rating,
    comment,
  });
  return response.data;
};

export const getSellerReviews = async (sellerId) => {
  const response = await axiosInstance.get(`/reviews/seller/${sellerId}`);
  return response.data;
};

export const checkReviewExists = async (transactionId) => {
  const response = await axiosInstance.get(`/reviews/exists/${transactionId}`);
  return response.data;
};