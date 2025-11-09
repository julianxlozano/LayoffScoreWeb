"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Text, Textarea, Button, Stack } from "@mantine/core";
import { Aboreto } from "next/font/google";
import styles from "./page.module.css";
import ShieldBadge from "@/components/ShieldBadge";
import { trackPageView } from "@/utils/analytics";
import { createAnonymousUser, calculateAIScore } from "@/utils/api";

const aboreto = Aboreto({
  weight: ["400"],
  subsets: ["latin"],
});

export default function LandingPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track landing page view
  useEffect(() => {
    trackPageView("/");
  }, []);

  const handleSubmit = async () => {
    if (!jobDescription.trim() || isSubmitting) return;

    // Track job description entered
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "job_description_entered", {
        event_category: "Landing",
        page_location: "homepage",
      });
    }

    setIsSubmitting(true);

    try {
      // Create anonymous user
      const userId = await createAnonymousUser();
      
      // Calculate AI score
      const result = await calculateAIScore(jobDescription, userId);
      
      // Store results in sessionStorage
      sessionStorage.setItem("userId", userId.toString());
      sessionStorage.setItem("jobDescription", jobDescription);
      sessionStorage.setItem("quizScore", result.score.toString());
      sessionStorage.setItem("riskLevel", result.risk_level);
      sessionStorage.setItem("riskMessage", result.message);

      // Track quiz completed (now using AI scoring)
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "quiz_completed", {
          event_category: "Quiz",
          score: result.score,
          risk_level: result.risk_level,
        });
      }

      // Navigate to results
      router.push("/results");
    } catch (error) {
      console.error("Error submitting job description:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.gradient}>
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.coinFlip}>
              <ShieldBadge size={120} />
            </div>
            <Text className={styles.loadingText}>
              Analyzing your career risk...
            </Text>
            <Text className={styles.loadingSubtext}>
              Our AI is evaluating your job security
            </Text>
          </div>
        </div>
      )}

      <Container size="sm" className={styles.container}>
        <div className={styles.content}>
          {/* Compact CTAs at the top */}
          <div className={styles.compactCTA}>
            <div className={styles.titleContainer}>
              <Text className={`${styles.titleCompact} ${aboreto.className}`}>
                Secure Your Future
              </Text>
              <Text className={`${styles.titleCompact} ${styles.shimmer} ${aboreto.className}`}>
                Against AI
              </Text>
            </div>
            <Text className={styles.subtitleCompact}>
              Get your personalized AI risk score in seconds
            </Text>
          </div>

          {/* Job Description Input */}
          <Stack gap="md" className={styles.inputSection}>
            <Textarea
              placeholder="Tell us about your work. Example: I'm a Senior Software Engineer at a fintech startup..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.currentTarget.value)}
              minRows={6}
              maxRows={10}
              autosize
              required
              className={styles.textarea}
              styles={{
                input: {
                  fontSize: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  "&:focus": {
                    borderColor: "#ff6b6b",
                  },
                },
              }}
            />

            <Button
              size="lg"
              disabled={!jobDescription.trim() || isSubmitting}
              onClick={handleSubmit}
              loading={isSubmitting}
              className={styles.button}
            >
              {isSubmitting ? "Calculating Your Score..." : "Get My AI Risk Score"}
            </Button>

            <Text className={styles.privacyNote}>
              🔒 Your information is private and secure. No signup required.
            </Text>
          </Stack>
        </div>
      </Container>
    </div>
  );
}
