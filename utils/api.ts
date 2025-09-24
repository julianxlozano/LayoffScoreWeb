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

export interface AIAnalysis {
  success: boolean;
  report: string;
  vulnerable_tasks?: Array<{
    title: string;
    description: string;
  }>;
  ai_tools?: Array<{
    name: string;
    description: string;
  }>;
  statistics?: Array<{
    title: string;
    value: string;
    description: string;
  }>;
  actionable_steps: Array<{
    icon: string;
    title: string;
    description: string;
    link?: string;
  }>;
  quiz_score: number;
  risk_level: string;
}

export interface QuickAnalysis {
  success: boolean;
  quick_report: string;
  quiz_score: number;
  risk_level: string;
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

export const generateQuickAnalysis = async (
  jobDescription: string,
  quizScore: number,
  riskLevel: string
): Promise<QuickAnalysis> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/quick-analyze/`, {
      job_description: jobDescription,
      quiz_score: quizScore,
      risk_level: riskLevel,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating quick analysis:", error);
    return {
      success: false,
      quick_report: `Based on your score of ${quizScore}/100, you're in the ${riskLevel} risk category. A detailed analysis is being generated...`,
      quiz_score: quizScore,
      risk_level: riskLevel,
    };
  }
};

// Modular AI Analysis Functions
export const generateSearchQueries = async (
  jobDescription: string
): Promise<{
  success: boolean;
  queries?: { trends: string; tools: string; benchmarks: string };
  error?: string;
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/search-queries/`, {
      job_description: jobDescription,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating search queries:", error);
    return { success: false, error: "Failed to generate search queries" };
  }
};

export const executeWebSearch = async (
  query: string,
  searchType: string
): Promise<{
  success: boolean;
  search_type: string;
  query: string;
  result?: string;
  error?: string;
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/web-search/`, {
      query,
      search_type: searchType,
    });
    return response.data;
  } catch (error) {
    console.error("Error executing web search:", error);
    return {
      success: false,
      search_type: searchType,
      query,
      error: "Search failed",
    };
  }
};

export const synthesizeAnalysis = async (
  jobDescription: string,
  quizScore: number,
  riskLevel: string,
  searchResults: { trends?: string; tools?: string; benchmarks?: string }
): Promise<AIAnalysis> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/synthesize/`, {
      job_description: jobDescription,
      quiz_score: quizScore,
      risk_level: riskLevel,
      search_results: searchResults,
    });
    return response.data;
  } catch (error) {
    console.error("Error synthesizing analysis:", error);
    // Return fallback
    return {
      success: false,
      report: `Based on your assessment, you scored ${quizScore}/100, placing you in the ${riskLevel} risk category.`,
      actionable_steps: [],
      quiz_score: quizScore,
      risk_level: riskLevel,
    };
  }
};

export const generateAIAnalysis = async (
  jobDescription: string,
  quizScore: number,
  riskLevel: string,
  userId?: string
): Promise<AIAnalysis> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/analyze/`, {
      job_description: jobDescription,
      quiz_score: quizScore,
      risk_level: riskLevel,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    // Return a fallback analysis
    return {
      success: false,
      report: `Based on your assessment, you scored ${quizScore}/100, placing you in the ${riskLevel} risk category. 
      
      While we couldn't generate a personalized analysis at this time, your role requires careful attention to emerging AI capabilities. Focus on developing skills that complement rather than compete with AI systems.`,
      actionable_steps: [
        {
          icon: "brain",
          title: "Enhance AI Skills",
          description: "Master prompt engineering and AI tool integration.",
          link: "https://www.coursera.org/courses?query=ai",
        },
        {
          icon: "users",
          title: "Build Networks",
          description: "Strengthen relationships and collaborative skills.",
          link: "https://www.linkedin.com/learning/",
        },
        {
          icon: "school",
          title: "Stay Updated",
          description: "Follow AI trends in your industry continuously.",
          link: "https://www.udemy.com/topic/artificial-intelligence/",
        },
        {
          icon: "shield",
          title: "Document Value",
          description: "Track unique contributions that AI cannot replicate.",
          link: "https://www.indeed.com/career-advice",
        },
      ],
      quiz_score: quizScore,
      risk_level: riskLevel,
    };
  }
};
