"use client";

import { Button, Container, Text, Group, Box } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";
import ShieldBadge from "@/components/ShieldBadge";
import { trackPageView } from "@/utils/analytics";

export default function LandingPage() {
  const router = useRouter();

  // Track landing page view
  useEffect(() => {
    trackPageView("/");
  }, []);

  const handleStartQuiz = () => {
    // Track CTA click before navigation
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cta_clicked", {
        event_category: "Landing",
        cta_text: "Learn My Risk",
        page_location: "homepage",
      });
    }
    router.push("/quiz");
  };

  return (
    <div className={styles.gradient}>
      <Container size="sm" className={styles.container}>
        <div className={styles.content}>
          {/* Shield Icon */}
          <div className={styles.iconContainer}>
            <ShieldBadge size={132} />
          </div>

          {/* Main Title */}
          <Text className={styles.title}>
            Secure Your
            <br />
            Future Against AI
          </Text>

          {/* Subtitle */}
          <Text className={styles.subtitle}>
            Gain peace of mind in the age of automation. Assess your job&apos;s
            AI risk and future-proof your career.
          </Text>

          {/* Page Indicator */}
          <Group className={styles.pageIndicator} gap="xs">
            <div className={`${styles.dot} ${styles.activeDot}`} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </Group>

          {/* CTA Button */}
          <Button size="lg" className={styles.button} onClick={handleStartQuiz}>
            Learn My Risk
          </Button>
        </div>
      </Container>
    </div>
  );
}
