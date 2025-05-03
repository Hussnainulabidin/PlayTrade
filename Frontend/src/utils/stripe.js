/**
 * Stripe utility functions
 */
import { loadStripe } from '@stripe/stripe-js';
import config from '../config';

// Load the Stripe instance with the publishable key
let stripePromise;

// Initialize Stripe singleton
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Format a price amount from cents to dollars with proper formatting
export const formatAmountForDisplay = (amount) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  return formatter.format(amount);
};

// Format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
}; 