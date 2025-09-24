"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { Loader, Text } from "@mantine/core";
import { createPaymentIntent } from "@/utils/payment";
import styles from "./ExpressCheckout.module.css";

// Helper function to detect mobile devices
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface ExpressCheckoutProps {
  amount?: number;
  userId?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export default function ExpressCheckout({
  amount = 1900,
  userId,
  onPaymentSuccess,
  onPaymentError,
}: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [canMakePayment, setCanMakePayment] = useState(false);

  const handlePayment = async (event: any) => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Express checkout event:", event); // Debug log

      // Create payment intent
      const { client_secret } = await createPaymentIntent(amount, userId);

      // Use the standard confirmPayment method with the payment method from the event
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // If we get here, payment was successful
      // Store verification and redirect
      sessionStorage.setItem("payment_verified", "true");

      if (onPaymentSuccess) {
        onPaymentSuccess();
      } else {
        router.push("/results");
      }
    } catch (error: any) {
      console.error("Express checkout error:", error);
      const errorMessage = error.message || "Payment failed. Please try again.";

      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create payment method order based on device type
  const getPaymentMethodOrder = () => {
    const baseOrder = ["googlePay", "link", "applePay", "amazonPay"];

    // Add Cash App Pay for mobile users
    if (isMobile()) {
      return ["googlePay", "link", "applePay", "cashapp", "amazonPay"];
    }

    return baseOrder;
  };

  const expressCheckoutOptions = {
    buttonType: {
      applePay: "buy" as const,
      googlePay: "buy" as const,
      cashapp: "pay" as const,
    },
    buttonHeight: 48,
    layout: {
      maxColumns: 2,
      maxRows: 2,
      overflow: "auto" as const,
    },
    paymentMethods: {
      googlePay: "always" as const, // Force Google Pay to show when available
      // Only enable Apple Pay in production (not localhost)
      applePay:
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
          ? ("never" as const)
          : ("always" as const),
    },
    paymentMethodOrder: getPaymentMethodOrder(),
  };

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Loader size="sm" color="white" />
        </div>
      )}

      <ExpressCheckoutElement
        options={expressCheckoutOptions}
        onConfirm={handlePayment}
        onReady={({ availablePaymentMethods }) => {
          // Debug: Log available payment methods
          console.log("Available payment methods:", availablePaymentMethods);
          console.log("Is mobile device:", isMobile());
          console.log("Payment method order:", getPaymentMethodOrder());

          // Show the element if payment methods are available
          setCanMakePayment(!!availablePaymentMethods);
        }}
        onCancel={() => {
          setIsLoading(false);
        }}
      />

      {!canMakePayment && (
        <div className={styles.noMethods}>
          <Text size="sm" color="dimmed">
            Loading payment options...
          </Text>
        </div>
      )}
    </div>
  );
}
