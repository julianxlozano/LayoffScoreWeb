"use client";

import { Button, Container, Text, Group, Box } from "@mantine/core";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ShieldBadge from "@/components/ShieldBadge";

export default function LandingPage() {
  const router = useRouter();

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
          <Button
            size="lg"
            className={styles.button}
            onClick={() => router.push("/quiz")}
          >
            Learn My Risk
          </Button>
        </div>
      </Container>
    </div>
  );
}
