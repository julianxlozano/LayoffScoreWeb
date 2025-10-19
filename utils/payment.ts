import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// Initialize Stripe with publishable key (will be set via env var)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export const createCheckoutSession = async (userId?: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payments/create-checkout-session/`,
      {
        user_id: userId || "anonymous",
        frontend_url: window.location.origin,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

export const createPaymentIntent = async (
  amount: number = 50,
  userId?: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payments/create-payment-intent/`,
      {
        amount,
        user_id: userId || "anonymous",
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

export const verifyPayment = async (sessionId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payments/verify/`, {
      params: { session_id: sessionId },
    });

    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

export const redirectToCheckout = async (userId?: string) => {
  try {
    const { checkout_url } = await createCheckoutSession(userId);
    if (checkout_url) {
      window.location.href = checkout_url;
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
};

export { stripePromise };
