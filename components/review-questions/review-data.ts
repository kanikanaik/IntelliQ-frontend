export type AnswerOption = {
  letter: string;
  text: string;
  isCorrect: boolean;
};

export type CardState = "normal" | "selected" | "regenerating";

export type ReviewQuestion = {
  id: string;
  number: number;
  question: string;
  options: AnswerOption[];
  state: CardState;
};

export const SAMPLE_QUESTIONS: ReviewQuestion[] = [
  {
    id: "q1",
    number: 1,
    state: "selected",
    question: "What is the primary function of a mitochondria in a cell?",
    options: [
      { letter: "A", text: "Energy Production (ATP)", isCorrect: true },
      { letter: "B", text: "Protein Synthesis", isCorrect: false },
      { letter: "C", text: "Waste Elimination", isCorrect: false },
    ],
  },
  {
    id: "q2",
    number: 2,
    state: "normal",
    question: "Which element has the chemical symbol 'Au'?",
    options: [
      { letter: "A", text: "Silver", isCorrect: false },
      { letter: "B", text: "Gold", isCorrect: true },
      { letter: "C", text: "Aluminum", isCorrect: false },
    ],
  },
  {
    id: "q3",
    number: 3,
    state: "normal",
    question: "What is the speed of light in a vacuum?",
    options: [
      { letter: "A", text: "300,000 km/s", isCorrect: false },
      { letter: "B", text: "299,792 km/s", isCorrect: true },
      { letter: "C", text: "150,000 km/s", isCorrect: false },
    ],
  },
  {
    id: "q4",
    number: 4,
    state: "regenerating",
    question: "",
    options: [],
  },
  {
    id: "q5",
    number: 5,
    state: "normal",
    question: "Who is considered the father of computer science?",
    options: [
      { letter: "A", text: "Charles Babbage", isCorrect: false },
      { letter: "B", text: "Alan Turing", isCorrect: true },
      { letter: "C", text: "John von Neumann", isCorrect: false },
      { letter: "D", text: "Ada Lovelace", isCorrect: false },
    ],
  },
];

export const TOTAL_QUESTIONS = 10;
export const QUALITY_SCORE = 94;
