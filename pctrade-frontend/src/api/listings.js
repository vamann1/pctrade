import axiosInstance from './axiosInstance';

export const getListings = async (params) => {
  const response = await axiosInstance.get('/listings', { params });
  return response.data; // array de listings
};

export const getListingById = async (id) => {
  const response = await axiosInstance.get(`/listings/${id}`);
  return response.data;
};

export const addListing = async (listingData) => {
  const response = await axiosInstance.post('/listings', listingData);
  return response.data;
};