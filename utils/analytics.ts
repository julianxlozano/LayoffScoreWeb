/**
 * Google Analytics 4 Event Tracking Utilities
 */

// Extend window type for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Quiz Events
export const trackQuizStarted = () => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "quiz_started", {
      event_category: "Quiz",
    });
  }
};

export const trackQuizQuestionAnswered = (questionNumber: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "quiz_question_answered", {
      event_category: "Quiz",
      question_number: questionNumber,
    });
  }
};

export const trackQuizCompleted = (score: number, riskLevel: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "quiz_completed", {
      event_category: "Quiz",
      quiz_score: score,
      risk_level: riskLevel,
    });
  }
};

export const trackJobDescriptionEntered = () => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "job_description_entered", {
      event_category: "Quiz",
    });
  }
};

// Payment Events
export const trackPaymentInitiated = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      event_category: "Payment",
      payment_method: method,
    });
  }
};

export const trackPaymentSuccessful = (amount: number, method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      event_category: "Payment",
      transaction_id: `txn_${Date.now()}`,
      value: amount / 100, // Convert cents to dollars
      currency: "USD",
      payment_method: method,
    });
  }
};

export const trackPaymentFailed = (error: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "payment_failed", {
      event_category: "Payment",
      error_message: error,
    });
  }
};

// AI Analysis Events
export const trackAnalysisViewed = (type: "quick" | "comprehensive") => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "analysis_viewed", {
      event_category: "AI Analysis",
      analysis_type: type,
    });
  }
};

export const trackAnalysisRegenerated = (type: "quick" | "comprehensive") => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "analysis_regenerated", {
      event_category: "AI Analysis",
      analysis_type: type,
    });
  }
};

export const trackPDFDownloaded = () => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "pdf_downloaded", {
      event_category: "Engagement",
    });
  }
};

// Navigation Events
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-NH7YX4KQN6", {
      page_path: url,
    });
  }
};
