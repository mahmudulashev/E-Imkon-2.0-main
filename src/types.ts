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
  courseId: string;
  title: string;
  content: {
    sections: { title: string; content: string; image?: string; imageAlt?: string; caption?: string }[];
    quiz?: QuizQuestion[];
  };
  duration: string;
  level: string;
  order_index: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_hex: string;
  level_tag: string;
  published?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'admin';
  enrolledCourseIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProgress {
  id: string;
  courseId: string;
  lastLessonId: string;
  completedLessonIds: string[];
  updatedAt?: string;
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
