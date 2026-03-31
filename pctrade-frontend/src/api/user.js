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

export const getUserStats = async (userId) => {
  const [listings, salesData, reviewsData] = await Promise.all([
    axiosInstance.get(`/listings/seller/${userId}`),
    axiosInstance.get(`/transactions/seller/${userId}`),
    axiosInstance.get(`/reviews/seller/${userId}`),
  ]);

  const activeListing = listings.data.filter(l => l.available).length;
  const sales = salesData.data.filter(t => t.status === 'COMPLETED').length;
  const reviews = reviewsData.data;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const totalRevenue = salesData.data
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.price), 0);

  return { activeListing, sales, avgRating, totalRevenue };
};

export const getPublicProfile = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}/public`);
  return response.data;
};

export const deleteAccount = async (userId, password) => {
  const response = await axiosInstance.delete(`/users/${userId}`, {
    data: { password }
  });
  return response.data;
};