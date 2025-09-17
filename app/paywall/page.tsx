"use client";

import { useRouter } from "next/navigation";
import {
  Container,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Badge,
} from "@mantine/core";
import {
  IconCheck,
  IconStar,
  IconTrendingUp,
  IconShield,
} from "@tabler/icons-react";
import styles from "./page.module.css";

export default function PaywallPage() {
  const router = useRouter();

  const handlePay = () => {
    // Mock payment - just navigate to results for now
    router.push("/results");
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

              {/* CTA Button */}
              <Button
                size="lg"
                className={styles.payButton}
                onClick={handlePay}
                fullWidth
              >
                Get My Score Now
              </Button>

              {/* Trust indicators */}
              <Stack gap="xs" align="center">
                <Text size="sm" className={styles.trustText}>
                  🔒 Secure checkout • No subscription
                </Text>
                <Text size="xs" className={styles.guaranteeText}>
                  30-day money-back guarantee
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
