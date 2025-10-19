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
  ActionIcon,
  Skeleton,
  Divider,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBrain,
  IconUsers,
  IconSchool,
  IconAlertCircle,
  IconShield,
  IconTrendingUp,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconRobot,
  IconChartBar,
  IconAlertTriangle,
  IconDownload,
  IconLock,
  IconCreditCard,
  IconStar,
} from "@tabler/icons-react";
import ScoreDonut from "@/components/ScoreDonut";
import {
  calculateQuizScore,
  createAnonymousUser,
  generateQuickAnalysis,
  generateAIAnalysis,
  generateSearchQueries,
  executeWebSearch,
  synthesizeAnalysis,
  getRegenerationCounts,
  incrementRegenerationCount,
  QuizResult,
  QuickAnalysis,
  AIAnalysis,
} from "@/utils/api";
import { getRiskColor, getScreenGradient, hexToRgba } from "@/utils/colors";
import { generatePDF } from "@/utils/pdfGenerator";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/utils/payment";
import ExpressCheckout from "@/components/ExpressCheckout";
import styles from "./page.module.css";

// Set to a number (e.g., 20, 50, 65, 90) to preview states; null uses real backend/local calc
const SCORE_OVERRIDE: number | null = null;

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quickAnalysis, setQuickAnalysis] = useState<QuickAnalysis | null>(
    null
  );
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [quickReportExpanded, setQuickReportExpanded] = useState(true); // Expanded by default
  const [fullReportExpanded, setFullReportExpanded] = useState(false);
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState<string>("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [quickRegenCount, setQuickRegenCount] = useState(0);
  const [fullRegenCount, setFullRegenCount] = useState(0);

  // Load regeneration counts from backend when userId is available
  useEffect(() => {
    const loadCounts = async () => {
      if (userId) {
        const counts = await getRegenerationCounts(userId.toString());
        setQuickRegenCount(counts.quick_count);
        setFullRegenCount(counts.full_count);
      }
    };
    loadCounts();
  }, [userId]);

  // Function to render text with markdown-style formatting
  const renderFormattedText = (text: string) => {
    // Split by lines and process each
    return text.split("\n").map((line, index) => {
      // Check for headers
      if (line.startsWith("# ")) {
        return (
          <Text
            key={index}
            size="xl"
            fw={700}
            color="white"
            style={{
              marginTop: index > 0 ? "1rem" : 0,
              marginBottom: "0.5rem",
            }}
          >
            {line.replace("# ", "")}
          </Text>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <Text
            key={index}
            size="lg"
            fw={600}
            color="white"
            style={{ marginTop: "1rem", marginBottom: "0.5rem" }}
          >
            {line.replace("## ", "")}
          </Text>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <Text
            key={index}
            size="md"
            fw={600}
            color="white"
            style={{ marginTop: "0.8rem", marginBottom: "0.4rem" }}
          >
            {line.replace("### ", "")}
          </Text>
        );
      }
      // Regular paragraphs
      if (line.trim()) {
        return (
          <Text
            key={index}
            color="rgba(255, 255, 255, 0.9)"
            style={{ marginBottom: "0.5rem", lineHeight: 1.8 }}
          >
            {line}
          </Text>
        );
      }
      return null;
    });
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "brain":
        return <IconBrain size={24} />;
      case "users":
      case "account-group":
        return <IconUsers size={24} />;
      case "school":
        return <IconSchool size={24} />;
      case "alert":
        return <IconAlertCircle size={24} />;
      case "shield":
        return <IconShield size={24} />;
      case "trending-up":
        return <IconTrendingUp size={24} />;
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
      const paymentVerified = sessionStorage.getItem("payment_verified");
      const hasPaid = SCORE_OVERRIDE !== null || paymentVerified === "true";

      setIsPaid(hasPaid);
      if (!hasPaid) {
        setShowPayment(true);
        // Don't return - we still want to show the score
      }

      if (SCORE_OVERRIDE !== null) {
        setResult(makeResultFromScore(SCORE_OVERRIDE));
        setLoading(false);
        return;
      }

      // Get answers from sessionStorage
      const answersStr = sessionStorage.getItem("quizAnswers");
      if (!answersStr) {
        console.error("No quiz answers found in sessionStorage");
        setLoading(false);
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
        setLoading(false); // Score loaded, hide loading screen

        // ALWAYS generate quick assessment (even before payment for teaser)
        const jobDescription = sessionStorage.getItem("jobDescription");
        if (jobDescription && scoreResult) {
          setLoadingQuick(true);
          try {
            const quick = await generateQuickAnalysis(
              jobDescription,
              scoreResult.score,
              scoreResult.risk_level
            );
            setQuickAnalysis(quick);
          } catch (error) {
            console.error("Error generating quick analysis:", error);
          } finally {
            setLoadingQuick(false);
          }
        }

        // Only fetch full AI analysis if user has paid
        if (!hasPaid) {
          return; // Stop here if not paid, show payment UI
        }

        // User has paid - proceed with full AI analysis
        if (jobDescription && scoreResult) {
          // Then start full analysis with modular approach
          setLoadingAI(true);
          setAiProgress("Generating search queries");

          try {
            // Step 1: Generate search queries
            const queriesResult = await generateSearchQueries(jobDescription);
            if (!queriesResult.success || !queriesResult.queries) {
              console.error(
                "Failed to generate search queries, using defaults"
              );
              // Use default queries if generation fails
              queriesResult.queries = {
                trends: `AI automation trends ${jobDescription} ${new Date().getFullYear()}`,
                tools: `AI tools disrupting ${jobDescription}`,
                benchmarks: `industry benchmarks ${jobDescription} future outlook`,
              };
            }

            // Step 2: Execute searches in parallel with individual error handling
            setAiProgress("Searching for industry trends");

            // Use Promise.allSettled instead of Promise.all to handle individual failures
            const searchPromises = [
              executeWebSearch(queriesResult.queries.trends, "trends"),
              executeWebSearch(queriesResult.queries.tools, "tools"),
              executeWebSearch(queriesResult.queries.benchmarks, "benchmarks"),
            ];

            // Execute all searches in parallel, but don't fail if one fails
            const searchResults = await Promise.allSettled(searchPromises);

            // Track progress for each completed search
            let completedSearches = 0;
            const combinedResults: {
              trends?: string;
              tools?: string;
              benchmarks?: string;
            } = {};

            // Process each result individually
            searchResults.forEach((result, index) => {
              if (
                result.status === "fulfilled" &&
                result.value.success &&
                result.value.result
              ) {
                completedSearches++;
                const searchType = ["trends", "tools", "benchmarks"][index];
                combinedResults[searchType as keyof typeof combinedResults] =
                  result.value.result;

                // Update progress based on what completed
                if (completedSearches === 1) {
                  setAiProgress("Found industry trends, searching for tools");
                } else if (completedSearches === 2) {
                  setAiProgress("Found tools data, getting benchmarks");
                }
              } else {
                console.warn(
                  `Search ${index} failed:`,
                  result.status === "rejected" ? result.reason : "No result"
                );
              }
            });

            // Only proceed if we have at least one successful search
            if (Object.keys(combinedResults).length === 0) {
              throw new Error("All searches failed");
            }

            // Step 3: Synthesize final analysis with whatever results we have
            setAiProgress(
              `Analyzing ${Object.keys(combinedResults).length} search results`
            );
            const analysis = await synthesizeAnalysis(
              jobDescription,
              scoreResult.score,
              scoreResult.risk_level,
              combinedResults
            );

            setAiAnalysis(analysis);
            setAiProgress("");

            // Log what succeeded/failed for debugging
            console.log(
              `Analysis completed with ${
                Object.keys(combinedResults).length
              }/3 searches successful`
            );
          } catch (error) {
            console.error("Error generating AI analysis:", error);
            // Fallback to the old single-call method if modular approach fails
            try {
              setAiProgress("Using fallback analysis method");
              const analysis = await generateAIAnalysis(
                jobDescription,
                scoreResult.score,
                scoreResult.risk_level,
                newUserId.toString()
              );
              setAiAnalysis(analysis);
            } catch (fallbackError) {
              console.error("Fallback analysis also failed:", fallbackError);
              // Set a minimal analysis if everything fails
              setAiAnalysis({
                success: false,
                report: `Based on your score of ${scoreResult.score}/100, you're in the ${scoreResult.risk_level} risk category. We encountered issues generating a detailed analysis, but your risk level suggests you should focus on developing AI-complementary skills.`,
                actionable_steps: [],
                quiz_score: scoreResult.score,
                risk_level: scoreResult.risk_level,
              });
            }
          } finally {
            setLoadingAI(false);
          }
        }
      } catch (error: any) {
        console.error("Error calculating score:", error);
        setError(error?.message || "Failed to calculate score");
        setLoading(false);
        // Don't redirect on error - let user see what happened
      }
    };

    loadResults();
  }, [router]);

  const handlePaymentSuccess = async () => {
    // Mark as paid and trigger AI analysis
    sessionStorage.setItem("payment_verified", "true");
    setIsPaid(true);
    setShowPayment(false);

    // Trigger AI analysis
    const jobDescription = sessionStorage.getItem("jobDescription");
    if (jobDescription && result) {
      // First, get quick analysis
      setLoadingQuick(true);
      try {
        const quick = await generateQuickAnalysis(
          jobDescription,
          result.score,
          result.risk_level
        );
        setQuickAnalysis(quick);
      } catch (error) {
        console.error("Error generating quick analysis:", error);
      } finally {
        setLoadingQuick(false);
      }

      // Then start full analysis
      await startFullAnalysis(jobDescription, result);
    }
  };

  const startFullAnalysis = async (
    jobDescription: string,
    scoreResult: QuizResult,
    isRegeneration: boolean = false
  ) => {
    setLoadingAI(true);
    setAiProgress("Generating search queries");

    try {
      const queriesResult = await generateSearchQueries(jobDescription);
      if (!queriesResult.success || !queriesResult.queries) {
        console.error("Failed to generate search queries, using defaults");
        queriesResult.queries = {
          trends: `AI automation trends ${jobDescription} ${new Date().getFullYear()}`,
          tools: `AI tools disrupting ${jobDescription}`,
          benchmarks: `industry benchmarks ${jobDescription} future outlook`,
        };
      }

      setAiProgress("Searching for industry trends");
      const searchPromises = [
        executeWebSearch(queriesResult.queries.trends, "trends"),
        executeWebSearch(queriesResult.queries.tools, "tools"),
        executeWebSearch(queriesResult.queries.benchmarks, "benchmarks"),
      ];

      const searchResults = await Promise.allSettled(searchPromises);
      let completedSearches = 0;
      const combinedResults: {
        trends?: string;
        tools?: string;
        benchmarks?: string;
      } = {};

      searchResults.forEach((result, index) => {
        if (
          result.status === "fulfilled" &&
          result.value.success &&
          result.value.result
        ) {
          completedSearches++;
          const searchType = ["trends", "tools", "benchmarks"][index];
          combinedResults[searchType as keyof typeof combinedResults] =
            result.value.result;

          if (completedSearches === 1) {
            setAiProgress("Found industry trends, searching for tools");
          } else if (completedSearches === 2) {
            setAiProgress("Found tools data, getting benchmarks");
          }
        }
      });

      if (Object.keys(combinedResults).length === 0) {
        throw new Error("All searches failed");
      }

      setAiProgress(
        `Analyzing ${Object.keys(combinedResults).length} search results`
      );
      const analysis = await synthesizeAnalysis(
        jobDescription,
        scoreResult.score,
        scoreResult.risk_level,
        combinedResults,
        isRegeneration // Pass regeneration flag to backend
      );

      setAiAnalysis(analysis);
      setAiProgress("");

      // Update local count if this was a regeneration and successful
      if (isRegeneration && analysis.success) {
        setFullRegenCount((prev) => prev + 1);
      }
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.response?.status === 429) {
        notifications.show({
          title: "Rate Limit Exceeded",
          message:
            error.response?.data?.message ||
            "Too many regenerations. Try again tomorrow.",
          color: "red",
          position: "top-center",
        });
      }
      console.error("Error generating AI analysis:", error);
      // Don't increment count on failure
    } finally {
      setLoadingAI(false);
    }
  };

  const handleRegenerateQuick = async () => {
    // Check if limit reached
    if (quickRegenCount >= 3) {
      notifications.show({
        title: "Generation Limit Reached",
        message:
          "You have reached the maximum of 3 regenerations for the Quick Summary.",
        color: "red",
        position: "top-center",
      });
      return;
    }

    const jobDescription = sessionStorage.getItem("jobDescription");
    if (!jobDescription || !result) return;

    setLoadingQuick(true);
    try {
      const quick = await generateQuickAnalysis(
        jobDescription,
        result.score,
        result.risk_level,
        true // is_regeneration flag
      );

      setQuickAnalysis(quick);

      // Update local count if successful (backend already incremented)
      if (quick.success) {
        setQuickRegenCount((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Error regenerating quick analysis:", error);

      // Check if it's a rate limit error
      if (error.response?.status === 429) {
        notifications.show({
          title: "Rate Limit Exceeded",
          message:
            error.response?.data?.message ||
            "Too many regenerations. Try again tomorrow.",
          color: "red",
          position: "top-center",
        });
      }
    } finally {
      setLoadingQuick(false);
    }
  };

  const handleRegenerateFull = async () => {
    // Check if limit reached
    if (fullRegenCount >= 3) {
      notifications.show({
        title: "Generation Limit Reached",
        message:
          "You have reached the maximum of 3 regenerations for the Comprehensive Analysis.",
        color: "red",
        position: "top-center",
      });
      return;
    }

    const jobDescription = sessionStorage.getItem("jobDescription");
    if (!jobDescription || !result) return;

    // Pass isRegeneration flag so count increments on success
    await startFullAnalysis(jobDescription, result, true);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    setDownloadingPDF(true);
    try {
      // Get job description for the report
      const jobDescription =
        sessionStorage.getItem("jobDescription") || "Professional";

      await generatePDF({
        result,
        aiAnalysis,
        quickAnalysis,
        userName: jobDescription,
        date: new Date(),
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingPDF(false);
    }
  };

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
        <Stack align="center" gap="lg">
          <Text size="xl" color="red">
            Unable to Load Results
          </Text>
          <Text
            size="sm"
            color="dimmed"
            ta="center"
            style={{ maxWidth: "400px" }}
          >
            {error || "No quiz data found. Please take the quiz again."}
          </Text>
          <Button
            size="lg"
            onClick={() => router.push("/")}
            style={{ backgroundColor: "#ff6b6b" }}
          >
            Return to Home
          </Button>
        </Stack>
      </Center>
    );
  }

  // Now TypeScript knows result is not null
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
        {/* <Text className={styles.message}>{result.message}</Text> */}

        {/* Content wrapper with selective blur on bottom 75% */}
        <div style={{ position: "relative" }}>
          {/* Blur overlay - no black background, just blur with smooth fade */}
          {showPayment && (
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "-20px",
                right: "-20px",
                bottom: "-20px",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 5%, rgba(255,255,255,1) 10%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 5%, rgba(255,255,255,1) 10%)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Risk Summary */}
          <Card
            className={styles.analysisCard}
            style={{
              marginTop: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <Stack gap="md">
              <Text size="lg" fw={600} color="white">
                Risk Summary
              </Text>

              {loadingQuick ? (
                <Stack gap="sm">
                  <Skeleton height={20} radius="sm" />
                  <Skeleton height={20} radius="sm" />
                  <Skeleton height={20} width="70%" radius="sm" />
                </Stack>
              ) : quickAnalysis ? (
                <Text className={styles.analysisReport}>
                  {quickAnalysis.quick_report}
                </Text>
              ) : (
                <Text size="sm" color="dimmed">
                  Generating summary...
                </Text>
              )}

              {/* Regenerate button - always visible after payment */}
              {!showPayment && (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleRegenerateQuick}
                  loading={loadingQuick}
                  disabled={quickRegenCount >= 3}
                  style={{ marginTop: "1rem", alignSelf: "flex-start" }}
                >
                  🔄 Regenerate Summary{" "}
                  {quickRegenCount < 3 && `(${3 - quickRegenCount} left)`}
                </Button>
              )}
            </Stack>
          </Card>

          {/* Payment Card - Positioned at 15% mark, overlays blurred content */}
          {showPayment && (
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 100,
                width: "100%",
                maxWidth: "500px",
                padding: "0 20px",
              }}
            >
              <Card
                style={{
                  background: "rgba(26, 26, 26, 0.98)",
                  border: "2px solid rgba(255, 107, 107, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack gap="md">
                  <Badge
                    size="lg"
                    color="red"
                    variant="light"
                    style={{ alignSelf: "center" }}
                  >
                    Limited Time: 74% OFF
                  </Badge>

                  <Text size="xl" fw={700} color="white" ta="center">
                    Unlock Full Report
                  </Text>

                  <Text size="sm" color="rgba(255, 255, 255, 0.8)" ta="center">
                    🔒 See complete analysis + AI-powered industry insights +
                    personalized action plan
                  </Text>

                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px 0",
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Text
                      size="xs"
                      color="dimmed"
                      style={{ textDecoration: "line-through" }}
                    >
                      $39
                    </Text>
                    <Text size="48px" fw={700} color="white">
                      $0.50
                    </Text>
                    <Text size="sm" color="dimmed">
                      one-time
                    </Text>
                  </div>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      mode: "payment",
                      amount: 50,
                      currency: "usd",
                      appearance: {
                        theme: "night",
                        variables: { colorPrimary: "#ff6b6b" },
                      },
                    }}
                  >
                    <ExpressCheckout
                      amount={50}
                      userId={userId?.toString()}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </Elements>

                  <Divider label="Or pay with card" labelPosition="center" />

                  <Button
                    size="lg"
                    fullWidth
                    leftSection={<IconCreditCard size={24} />}
                    style={{ backgroundColor: "#ff4444", border: "none" }}
                    onClick={handlePaymentSuccess}
                  >
                    Pay with Card - $0.50
                  </Button>

                  {/* Dev bypass button - only show in development */}
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      size="md"
                      variant="outline"
                      onClick={handlePaymentSuccess}
                      fullWidth
                      style={{
                        marginTop: "8px",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      Skip Payment (Dev Only)
                    </Button>
                  )}

                  <Text size="xs" color="dimmed" ta="center">
                    🔒 Secure checkout • 30-day guarantee
                  </Text>
                </Stack>
              </Card>
            </div>
          )}

          {/* Full AI Analysis Card with Web Search */}
          <Card
            className={styles.analysisCard}
            style={{ marginBottom: "2rem" }}
          >
            <Stack gap="md">
              <Text size="lg" fw={600} color="white">
                Comprehensive AI Analysis
              </Text>

              {/* Progress indicator - show when actively loading (not when locked) */}
              {loadingAI && aiProgress && !showPayment && (
                <Group gap="xs">
                  <Loader size="xs" color="red" />
                  <Text
                    size="sm"
                    color="dimmed"
                    style={{ fontStyle: "italic" }}
                  >
                    {aiProgress}
                    <span className={styles.loadingDots}>...</span>
                  </Text>
                </Group>
              )}

              {/* Show skeletons when locked OR when loading after payment */}
              {!aiAnalysis ? (
                <>
                  {/* Statistics Skeleton */}
                  <div>
                    <Text
                      size="lg"
                      fw={600}
                      color="white"
                      style={{ marginBottom: "1rem" }}
                    >
                      <IconChartBar
                        size={20}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "0.5rem",
                        }}
                      />
                      Industry Statistics
                    </Text>
                    <Group gap="sm">
                      {[1, 2, 3].map((i) => (
                        <Card
                          key={i}
                          style={{
                            flex: 1,
                            minWidth: "150px",
                            background: "rgba(100, 255, 100, 0.1)",
                            border: "1px solid rgba(100, 255, 100, 0.3)",
                          }}
                        >
                          <Skeleton
                            height={32}
                            width="60%"
                            radius="sm"
                            style={{ marginBottom: "8px" }}
                          />
                          <Skeleton
                            height={12}
                            width="80%"
                            radius="sm"
                            style={{ marginBottom: "4px" }}
                          />
                          <Skeleton height={10} width="100%" radius="sm" />
                        </Card>
                      ))}
                    </Group>
                  </div>

                  {/* Report Text Skeleton */}
                  <Stack gap="sm">
                    <Skeleton height={20} radius="sm" />
                    <Skeleton height={20} radius="sm" />
                    <Skeleton height={20} width="80%" radius="sm" />
                  </Stack>

                  {/* Vulnerable Tasks Skeleton */}
                  <div>
                    <Text
                      size="lg"
                      fw={600}
                      color="white"
                      style={{ marginBottom: "1rem" }}
                    >
                      <IconAlertTriangle
                        size={20}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "0.5rem",
                        }}
                      />
                      Vulnerable Tasks
                    </Text>
                    <Stack gap="sm">
                      {[1, 2, 3].map((i) => (
                        <Card
                          key={i}
                          style={{
                            background: "rgba(255, 100, 100, 0.1)",
                            border: "1px solid rgba(255, 100, 100, 0.3)",
                          }}
                        >
                          <Skeleton
                            height={14}
                            width="60%"
                            radius="sm"
                            style={{ marginBottom: "6px" }}
                          />
                          <Skeleton height={12} width="90%" radius="sm" />
                        </Card>
                      ))}
                    </Stack>
                  </div>

                  {/* AI Tools Skeleton */}
                  <div>
                    <Text
                      size="lg"
                      fw={600}
                      color="white"
                      style={{ marginBottom: "1rem" }}
                    >
                      <IconRobot
                        size={20}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "0.5rem",
                        }}
                      />
                      AI Tools Impacting Your Role
                    </Text>
                    <Stack gap="sm">
                      {[1, 2, 3].map((i) => (
                        <Card
                          key={i}
                          style={{
                            background: "rgba(100, 100, 255, 0.1)",
                            border: "1px solid rgba(100, 100, 255, 0.3)",
                          }}
                        >
                          <Skeleton
                            height={14}
                            width="50%"
                            radius="sm"
                            style={{ marginBottom: "6px" }}
                          />
                          <Skeleton height={12} width="85%" radius="sm" />
                        </Card>
                      ))}
                    </Stack>
                  </div>
                </>
              ) : aiAnalysis ? (
                <Stack gap="lg">
                  {/* Statistics Section - Moved to top */}
                  {aiAnalysis.statistics &&
                    aiAnalysis.statistics.length > 0 && (
                      <div>
                        <Text
                          size="lg"
                          fw={600}
                          color="white"
                          style={{ marginBottom: "1rem" }}
                        >
                          <IconChartBar
                            size={20}
                            style={{
                              verticalAlign: "middle",
                              marginRight: "0.5rem",
                            }}
                          />
                          Industry Statistics
                        </Text>
                        <Group gap="sm">
                          {aiAnalysis.statistics.map((stat, index) => (
                            <Card
                              key={index}
                              style={{
                                flex: 1,
                                minWidth: "150px",
                                background: "rgba(100, 255, 100, 0.1)",
                                border: "1px solid rgba(100, 255, 100, 0.3)",
                              }}
                            >
                              <Text size="xl" fw={700} color="white">
                                {stat.value}
                              </Text>
                              <Text size="xs" fw={500} color="white">
                                {stat.title}
                              </Text>
                              <Text
                                size="xs"
                                color="dimmed"
                                style={{ marginTop: "0.25rem" }}
                              >
                                {stat.description}
                              </Text>
                            </Card>
                          ))}
                        </Group>
                      </div>
                    )}

                  {/* Main report text with formatting */}
                  <div>{renderFormattedText(aiAnalysis.report)}</div>

                  {/* Vulnerable Tasks Section */}
                  {aiAnalysis.vulnerable_tasks &&
                    aiAnalysis.vulnerable_tasks.length > 0 && (
                      <div>
                        <Text
                          size="lg"
                          fw={600}
                          color="white"
                          style={{ marginBottom: "1rem" }}
                        >
                          <IconAlertTriangle
                            size={20}
                            style={{
                              verticalAlign: "middle",
                              marginRight: "0.5rem",
                            }}
                          />
                          Vulnerable Tasks
                        </Text>
                        <Stack gap="sm">
                          {aiAnalysis.vulnerable_tasks.map((task, index) => (
                            <Card
                              key={index}
                              style={{
                                background: "rgba(255, 100, 100, 0.1)",
                                border: "1px solid rgba(255, 100, 100, 0.3)",
                              }}
                            >
                              <Text fw={500} color="white" size="sm">
                                {task.title}
                              </Text>
                              <Text
                                size="xs"
                                color="dimmed"
                                style={{ marginTop: "0.25rem" }}
                              >
                                {task.description}
                              </Text>
                            </Card>
                          ))}
                        </Stack>
                      </div>
                    )}

                  {/* AI Tools Section */}
                  {aiAnalysis.ai_tools && aiAnalysis.ai_tools.length > 0 && (
                    <div>
                      <Text
                        size="lg"
                        fw={600}
                        color="white"
                        style={{ marginBottom: "1rem" }}
                      >
                        <IconRobot
                          size={20}
                          style={{
                            verticalAlign: "middle",
                            marginRight: "0.5rem",
                          }}
                        />
                        AI Tools Impacting Your Role
                      </Text>
                      <Stack gap="sm">
                        {aiAnalysis.ai_tools.map((tool, index) => (
                          <Card
                            key={index}
                            style={{
                              background: "rgba(100, 100, 255, 0.1)",
                              border: "1px solid rgba(100, 100, 255, 0.3)",
                            }}
                          >
                            <Text fw={500} color="white" size="sm">
                              {tool.name}
                            </Text>
                            <Text
                              size="xs"
                              color="dimmed"
                              style={{ marginTop: "0.25rem" }}
                            >
                              {tool.description}
                            </Text>
                          </Card>
                        ))}
                      </Stack>
                    </div>
                  )}
                </Stack>
              ) : (
                <Text size="sm" color="dimmed" style={{ fontStyle: "italic" }}>
                  Analysis will appear here once complete...
                </Text>
              )}

              {/* Regenerate button - always visible after payment */}
              {!showPayment && (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleRegenerateFull}
                  loading={loadingAI}
                  disabled={fullRegenCount >= 3}
                  style={{ marginTop: "1rem", alignSelf: "flex-start" }}
                >
                  🔄 Regenerate Comprehensive Analysis{" "}
                  {fullRegenCount < 3 && `(${3 - fullRegenCount} left)`}
                </Button>
              )}
            </Stack>
          </Card>

          {/* Tips Section - Use AI tips if available, otherwise default tips */}
          <div className={styles.tipsSection}>
            <Text className={styles.tipsTitle}>
              {aiAnalysis?.actionable_steps?.length
                ? "Your Action Plan"
                : "Free Tips to Reduce Risk"}
            </Text>

            <Stack gap="md">
              {(aiAnalysis?.actionable_steps || result.tips).map(
                (tip, index) => (
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
                        <Group justify="space-between" align="center">
                          <Text className={styles.tipTitle}>{tip.title}</Text>
                          {(tip as any).link && (
                            <ActionIcon
                              component="a"
                              href={(tip as any).link}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="subtle"
                              color="gray"
                              size="sm"
                            >
                              <IconExternalLink size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                        <Text className={styles.tipDescription}>
                          {tip.description}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                )
              )}
            </Stack>
          </div>

          {/* Download Report Section */}
          <Card
            className={styles.analysisCard}
            style={{ marginBottom: "2rem", textAlign: "center" }}
          >
            <Stack gap="md" align="center">
              <Text size="lg" fw={600} color="white">
                Save Your Analysis
              </Text>
              <Text size="sm" color="rgba(255, 255, 255, 0.7)" ta="center">
                Download a comprehensive PDF report with your risk score, AI
                analysis, and personalized action plan.
              </Text>
              <Button
                size="lg"
                leftSection={<IconDownload size={24} />}
                onClick={handleDownloadPDF}
                loading={downloadingPDF}
                style={{
                  backgroundColor: "#ff6b6b",
                  border: "none",
                  color: "white",
                  padding: "12px 32px",
                }}
              >
                {downloadingPDF
                  ? "Generating Report..."
                  : "Download Full Report (PDF)"}
              </Button>
            </Stack>
          </Card>

          {/* Action Buttons */}
          <Stack gap="md" className={styles.buttonContainer}>
            <Button
              size="lg"
              className={styles.primaryButton}
              onClick={() => router.push("/")}
            >
              Take Quiz Again
            </Button>

            <Button
              size="lg"
              variant="outline"
              className={styles.outlineButton}
              onClick={() => {
                // Share functionality could be added here
                if (navigator.share) {
                  navigator.share({
                    title: "My LayoffScore AI Risk Assessment",
                    text: `I scored ${result.score}/100 on the LayoffScore AI risk assessment. Check out your own risk level!`,
                    url: window.location.origin,
                  });
                } else {
                  // Fallback for browsers that don't support Web Share API
                  navigator.clipboard.writeText(
                    `I scored ${result.score}/100 on the LayoffScore AI risk assessment. Check out your own risk level at ${window.location.origin}`
                  );
                }
              }}
            >
              Share Results
            </Button>
          </Stack>
        </div>
        {/* End content wrapper with selective blur */}
      </Container>
    </div>
  );
}
