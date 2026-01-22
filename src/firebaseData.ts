import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import type { DocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import type {
  Course,
  Lesson,
  UserProfile,
  UserProgress,
} from './types';
import { MOCK_COURSES, MOCK_LESSONS } from './mockData';

const mockLessonsByCourse = MOCK_LESSONS as Record<string, any[]>;

const mapMockLesson = (lesson: any): Lesson => ({
  id: lesson.id,
  courseId: lesson.course_id,
  title: lesson.title,
  content: lesson.content,
  duration: lesson.duration,
  level: lesson.level,
  order_index: lesson.order_index,
});

const courseFromDoc = (snapshot: DocumentSnapshot<DocumentData>): Course => ({
  id: snapshot.id,
  ...(snapshot.data() as Omit<Course, 'id'>),
});

const lessonFromDoc = (snapshot: DocumentSnapshot<DocumentData>): Lesson => ({
  id: snapshot.id,
  ...(snapshot.data() as Omit<Lesson, 'id'>),
});

export const ensureUserProfile = async (user: User): Promise<UserProfile> => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Oquvchi',
    photoURL: user.photoURL || '',
    role: 'student',
    enrolledCourseIds: [],
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const getCourses = async (): Promise<Course[]> => {
  const snap = await getDocs(collection(db, 'courses'));
  const courses = snap.docs.map(courseFromDoc);
  return courses.length ? courses : MOCK_COURSES;
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const snap = await getDoc(doc(db, 'courses', courseId));
  if (snap.exists()) return courseFromDoc(snap);
  return MOCK_COURSES.find((course) => course.id === courseId) ?? null;
};

export const getLessonsByCourseId = async (courseId: string): Promise<Lesson[]> => {
  const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', courseId));
  const snap = await getDocs(lessonsQuery);
  let lessons = snap.docs.map(lessonFromDoc);
  if (!lessons.length && mockLessonsByCourse[courseId]) {
    lessons = mockLessonsByCourse[courseId].map(mapMockLesson);
  }
  return lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  const snap = await getDoc(doc(db, 'lessons', lessonId));
  if (snap.exists()) return lessonFromDoc(snap);
  const mockLesson = Object.values(mockLessonsByCourse)
    .flat()
    .find((lesson) => lesson.id === lessonId);
  return mockLesson ? mapMockLesson(mockLesson) : null;
};

export const enrollInCourse = async (uid: string, courseId: string): Promise<void> => {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    enrolledCourseIds: arrayUnion(courseId),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProgress = async (uid: string): Promise<UserProgress[]> => {
  const snap = await getDocs(collection(db, 'users', uid, 'progress'));
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<UserProgress, 'id'>),
  }));
};

export const getUserProgressByCourseId = async (
  uid: string,
  courseId: string,
): Promise<UserProgress | null> => {
  const snap = await getDoc(doc(db, 'users', uid, 'progress', courseId));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...(snap.data() as Omit<UserProgress, 'id'>),
  };
};

export const updateUserProgress = async (
  uid: string,
  courseId: string,
  lessonId: string,
): Promise<void> => {
  const ref = doc(db, 'users', uid, 'progress', courseId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      lastLessonId: lessonId,
      completedLessonIds: arrayUnion(lessonId),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const progress: UserProgress = {
    id: courseId,
    courseId,
    lastLessonId: lessonId,
    completedLessonIds: [lessonId],
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, { ...progress, updatedAt: serverTimestamp() });
};

export const createOrUpdateCourse = async (course: Course): Promise<void> => {
  await setDoc(doc(db, 'courses', course.id), {
    ...course,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  await deleteDoc(doc(db, 'courses', courseId));
};

export const createOrUpdateLesson = async (lesson: Lesson): Promise<void> => {
  await setDoc(doc(db, 'lessons', lesson.id), {
    ...lesson,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  await deleteDoc(doc(db, 'lessons', lessonId));
};
