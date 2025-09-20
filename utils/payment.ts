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
  amount: number = 1900,
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

export const isApplePayAvailable = () => {
  if (typeof window === "undefined") return false;

  // Check for Apple Pay availability
  if ((window as any).ApplePaySession) {
    return (window as any).ApplePaySession.canMakePayments();
  }
  return false;
};

export const isGooglePayAvailable = () => {
  if (typeof window === "undefined") return false;

  // Check for Google Pay availability
  // Works on Chrome (desktop and mobile) when Payment Request API is available
  const isChrome =
    /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);
  return !!(window as any).PaymentRequest && isChrome;
};

export const detectDevice = () => {
  if (typeof window === "undefined")
    return { isMobile: false, isIOS: false, isAndroid: false, isChrome: false };

  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    );
  const isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  const isAndroid = /android/i.test(userAgent.toLowerCase());
  const isChrome =
    /chrome/i.test(userAgent.toLowerCase()) &&
    !/edge/i.test(userAgent.toLowerCase());

  return { isMobile, isIOS, isAndroid, isChrome };
};

export { stripePromise };
