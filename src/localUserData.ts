import type { UserProfile, UserProgress } from './types';

const UID_KEY = 'e_imkon_uid';
const PROFILE_KEY = 'e_imkon_profile';

const progressKey = (uid: string) => `e_imkon_progress_${uid}`;

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const createUid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

export const getOrCreateLocalUid = (): string => {
  const existing = localStorage.getItem(UID_KEY);
  if (existing) return existing;
  const uid = createUid();
  localStorage.setItem(UID_KEY, uid);
  return uid;
};

export const loadLocalProfile = (): UserProfile => {
  const uid = getOrCreateLocalUid();
  const saved = safeParse<UserProfile>(localStorage.getItem(PROFILE_KEY));
  if (saved && saved.uid) {
    return {
      ...saved,
      uid,
      enrolledCourseIds: Array.isArray(saved.enrolledCourseIds) ? saved.enrolledCourseIds : [],
      role: saved.role === 'admin' ? 'admin' : 'student',
      email: saved.email ?? '',
      displayName: saved.displayName ?? 'Mehmon',
      photoURL: saved.photoURL ?? '',
    };
  }
  const profile: UserProfile = {
    uid,
    email: '',
    displayName: 'Mehmon',
    photoURL: '',
    role: 'student',
    enrolledCourseIds: [],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
};

export const saveLocalProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const enrollLocalCourse = (courseId: string): UserProfile => {
  const profile = loadLocalProfile();
  if (!profile.enrolledCourseIds.includes(courseId)) {
    const next: UserProfile = {
      ...profile,
      enrolledCourseIds: [...profile.enrolledCourseIds, courseId],
      updatedAt: new Date().toISOString(),
    };
    saveLocalProfile(next);
    return next;
  }
  return profile;
};

type StoredProgress = Record<
  string,
  Omit<UserProgress, 'id'> & { id?: string }
>;

export const getLocalUserProgress = (uid: string): UserProgress[] => {
  const stored = safeParse<StoredProgress>(localStorage.getItem(progressKey(uid))) || {};
  return Object.entries(stored).map(([courseId, data]) => ({
    id: courseId,
    courseId,
    lastLessonId: data.lastLessonId || '',
    completedLessonIds: Array.isArray(data.completedLessonIds) ? data.completedLessonIds : [],
    updatedAt: data.updatedAt,
  }));
};

export const getLocalUserProgressByCourseId = (
  uid: string,
  courseId: string,
): UserProgress | null => {
  const stored = safeParse<StoredProgress>(localStorage.getItem(progressKey(uid))) || {};
  const data = stored[courseId];
  if (!data) return null;
  return {
    id: courseId,
    courseId,
    lastLessonId: data.lastLessonId || '',
    completedLessonIds: Array.isArray(data.completedLessonIds) ? data.completedLessonIds : [],
    updatedAt: data.updatedAt,
  };
};

export const updateLocalUserProgress = (
  uid: string,
  courseId: string,
  lessonId: string,
): void => {
  const key = progressKey(uid);
  const stored = safeParse<StoredProgress>(localStorage.getItem(key)) || {};
  const existing = stored[courseId];
  const completed = new Set<string>(existing?.completedLessonIds || []);
  completed.add(lessonId);
  stored[courseId] = {
    courseId,
    lastLessonId: lessonId,
    completedLessonIds: Array.from(completed),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(stored));
};

