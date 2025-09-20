"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconBrain,
  IconUsers,
  IconSchool,
  IconAlertCircle,
} from "@tabler/icons-react";
import ScoreDonut from "@/components/ScoreDonut";
import {
  calculateQuizScore,
  createAnonymousUser,
  QuizResult,
} from "@/utils/api";
import { getRiskColor, getScreenGradient, hexToRgba } from "@/utils/colors";
import styles from "./page.module.css";

// Set to a number (e.g., 20, 50, 65, 90) to preview states; null uses real backend/local calc
const SCORE_OVERRIDE: number | null = null;

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "brain":
        return <IconBrain size={24} />;
      case "account-group":
        return <IconUsers size={24} />;
      case "school":
        return <IconSchool size={24} />;
      case "alert":
        return <IconAlertCircle size={24} />;
      default:
        return <IconBrain size={24} />;
    }
  };

  const makeResultFromScore = (score: number): QuizResult => {
    const level =
      score <= 24
        ? "Low"
        : score <= 49
        ? "Moderate"
        : score <= 74
        ? "Elevated"
        : "High";
    const msg =
      level === "Low"
        ? "Low AI risk. Keep building AI skills and track weekly wins."
        : level === "Moderate"
        ? "Moderate AI risk. Automate one routine task and add one live touchpoint this week."
        : level === "Elevated"
        ? "Elevated AI risk. Start a 14 day sprint to automate and shift time to higher impact work."
        : "High AI risk. Act now with role redesign, own key relationships, and ship automations.";
    return {
      score,
      raw_score: 0,
      risk_level: level,
      message: msg,
      tips: [
        {
          icon: "brain",
          title: "Enhance Creative Skills",
          description: "Focus on tasks requiring human creativity.",
        },
        {
          icon: "account-group",
          title: "Develop Human-Centric Skills",
          description: "Cultivate emotional intelligence and leadership.",
        },
        {
          icon: "school",
          title: "Continuous Learning",
          description: "Stay updated on AI advancements and adapt.",
        },
      ],
    };
  };

  useEffect(() => {
    const loadResults = async () => {
      // Check for payment verification (skip in dev mode with SCORE_OVERRIDE)
      if (SCORE_OVERRIDE === null) {
        const paymentVerified = sessionStorage.getItem("payment_verified");
        if (paymentVerified !== "true") {
          // No payment verification, redirect to unlock score page
          router.push("/unlock-score");
          return;
        }
      }

      if (SCORE_OVERRIDE !== null) {
        setResult(makeResultFromScore(SCORE_OVERRIDE));
        setLoading(false);
        return;
      }

      // Get answers from sessionStorage
      const answersStr = sessionStorage.getItem("quizAnswers");
      if (!answersStr) {
        router.push("/");
        return;
      }

      const answers = JSON.parse(answersStr);

      try {
        // Create anonymous user and calculate score
        const newUserId = await createAnonymousUser();
        setUserId(newUserId);

        const scoreResult = await calculateQuizScore(answers, newUserId);
        setResult(scoreResult);
      } catch (error) {
        console.error("Error calculating score:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [router]);

  if (loading) {
    return (
      <Center className={styles.loadingContainer}>
        <Stack align="center">
          <Loader size="lg" color="red" />
          <Text size="lg" color="dimmed">
            Calculating your AI risk score...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (!result) {
    return (
      <Center className={styles.loadingContainer}>
        <Text>Error calculating score</Text>
      </Center>
    );
  }

  const [startColor, endColor] = getRiskColor(result.risk_level);
  const [bgStart, bgEnd] = getScreenGradient(result.risk_level);
  const cardBg = hexToRgba(endColor, 0.1);
  const cardBorder = hexToRgba(endColor, 0.3);
  const iconBg = hexToRgba(endColor, 0.18);

  return (
    <div
      className={styles.gradient}
      style={{
        background: `linear-gradient(180deg, ${bgStart} 0%, ${bgEnd} 100%)`,
      }}
    >
      <Container size="md" className={styles.container}>
        {/* Score Donut */}
        <Center className={styles.scoreContainer}>
          <ScoreDonut
            score={result.score}
            riskLevel={result.risk_level}
            startColor={startColor}
            endColor={endColor}
          />
        </Center>

        {/* Message */}
        <Text className={styles.message}>{result.message}</Text>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <Text className={styles.tipsTitle}>Free Tips to Reduce Risk</Text>

          <Stack gap="md">
            {result.tips.map((tip, index) => (
              <Card
                key={index}
                className={styles.tipCard}
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                }}
              >
                <Group gap="md" align="flex-start">
                  <div
                    className={styles.tipIcon}
                    style={{ backgroundColor: iconBg }}
                  >
                    {getIconComponent(tip.icon)}
                  </div>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text className={styles.tipTitle}>{tip.title}</Text>
                    <Text className={styles.tipDescription}>
                      {tip.description}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Stack>
        </div>

        {/* Action Buttons */}
        <Stack gap="md" className={styles.buttonContainer}>
          <Button
            size="lg"
            className={styles.primaryButton}
            onClick={() => router.push("/")}
          >
            Get Personalized Plan
          </Button>

          <Button
            size="lg"
            variant="outline"
            className={styles.outlineButton}
            onClick={() => router.push("/")}
          >
            Share Results
          </Button>
        </Stack>
      </Container>
    </div>
  );
}
