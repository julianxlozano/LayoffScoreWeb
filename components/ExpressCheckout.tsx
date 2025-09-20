"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStripe, useElements, ExpressCheckoutElement } from "@stripe/react-stripe-js";
import { Loader, Text } from "@mantine/core";
import { createPaymentIntent } from "@/utils/payment";
import styles from "./ExpressCheckout.module.css";

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
  onPaymentError
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
      // Create payment intent
      const { client_secret } = await createPaymentIntent(amount, userId);

      // Confirm payment with the payment method from the event
      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Payment succeeded - store verification and redirect
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

  const expressCheckoutOptions = {
    buttonType: {
      applePay: 'buy' as const,
      googlePay: 'buy' as const,
      paypal: 'buynow' as const,
    },
    buttonHeight: 48,
    layout: {
      maxColumns: 2,
      maxRows: 2,
      overflow: 'auto' as const,
    },
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
