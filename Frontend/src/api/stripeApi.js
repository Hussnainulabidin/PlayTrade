import API from './index';

const stripeApi = {
  // Create a payment intent
  createPaymentIntent: (data) => {
    return API.post('/payments/create-payment-intent', data);
  },
  
  // Check the status of a payment intent
  getPaymentStatus: (paymentIntentId) => {
    return API.get(`/payments/status/${paymentIntentId}`);
  },
  
  // Process payment with card details
  processPayment: (paymentData) => {
    return API.post('/payments/process', paymentData);
  }
};

export default stripeApi; 