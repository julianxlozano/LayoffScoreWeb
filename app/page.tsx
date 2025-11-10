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
  const [showFAQ, setShowFAQ] = useState(false);

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
              <Text
                className={`${styles.titleCompact} ${styles.shimmer} ${aboreto.className}`}
              >
                Against AI
              </Text>
            </div>
            <Text className={styles.statText}>
              50% of professionals say AI could impact their role in the next 2
              years. See where you stand.
            </Text>
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
              {isSubmitting
                ? "Calculating Your Score..."
                : "Get My AI Risk Score"}
            </Button>

            <div className={styles.privacyContainer}>
              <Text className={styles.privacyNote}>
                🔒 Your information is private and secure. No signup required.
              </Text>
              <button
                className={styles.faqLink}
                onClick={() => setShowFAQ(!showFAQ)}
              >
                {showFAQ ? "Hide FAQs" : "FAQs"}
              </button>
            </div>
          </Stack>

          {/* FAQ Section */}
          {showFAQ && (
            <div className={styles.faqSection}>
              <Text className={styles.faqTitle}>FAQs</Text>

              <div className={styles.faqItem}>
                <Text className={styles.faqQuestion}>What is LayoffScore?</Text>
                <Text className={styles.faqAnswer}>
                  LayoffScore helps you understand how vulnerable your job is to
                  AI automation. By analyzing your role, skills, and industry,
                  it gives you a personalized score and recommendations to help
                  you future-proof your career.
                </Text>
              </div>

              <div className={styles.faqItem}>
                <Text className={styles.faqQuestion}>
                  How does the AI risk score work?
                </Text>
                <Text className={styles.faqAnswer}>
                  We use real-time data and AI models trained on labor trends,
                  automation reports, and job postings to assess how likely
                  different roles are to be replaced or transformed by AI.
                </Text>
              </div>

              <div className={styles.faqItem}>
                <Text className={styles.faqQuestion}>Is my data private?</Text>
                <Text className={styles.faqAnswer}>
                  Absolutely. We don't store any personally identifiable
                  information. Your responses are anonymized and used only to
                  calculate your risk score and generate insights.
                </Text>
              </div>

              <div className={styles.faqItem}>
                <Text className={styles.faqQuestion}>
                  Who is LayoffScore for?
                </Text>
                <Text className={styles.faqAnswer}>
                  Professionals, students, and job seekers who want to stay
                  ahead of automation trends — from software engineers to
                  marketing specialists and beyond.
                </Text>
              </div>

              <div className={styles.faqItem}>
                <Text className={styles.faqQuestion}>
                  What do I get after completing the assessment?
                </Text>
                <Text className={styles.faqAnswer}>
                  You'll receive your LayoffScore, a detailed report showing
                  which parts of your job are most at risk, and personalized
                  steps to reduce that risk — including skills to learn and
                  industries to watch.
                </Text>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
