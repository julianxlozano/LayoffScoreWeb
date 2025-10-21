"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Text,
  Radio,
  Button,
  Group,
  Progress,
  ActionIcon,
  Card,
  Textarea,
  Stack,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { QUIZ_QUESTIONS, mapFirstQuestionToBoolean } from "@/constants/quiz";
import styles from "./page.module.css";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(12).fill(""));
  const [selectedOption, setSelectedOption] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJobInput, setShowJobInput] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isTwoOption = currentQuestion.options.length === 2;
  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 for job description
  const currentStep = showJobInput ? totalSteps : currentQuestionIndex + 1;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (showJobInput) {
      // Submit from job description page
      if (!jobDescription.trim()) return;
      submitQuiz(answers);
      return;
    }

    if (!selectedOption) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(answers[currentQuestionIndex + 1] || "");
    } else {
      // Show job description input after last question
      setShowJobInput(true);
    }
  };

  const handleBack = () => {
    if (showJobInput) {
      // Go back to last quiz question
      setShowJobInput(false);
      setSelectedOption(answers[QUIZ_QUESTIONS.length - 1] || "");
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1] || "");
    } else {
      router.push("/");
    }
  };

  const submitQuiz = (finalAnswers: string[]) => {
    // Convert answers to boolean array
    const booleanAnswers = finalAnswers.map((answer, index) => {
      if (index === 0) {
        return mapFirstQuestionToBoolean(answer);
      }
      return answer === "Yes";
    });

    // Store answers and job description in sessionStorage
    sessionStorage.setItem("quizAnswers", JSON.stringify(booleanAnswers));
    sessionStorage.setItem("jobDescription", jobDescription);

    // Navigate to results page (which now includes payment if not paid)
    router.push("/results");
  };

  return (
    <div className={styles.gradient}>
      <Container size="md" className={styles.container}>
        {/* Progress only */}
        <div className={styles.progressContainer}>
          <Text size="sm" className={styles.progressText}>
            Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
          </Text>
          <Progress
            value={progress}
            size="md"
            radius="md"
            color="#FF4444"
            className={styles.progressBar}
          />
        </div>

        {/* Question card or Job Input */}
        {showJobInput ? (
          <Card className={styles.questionCard}>
            <Stack gap="lg">
              <div>
                <Text className={styles.questionText}>
                  Tell us about your work
                </Text>
                <Text size="sm" color="dimmed" mt="sm">
                  This helps us provide a personalized AI risk analysis tailored
                  to your specific role and industry.
                </Text>
              </div>

              <Textarea
                placeholder="Example: I'm a Senior Software Engineer at a fintech startup. I spend my days writing React code, reviewing PRs, mentoring junior devs, and architecting new features. Our tech stack includes React, Node.js, PostgreSQL, and AWS."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.currentTarget.value)}
                minRows={6}
                maxRows={10}
                autosize
                required
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

              <Text size="xs" color="dimmed">
                Include your job title, daily activities, tech stack, and any
                unique aspects of your role.
              </Text>
            </Stack>
          </Card>
        ) : (
          <Card className={styles.questionCard}>
            <Text className={styles.questionText}>
              {currentQuestion.question}
            </Text>

            <Radio.Group
              value={selectedOption}
              onChange={setSelectedOption}
              className={styles.optionsGroup}
            >
              <div
                className={`${styles.optionsList} ${
                  isTwoOption ? styles.optionsListTwo : ""
                }`}
              >
                {currentQuestion.options.map((option) => (
                  <Card
                    key={option}
                    className={`${styles.optionCard} ${
                      selectedOption === option ? styles.selectedOptionCard : ""
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div
                      className={`${styles.optionContent} ${
                        isTwoOption ? styles.optionContentCenter : ""
                      }`}
                    >
                      {!isTwoOption && (
                        <Radio value={option} color="red" size="md" />
                      )}
                      <Text
                        className={`${styles.optionText} ${
                          isTwoOption ? styles.optionTextCenter : ""
                        }`}
                      >
                        {option}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            </Radio.Group>
          </Card>
        )}

        {/* Back and Next buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            alignItems: "center",
          }}
        >
          <ActionIcon
            size={56}
            variant="outline"
            onClick={handleBack}
            className={styles.backButton}
            style={{
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              minHeight: "56px",
              alignSelf: "center",
            }}
          >
            <IconArrowLeft size={24} />
          </ActionIcon>
          <Button
            size="lg"
            disabled={showJobInput ? !jobDescription.trim() : !selectedOption}
            onClick={handleNext}
            className={styles.nextButton}
            style={{ flex: 1, marginTop: 0 }}
          >
            {showJobInput
              ? "Get My Score"
              : currentQuestionIndex === QUIZ_QUESTIONS.length - 1
              ? "Next"
              : "Next"}
          </Button>
        </div>
      </Container>
    </div>
  );
}
