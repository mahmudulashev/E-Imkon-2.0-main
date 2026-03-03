import type { Course, Lesson } from './types';
import { MOCK_COURSES, MOCK_LESSONS } from './mockData';

type MockLesson = {
  id: string;
  course_id: string;
  title: string;
  content: Lesson['content'];
  duration: string;
  level: string;
  order_index: number;
};

const mockLessonsByCourse = MOCK_LESSONS as Record<string, MockLesson[]>;

const mapMockLesson = (lesson: MockLesson): Lesson => ({
  id: lesson.id,
  courseId: lesson.course_id,
  title: lesson.title,
  content: lesson.content,
  duration: lesson.duration,
  level: lesson.level,
  order_index: lesson.order_index,
});

export const getCourses = async (): Promise<Course[]> => {
  return MOCK_COURSES;
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  return MOCK_COURSES.find((course) => course.id === courseId) ?? null;
};

export const getLessonsByCourseId = async (courseId: string): Promise<Lesson[]> => {
  let lessons: Lesson[] = [];
  if (!lessons.length && mockLessonsByCourse[courseId]) {
    lessons = mockLessonsByCourse[courseId].map(mapMockLesson);
  }
  return lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  const mockLesson = Object.values(mockLessonsByCourse)
    .flat()
    .find((lesson) => lesson.id === lessonId);
  return mockLesson ? mapMockLesson(mockLesson) : null;
};
