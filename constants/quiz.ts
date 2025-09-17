export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "How much of your work involves repetitive tasks that could be automated?",
    options: ["Almost none", "Some", "A lot", "Most"],
  },
  {
    id: 2,
    question: "Do you write text most days (emails, reports, descriptions)?",
    options: ["Yes", "No"],
  },
  {
    id: 3,
    question:
      "Do you create reports or summarize information for others regularly?",
    options: ["Yes", "No"],
  },
  {
    id: 4,
    question: "Do you follow step-by-step instructions for much of your work?",
    options: ["Yes", "No"],
  },
  {
    id: 5,
    question:
      "Is a lot of your work checked by a manager after you complete it?",
    options: ["Yes", "No"],
  },
  {
    id: 6,
    question:
      "Are most decisions you make low-risk and easy for someone to correct?",
    options: ["Yes", "No"],
  },
  {
    id: 7,
    question:
      "Do you work mostly on your own (few live meetings with teammates/clients)?",
    options: ["Yes", "No"],
  },
  {
    id: 8,
    question:
      "Is managing people, budgets, or client accounts a core part of your job?",
    options: ["Yes", "No"],
  },
  {
    id: 9,
    question: "Do you work with confidential information and customer data?",
    options: ["Yes", "No"],
  },
  {
    id: 10,
    question: "Do you need to be in person to do important parts of your work?",
    options: ["Yes", "No"],
  },
  {
    id: 11,
    question:
      "Is your work in a highly regulated area (legal, finance, medical, safety)?",
    options: ["Yes", "No"],
  },
  {
    id: 12,
    question:
      "Do you use specialized tools or software that requires special training?",
    options: ["Yes", "No"],
  },
];

// Map the first question's multiple choice to boolean
export const mapFirstQuestionToBoolean = (answer: string): boolean => {
  return answer === "A lot" || answer === "Most";
};
