export const SUBJECTS = {
  ENGLISH: 'Ingliz tili',
  MATH: 'Matematika',
  FRONTEND: 'Frontend Dasturlash'
} as const;

export type Subject = typeof SUBJECTS[keyof typeof SUBJECTS];

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: {
    sections: { title: string; content: string }[];
    quiz?: QuizQuestion[];
  };
  duration: string;
  level: string;
  order_index: number;
}

export interface UserPreferences {
  fontSize: number;
  contrast: 'normal' | 'high';
  voiceSupport: boolean;
}

export interface Message {
  role: 'user' | 'ai';
  text: string;
}
