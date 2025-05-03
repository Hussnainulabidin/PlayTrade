// Configuration settings
const config = {
  // API URL
  API_URL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3003',
  
  // Stripe publishable key
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RKk9Q2fWkgm7bihGvlidoAFE252eGIm8QUdVCxj5ZoaxJ76YpnQTD23rIR2vjeLzaoxzfo8lJ6k6kC1O7Y4Kruv005j64mMwl'
};

export default config; 