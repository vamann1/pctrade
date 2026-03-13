export const MOCK_CONVERSATIONS = [
  {
    _id: 'conv1',
    listing: {
      _id: '2',
      title: 'NVIDIA RTX 3070 Ti 8GB',
      price: 1650,
      imageUrl: '',
    },
    participants: [
      { _id: 'mock123', username: 'george_pc' },
      { _id: 'u2', username: 'mihai_tech' },
    ],
    lastMessage: {
      content: 'Mai este disponibil?',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      sender: { _id: 'u2', username: 'mihai_tech' },
    },
    unreadCount: 2,
  },
  {
    _id: 'conv2',
    listing: {
      _id: '1',
      title: 'Intel Core i7-12700K',
      price: 850,
      imageUrl: '',
    },
    participants: [
      { _id: 'mock123', username: 'george_pc' },
      { _id: 'u3', username: 'alex_vinde' },
    ],
    lastMessage: {
      content: 'Pot oferi 750 RON.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      sender: { _id: 'u3', username: 'alex_vinde' },
      type: 'price_offer',
      offeredPrice: 750,
    },
    unreadCount: 1,
  },
];

export const MOCK_MESSAGES = {
  conv1: [
    {
      _id: 'm1',
      type: 'text',
      content: 'Bună! Mai este disponibil?',
      sender: { _id: 'u2', username: 'mihai_tech' },
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      _id: 'm2',
      type: 'text',
      content: 'Da, este disponibil! Stare foarte bună.',
      sender: { _id: 'mock123', username: 'george_pc' },
      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    },
    {
      _id: 'm3',
      type: 'text',
      content: 'Mai este disponibil?',
      sender: { _id: 'u2', username: 'mihai_tech' },
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  conv2: [
    {
      _id: 'm4',
      type: 'text',
      content: 'Salut, mă interesează procesorul.',
      sender: { _id: 'u3', username: 'alex_vinde' },
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      _id: 'm5',
      type: 'price_offer',
      content: 'Îți ofer 750 RON.',
      offeredPrice: 750,
      offerStatus: 'pending',
      sender: { _id: 'u3', username: 'alex_vinde' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ],
};