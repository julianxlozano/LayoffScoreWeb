"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Badge,
  Loader,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconStar,
  IconTrendingUp,
  IconShield,
  IconCreditCard,
} from "@tabler/icons-react";
import { Elements } from "@stripe/react-stripe-js";
import { redirectToCheckout, stripePromise } from "@/utils/payment";
import ExpressCheckout from "@/components/ExpressCheckout";
import styles from "./page.module.css";

export default function UnlockScorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get userId from sessionStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = sessionStorage.getItem("userId") || undefined;
      setUserId(storedUserId);
    }
  }, []);

  // Mock payment bypass (commented out for production)
  const handleMockPay = () => {
    // Set payment verification flag so results page doesn't redirect back
    sessionStorage.setItem("payment_verified", "true");
    router.push("/results");
  };

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      await redirectToCheckout(userId);
    } catch (error: any) {
      console.error("Payment error:", error);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push("/results");
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const features = [
    {
      icon: <IconStar size={20} />,
      text: "Personalized AI risk score",
    },
    {
      icon: <IconShield size={20} />,
      text: "Detailed risk analysis",
    },
    {
      icon: <IconTrendingUp size={20} />,
      text: "Custom action plan",
    },
    // {
    //   icon: <IconCheck size={20} />,
    //   text: "Weekly progress tracking",
    // },
  ];

  // Stripe Elements options
  const elementsOptions = {
    mode: "payment" as const,
    amount: 1900, // $19.00 in cents
    currency: "usd",
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#ff6b6b",
        borderRadius: "8px",
      },
    },
  };

  return (
    <div className={styles.gradient}>
      <Container size="sm" className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <Badge
              size="lg"
              color="red"
              variant="light"
              className={styles.badge}
            >
              Limited Time Offer
            </Badge>
            <Text className={styles.title}>Unlock Your AI Risk Score</Text>
            <Text className={styles.subtitle}>
              Get instant access to your personalized assessment and action plan
            </Text>
          </div>

          {/* Pricing Card */}
          <Card className={styles.pricingCard}>
            <Stack gap="lg">
              {/* Price */}
              <div className={styles.priceSection}>
                <Text className={styles.originalPrice}>$39</Text>
                <div className={styles.currentPrice}>
                  <Text className={styles.priceAmount}>$19</Text>
                  <Text className={styles.priceLabel}>one-time</Text>
                </div>
              </div>

              {/* Features */}
              <Stack gap="sm">
                {features.map((feature, index) => (
                  <Group key={index} gap="sm" className={styles.feature}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <Text className={styles.featureText}>{feature.text}</Text>
                  </Group>
                ))}
              </Stack>

              {/* Express Checkout (Apple Pay, Google Pay, etc.) */}
              <Elements stripe={stripePromise} options={elementsOptions}>
                <ExpressCheckout
                  amount={1900}
                  userId={userId}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </Elements>

              {/* Divider */}
              <Divider
                label="Or pay with card"
                labelPosition="center"
                className={styles.divider}
              />

              {/* Traditional Card Payment Button */}
              <Button
                size="lg"
                className={styles.payButton}
                onClick={handleStripeCheckout}
                disabled={loading}
                fullWidth
                leftSection={!loading && <IconCreditCard size={24} />}
              >
                {loading ? <Loader size="sm" color="white" /> : "Pay with Card"}
              </Button>

              {/* Error Display */}
              {error && (
                <Text size="sm" color="red" ta="center">
                  {error}
                </Text>
              )}

              {/* Mock Payment Button - COMMENTED OUT FOR PRODUCTION */}
              <Button
                size="lg"
                variant="outline"
                onClick={handleMockPay}
                fullWidth
                style={{ marginTop: "8px" }}
              >
                Skip Payment (Dev Only)
              </Button>

              {/* Trust indicators */}
              <Stack gap="xs" align="center">
                <Text size="sm" className={styles.trustText}>
                  🔒 Secure checkout • No subscription
                </Text>
                <Text size="xs" className={styles.guaranteeText}>
                  30-day money-back guarantee
                </Text>
                <Text size="xs" className={styles.guaranteeText}>
                  Powered by Stripe
                </Text>
              </Stack>
            </Stack>
          </Card>
          {/* 
          <div className={styles.socialProof}>
            <Text size="sm" className={styles.socialProofText}>
              Join <strong>12,847+</strong> professionals who've secured their
              careers
            </Text>
          </div> */}
        </div>
      </Container>
    </div>
  );
}
