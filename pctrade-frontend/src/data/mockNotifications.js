export const MOCK_NOTIFICATIONS = [
  {
    _id: 'n1',
    type: 'price_offer',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    message: 'alex_vinde ți-a făcut o ofertă de 750 RON pentru Intel Core i7-12700K',
    link: '/messages/conv2',
  },
  {
    _id: 'n2',
    type: 'new_message',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    message: 'mihai_tech ți-a trimis un mesaj despre NVIDIA RTX 3070 Ti',
    link: '/messages/conv1',
  },
  {
    _id: 'n3',
    type: 'offer_accepted',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    message: 'Oferta ta de 280 RON pentru Corsair Vengeance 32GB a fost acceptată!',
    link: '/messages/conv1',
  },
  {
    _id: 'n4',
    type: 'offer_rejected',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    message: 'Oferta ta de 150 RON pentru WD Blue 2TB a fost respinsă.',
    link: '/messages/conv2',
  },
];