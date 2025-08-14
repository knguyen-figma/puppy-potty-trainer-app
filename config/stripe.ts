export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE', // Replace with your actual publishable key
  productId: 'prod_Srap6uhQtANEQP',
  priceId: 'price_1RvrdiGxgFKkRCAxjCkxFk8c',
  monthlyPrice: 500, // $5.00 in cents
};

// Mock API endpoints - replace with your actual backend URLs
export const API_ENDPOINTS = {
  createSubscription: '/api/create-subscription',
  getSubscriptionStatus: '/api/subscription-status',
  cancelSubscription: '/api/cancel-subscription',
};
