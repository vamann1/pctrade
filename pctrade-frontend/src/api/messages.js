import axiosInstance from './axiosInstance';

export const getConversations = async (userId) => {
  const response = await axiosInstance.get(`/messages/conversations/${userId}`);
  return response.data;
};

export const getConversationMessages = async (listingId, user1Id, user2Id) => {
  const response = await axiosInstance.get('/messages/conversation', {
    params: { listingId, user1Id, user2Id }
  });
  return response.data;
};

export const sendMessage = async (senderId, receiverId, listingId, content) => {
  const response = await axiosInstance.post('/messages', {
    senderId,
    receiverId,
    listingId,
    content,
    messageType: 'text',
  });
  return response.data;
};

export const sendPriceOffer = async (senderId, receiverId, listingId, offeredPrice) => {
  const response = await axiosInstance.post('/messages', {
    senderId,
    receiverId,
    listingId,
    content: `Ofertă de preț: ${offeredPrice} RON`,
    messageType: 'price_offer',
    offeredPrice,
  });
  return response.data;
};

export const respondToOffer = async (messageId, action) => {
  const response = await axiosInstance.patch(`/messages/${messageId}/offer`, null, {
    params: { action }
  });
  return response.data;
};

export const getUnreadMessagesCount = async (userId) => {
  const response = await axiosInstance.get(`/messages/conversations/${userId}`);
  return response.data.length;
};