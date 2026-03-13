import axiosInstance from './axiosInstance';

export const getConversations = async () => {
  const response = await axiosInstance.get('/conversations');
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await axiosInstance.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (conversationId, content) => {
  const response = await axiosInstance.post(`/conversations/${conversationId}/messages`, { content });
  return response.data;
};

export const createConversation = async (listingId, sellerId) => {
  const response = await axiosInstance.post('/conversations', { listingId, sellerId });
  return response.data;
};

export const sendPriceOffer = async (conversationId, offeredPrice) => {
  const response = await axiosInstance.post(`/conversations/${conversationId}/messages`, {
    type: 'price_offer',
    offeredPrice,
  });
  return response.data;
};

export const respondToOffer = async (conversationId, messageId, action) => {
  const response = await axiosInstance.patch(
    `/conversations/${conversationId}/messages/${messageId}`,
    { action } // 'accept' sau 'reject'
  );
  return response.data;
};