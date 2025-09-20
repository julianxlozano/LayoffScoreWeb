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
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { QUIZ_QUESTIONS, mapFirstQuestionToBoolean } from "@/constants/quiz";
import styles from "./page.module.css";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(12).fill(""));
  const [selectedOption, setSelectedOption] = useState("");

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isTwoOption = currentQuestion.options.length === 2;
  const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(answers[currentQuestionIndex + 1] || "");
    } else {
      // Submit quiz
      submitQuiz(newAnswers);
    }
  };

  const handleBack = () => {
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

    // Store answers in sessionStorage for unlock and results pages
    sessionStorage.setItem("quizAnswers", JSON.stringify(booleanAnswers));

    // Navigate to unlock score page
    router.push("/unlock-score");
  };

  return (
    <div className={styles.gradient}>
      <Container size="md" className={styles.container}>
        {/* Back button and progress */}
        <div className={styles.headerSection}>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={handleBack}
            className={styles.backButton}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>

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
        </div>

        {/* Question card */}
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

        {/* Next button */}
        <Button
          size="lg"
          disabled={!selectedOption}
          onClick={handleNext}
          className={styles.nextButton}
        >
          {currentQuestionIndex === QUIZ_QUESTIONS.length - 1
            ? "Submit"
            : "Next"}
        </Button>
      </Container>
    </div>
  );
}
