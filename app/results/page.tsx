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
} from "@mantine/core";
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
  QuizResult,
  QuickAnalysis,
  AIAnalysis,
} from "@/utils/api";
import { getRiskColor, getScreenGradient, hexToRgba } from "@/utils/colors";
import { generatePDF } from "@/utils/pdfGenerator";
import styles from "./page.module.css";

// Set to a number (e.g., 20, 50, 65, 90) to preview states; null uses real backend/local calc
const SCORE_OVERRIDE: number | null = null;

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quickAnalysis, setQuickAnalysis] = useState<QuickAnalysis | null>(
    null
  );
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [quickReportExpanded, setQuickReportExpanded] = useState(false);
  const [fullReportExpanded, setFullReportExpanded] = useState(false);
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState<string>("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);

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
        setLoading(false); // Show score immediately

        // Get job description and fetch AI analysis
        const jobDescription = sessionStorage.getItem("jobDescription");
        if (jobDescription && scoreResult) {
          // First, get quick analysis
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
      } catch (error) {
        console.error("Error calculating score:", error);
        setLoading(false);
      }
    };

    loadResults();
  }, [router]);

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

        {/* Quick Analysis Card */}
        <Card
          className={styles.analysisCard}
          style={{ marginTop: "2rem", marginBottom: "1rem" }}
        >
          <Stack gap="md">
            <Text size="lg" fw={600} color="white">
              Quick Risk Assessment
            </Text>

            {loadingQuick ? (
              <Stack gap="sm">
                <Skeleton height={20} radius="sm" />
                <Skeleton height={20} radius="sm" />
                <Skeleton height={20} width="70%" radius="sm" />
              </Stack>
            ) : quickAnalysis ? (
              <div style={{ position: "relative" }}>
                <Text
                  className={styles.analysisReport}
                  style={{
                    maxHeight: quickReportExpanded ? "none" : "120px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  {quickAnalysis.quick_report}
                </Text>

                {quickAnalysis.quick_report.length > 300 && (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setQuickReportExpanded(!quickReportExpanded)}
                    rightSection={
                      quickReportExpanded ? (
                        <IconChevronUp size={16} />
                      ) : (
                        <IconChevronDown size={16} />
                      )
                    }
                    style={{ marginTop: "0.5rem" }}
                  >
                    {quickReportExpanded ? "Show Less" : "Read More"}
                  </Button>
                )}
              </div>
            ) : null}
          </Stack>
        </Card>

        {/* Full AI Analysis Card with Web Search */}
        <Card className={styles.analysisCard} style={{ marginBottom: "2rem" }}>
          <Stack gap="md">
            <Text size="lg" fw={600} color="white">
              Comprehensive AI Analysis
            </Text>

            {loadingAI ? (
              <>
                <Stack gap="sm">
                  <Skeleton height={20} radius="sm" />
                  <Skeleton height={20} radius="sm" />
                  <Skeleton height={20} width="80%" radius="sm" />
                </Stack>
                {aiProgress && (
                  <Group gap="xs" style={{ marginTop: "0.5rem" }}>
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
              </>
            ) : aiAnalysis ? (
              <Stack gap="lg">
                {/* Statistics Section - Moved to top */}
                {aiAnalysis.statistics && aiAnalysis.statistics.length > 0 && (
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
            {(aiAnalysis?.actionable_steps || result.tips).map((tip, index) => (
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
            ))}
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
      </Container>
    </div>
  );
}
