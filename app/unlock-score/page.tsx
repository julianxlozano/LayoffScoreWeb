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
  IconBrandApple,
  IconBrandGoogle,
  IconCreditCard,
} from "@tabler/icons-react";
import {
  redirectToCheckout,
  detectDevice,
  isApplePayAvailable,
  isGooglePayAvailable,
  stripePromise,
} from "@/utils/payment";
import styles from "./page.module.css";

export default function UnlockScorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
    applePay: false,
    googlePay: false,
    showMobileOptions: false,
  });

  useEffect(() => {
    // Detect device and available payment methods
    const device = detectDevice();
    setPaymentMethods({
      applePay: device.isIOS && isApplePayAvailable(),
      googlePay: isGooglePayAvailable(), // Works on any Chrome browser (desktop or mobile)
      showMobileOptions: device.isMobile,
    });
  }, []);

  // Mock payment bypass (commented out for production)
  // const handleMockPay = () => {
  //   router.push("/results");
  // };

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      // Get user ID from session storage if available
      const userId = sessionStorage.getItem("userId") || undefined;
      await redirectToCheckout(userId);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplePay = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe not initialized");
      }

      // Create payment request for Apple Pay
      const paymentRequest = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "LayoffScore AI Risk Assessment",
          amount: 1900, // $19.00 in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check if Apple Pay is available
      const canMakePayment = await paymentRequest.canMakePayment();
      if (!canMakePayment || !canMakePayment.applePay) {
        // Fallback to regular Stripe checkout
        await handleStripeCheckout();
        return;
      }

      // Show Apple Pay sheet
      paymentRequest.on("paymentmethod", async (ev) => {
        // Handle payment here - normally you'd confirm with backend
        // For now, we'll just complete the payment
        ev.complete("success");
        router.push("/results");
      });

      paymentRequest.show();
    } catch (error) {
      console.error("Apple Pay error:", error);
      // Fallback to Stripe checkout
      await handleStripeCheckout();
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePay = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe not initialized");
      }

      // Create payment request for Google Pay
      const paymentRequest = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "LayoffScore AI Risk Assessment",
          amount: 1900, // $19.00 in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check if Google Pay is available
      const canMakePayment = await paymentRequest.canMakePayment();
      if (!canMakePayment) {
        // Fallback to regular Stripe checkout
        await handleStripeCheckout();
        return;
      }

      // Show Google Pay sheet
      paymentRequest.on("paymentmethod", async (ev) => {
        // Handle payment here - normally you'd confirm with backend
        // For now, we'll just complete the payment
        ev.complete("success");
        router.push("/results");
      });

      paymentRequest.show();
    } catch (error) {
      console.error("Google Pay error:", error);
      // Fallback to Stripe checkout
      await handleStripeCheckout();
    } finally {
      setLoading(false);
    }
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
    {
      icon: <IconCheck size={20} />,
      text: "Weekly progress tracking",
    },
  ];

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

              {/* Payment Buttons */}
              <Stack gap="sm">
                {/* Show Apple Pay for iOS devices */}
                {paymentMethods.applePay && (
                  <Button
                    size="lg"
                    className={styles.applePayButton}
                    onClick={handleApplePay}
                    disabled={loading}
                    fullWidth
                    leftSection={<IconBrandApple size={24} />}
                    styles={{
                      root: {
                        backgroundColor: "#000",
                        "&:hover": {
                          backgroundColor: "#333",
                        },
                      },
                    }}
                  >
                    {loading ? <Loader size="sm" color="white" /> : "Apple Pay"}
                  </Button>
                )}

                {/* Show Google Pay for Chrome browsers (desktop and mobile) */}
                {paymentMethods.googlePay && (
                  <Button
                    size="lg"
                    className={styles.googlePayButton}
                    onClick={handleGooglePay}
                    disabled={loading}
                    fullWidth
                    leftSection={<IconBrandGoogle size={24} />}
                    styles={{
                      root: {
                        backgroundColor: "#4285F4",
                        "&:hover": {
                          backgroundColor: "#357AE8",
                        },
                      },
                    }}
                  >
                    {loading ? (
                      <Loader size="sm" color="white" />
                    ) : (
                      "Google Pay"
                    )}
                  </Button>
                )}

                {/* Show divider if mobile payment options are shown */}
                {(paymentMethods.applePay || paymentMethods.googlePay) && (
                  <Divider
                    label="Or pay with card"
                    labelPosition="center"
                    className={styles.divider}
                  />
                )}

                {/* Main Stripe Checkout Button */}
                <Button
                  size="lg"
                  className={styles.payButton}
                  onClick={handleStripeCheckout}
                  disabled={loading}
                  fullWidth
                  leftSection={!loading && <IconCreditCard size={24} />}
                >
                  {loading ? (
                    <Loader size="sm" color="white" />
                  ) : (
                    "Pay with Card"
                  )}
                </Button>

                {/* Mock Payment Button - COMMENTED OUT FOR PRODUCTION */}
                {/* <Button
                  size="lg"
                  variant="outline"
                  onClick={handleMockPay}
                  fullWidth
                  style={{ marginTop: "8px" }}
                >
                  Skip Payment (Dev Only)
                </Button> */}
              </Stack>

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

          {/* Social proof */}
          <div className={styles.socialProof}>
            <Text size="sm" className={styles.socialProofText}>
              Join <strong>12,847+</strong> professionals who've secured their
              careers
            </Text>
          </div>
        </div>
      </Container>
    </div>
  );
}
