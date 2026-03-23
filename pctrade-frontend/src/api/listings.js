import axiosInstance from './axiosInstance';

export const getListings = async (params) => {
  const response = await axiosInstance.get('/listings', { params });
  return response.data;
};

export const getListingById = async (id) => {
  const response = await axiosInstance.get(`/listings/${id}`);
  return response.data;
};

export const addListing = async (listingData) => {
  const { sellerId, ...listingBody } = listingData;
  const response = await axiosInstance.post(
    `/listings?sellerId=${sellerId}`,
    listingBody
  );
  return response.data;
};

export const uploadListingImages = async (listingId, images) => {
  console.log('uploadListingImages apelat cu listingId:', listingId);
  for (const img of images) {
    console.log('Uploadez imaginea:', img.file.name);
    try {
      const formData = new FormData();
      formData.append('file', img.file);
      const response = await axiosInstance.post(`/listings/${listingId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload success:', response);
    } catch (err) {
      console.error('Upload error:', err.response?.status, err.response?.data);
      throw err;
    }
  }
};

export const getListingImages = async (listingId) => {
  const response = await axiosInstance.get(`/listings/${listingId}/images`);
  return response.data;
};

export const updateListing = async (id, updates) => {
  const response = await axiosInstance.patch(`/listings/${id}`, updates);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await axiosInstance.delete(`/listings/${id}`);
  return response.data;
};