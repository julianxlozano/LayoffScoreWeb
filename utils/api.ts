import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface QuizResult {
  score: number;
  raw_score: number;
  risk_level: string;
  message: string;
  tips: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export const createAnonymousUser = async (): Promise<number> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/anonymous/`);
    return response.data.user_id;
  } catch (error) {
    console.error("Error creating anonymous user:", error);
    throw error;
  }
};

export const calculateQuizScore = async (
  answers: boolean[],
  userId: number
): Promise<QuizResult> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/quiz/calculate/`, {
      answers,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error calculating score:", error);
    // Fallback to local calculation
    return calculateScoreLocally(answers);
  }
};

export const calculateScoreLocally = (answers: boolean[]): QuizResult => {
  // Local calculation as fallback
  let rawScore = 0;
  for (let i = 0; i < 7; i++) {
    if (answers[i]) rawScore += 10;
  }
  for (let i = 7; i < 12; i++) {
    if (answers[i]) rawScore -= 10;
  }

  const score = Math.round(((rawScore + 40) / 120) * 100);
  let risk_level = "Low";
  let message = "";

  if (score <= 24) {
    risk_level = "Low";
    message = "Low AI risk. Keep building AI skills and track weekly wins.";
  } else if (score <= 49) {
    risk_level = "Moderate";
    message =
      "Moderate AI risk. Automate one routine task and add one live touchpoint this week.";
  } else if (score <= 74) {
    risk_level = "Elevated";
    message =
      "Elevated AI risk. Start a 14 day sprint to automate and shift time to higher impact work.";
  } else {
    risk_level = "High";
    message =
      "High AI risk. Act now with role redesign, own key relationships, and ship automations.";
  }

  return {
    score,
    raw_score: rawScore,
    risk_level,
    message,
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
