"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Text, Button, Loader, Center, Stack } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { verifyPayment } from "@/utils/payment";
import styles from "./page.module.css";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const sessionId = searchParams.get("session_id");

      if (sessionId) {
        try {
          const result = await verifyPayment(sessionId);
          if (result.paid) {
            setVerified(true);
            // Store payment status
            sessionStorage.setItem("payment_verified", "true");

            // Redirect to results after a short delay
            setTimeout(() => {
              router.push("/results");
            }, 2000);
          } else {
            // Payment not verified, redirect back to unlock score page
            router.push("/unlock-score");
          }
        } catch (error) {
          console.error("Verification error:", error);
          router.push("/unlock-score");
        }
      } else {
        // No session ID, check if coming from mobile payment
        const paymentVerified = sessionStorage.getItem("payment_verified");
        if (paymentVerified === "true") {
          setVerified(true);
          setTimeout(() => {
            router.push("/results");
          }, 2000);
        } else {
          router.push("/paywall");
        }
      }

      setVerifying(false);
    };

    verifyAndRedirect();
  }, [router, searchParams]);

  if (verifying) {
    return (
      <div className={styles.container}>
        <Center h="100vh">
          <Stack align="center" gap="lg">
            <Loader size="lg" color="red" />
            <Text size="lg" color="dimmed">
              Verifying your payment...
            </Text>
          </Stack>
        </Center>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className={styles.container}>
        <Container size="sm">
          <Stack align="center" gap="xl" className={styles.content}>
            <Text size="xl" weight={600} color="red">
              Payment verification failed
            </Text>
            <Text size="md" color="dimmed" align="center">
              There was an issue verifying your payment. Please try again.
            </Text>
            <Button
              size="lg"
              onClick={() => router.push("/paywall")}
              className={styles.button}
            >
              Back to Payment
            </Button>
          </Stack>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Container size="sm">
        <Stack align="center" gap="xl" className={styles.content}>
          <IconCircleCheck size={80} color="#22c55e" stroke={1.5} />
          <Text size="xl" weight={600} className={styles.title}>
            Payment Successful!
          </Text>
          <Text size="md" color="dimmed" align="center">
            Thank you for your purchase. You're being redirected to your AI risk
            assessment...
          </Text>
          <Loader size="sm" color="red" />
        </Stack>
      </Container>
    </div>
  );
}
