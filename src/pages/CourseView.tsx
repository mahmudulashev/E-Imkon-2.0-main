import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { UserPreferences, Course, Lesson, UserProfile } from '../types';
import type { User } from 'firebase/auth';
import { enrollInCourse, getCourseById, getLessonsByCourseId, getUserProgressByCourseId } from '../firebaseData';

interface Props {
  prefs: UserPreferences;
  currentUser: User | null;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

const CourseView: React.FC<Props> = ({ prefs, currentUser, profile, setProfile }) => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const lessonRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    async function fetchData() {
      if (!subjectId) return;
      setCompletedLessonIds(new Set());
      try {
        const [courseData, lessonData] = await Promise.all([
          getCourseById(subjectId),
          getLessonsByCourseId(subjectId),
        ]);
        setCourse(courseData);
        setLessons(lessonData);
        if (currentUser) {
          const progress = await getUserProgressByCourseId(currentUser.uid, subjectId);
          setCompletedLessonIds(new Set(progress?.completedLessonIds || []));
        } else {
          setCompletedLessonIds(new Set());
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Kursni yuklashda xatolik.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subjectId, currentUser]);

  useEffect(() => {
    setActiveLessonIndex(0);
  }, [subjectId, lessons.length]);

  useEffect(() => {
    const handleKeyNav = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      if (!lessons.length) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName || '')) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.min(activeLessonIndex + 1, lessons.length - 1);
        setActiveLessonIndex(next);
        lessonRefs.current[next]?.focus();
        lessonRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = Math.max(activeLessonIndex - 1, 0);
        setActiveLessonIndex(prev);
        lessonRefs.current[prev]?.focus();
        lessonRefs.current[prev]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [lessons, activeLessonIndex]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-12 animate-pulse">
        <div className="h-12 w-40 bg-slate-200 border-4 border-slate-900"></div>
        <div className="space-y-4">
          <div className="h-16 w-3/4 bg-slate-200 border-4 border-slate-900"></div>
          <div className="h-8 w-2/3 bg-slate-100 border-4 border-slate-900"></div>
        </div>
        <div className="brutal-card bg-slate-100 p-6">
          <div className="h-8 w-32 bg-slate-200 border-4 border-slate-900"></div>
        </div>
        <div className="grid gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="brutal-card p-8 bg-white">
              <div className="h-10 w-24 bg-slate-200 border-4 border-slate-900 mb-6"></div>
              <div className="h-8 w-1/2 bg-slate-200 border-4 border-slate-900 mb-3"></div>
              <div className="h-6 w-1/3 bg-slate-100 border-4 border-slate-900"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error || !course) {
    return (
      <div role="alert" className="p-20 text-center font-black text-3xl">
        {error || 'Kurs topilmadi.'}
      </div>
    );
  }

  const isEnrolled = !!profile?.enrolledCourseIds?.includes(course.id);
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const progressLabel = `${completedCount}/${totalLessons}`;

  const handleEnroll = async () => {
    if (!currentUser || !course) return;
    setEnrolling(true);
    try {
      await enrollInCourse(currentUser.uid, course.id);
      if (profile) {
        setProfile({
          ...profile,
          enrolledCourseIds: Array.from(new Set([...profile.enrolledCourseIds, course.id])),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kursga yozilishda xatolik.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in duration-500">
      <Link to="/" aria-label="Asosiy sahifaga qaytish" className="brutal-btn inline-block bg-white mb-6">← ORQAGA QAYTISH</Link>
      
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-12 border-b-4 border-slate-900">
        <div>
          <h1 className="text-7xl font-black mb-4 tracking-tighter uppercase leading-none">{course?.name}</h1>
          <p className="text-2xl text-slate-600 font-bold handwritten italic">{course?.description}</p>
          <div className="mt-6 flex flex-wrap gap-4 items-center text-xs font-black uppercase tracking-widest">
            <span className="bg-slate-900 text-white px-3 py-1">Progress: {progressLabel}</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1">Alt + ↑/↓ bilan darslar orasida</span>
          </div>
          <div className="mt-4 h-3 w-full max-w-md bg-slate-200 border-2 border-slate-900">
            <div
              className="h-full bg-green-500"
              style={{ width: `${progressPercent}%` }}
              aria-label={`Progress ${progressPercent}%`}
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="brutal-card bg-yellow-300 p-6 -rotate-2" aria-label={`${lessons.length} ta dars mavjud`}>
             <span className="text-3xl font-black">{lessons.length} TA DARS</span>
          </div>
          <button
            onClick={handleEnroll}
            disabled={isEnrolled || enrolling}
            className={`brutal-btn ${isEnrolled ? 'bg-green-500 text-black' : 'bg-white text-black'} font-black`}
          >
            {isEnrolled ? 'YOZILGANSIZ ✅' : enrolling ? 'YOZILMOQDA...' : 'KURSGA YOZILISH'}
          </button>
        </div>
      </header>

      <nav aria-label="Darslar ro'yxati" className="grid gap-8">
        {lessons.length > 0 ? lessons.map((lesson, idx) => {
          const isCompleted = completedLessonIds.has(lesson.id);
          const baseCardClass = prefs.contrast === 'high'
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-white';
          const completedClass = prefs.contrast === 'high'
            ? 'bg-green-400 text-black border-slate-900'
            : 'bg-green-100 border-green-500';
          return (
          <Link 
            key={lesson.id} 
            to={`/lesson/${lesson.id}`} 
            className="group"
            aria-label={`${idx + 1}-dars: ${lesson.title}. Davomiyligi ${lesson.duration}`}
            ref={(el) => {
              lessonRefs.current[idx] = el;
            }}
          >
            <div className={`brutal-card p-8 flex items-center gap-8 ${isCompleted ? completedClass : baseCardClass}`}>
              <div className="w-16 h-16 brutal-card bg-slate-900 text-black flex items-center justify-center text-3xl font-black group-hover:bg-indigo-600 transition-colors" aria-hidden="true">
                {idx + 1}
              </div>
              <div className="flex-grow">
                <h3 className="text-3xl font-black mb-2 tracking-tight group-hover:underline">{lesson.title}</h3>
                <div className="flex gap-6 text-sm font-bold uppercase opacity-60">
                  <span aria-label={`Vaqti: ${lesson.duration}`}>⏱ {lesson.duration}</span>
                  <span aria-hidden="true">|</span>
                  <span aria-label={`Darajasi: ${lesson.level}`}>📊 {lesson.level}</span>
                </div>
              </div>
              <div className="hidden md:block">
                <span className={`brutal-btn ${isCompleted ? 'bg-green-500 text-black' : 'bg-slate-100 group-hover:bg-yellow-400 text-black'} transition-colors`} aria-hidden="true">
                  {isCompleted ? 'TUGATILGAN ✅' : 'BOSHLASH →'}
                </span>
              </div>
            </div>
          </Link>
        )}) : (
          <div role="status" className="text-center py-20 brutal-card bg-slate-50 opacity-50 font-bold text-xl uppercase italic">
            Darslar mavjud emas.
          </div>
        )}
      </nav>
    </div>
  );
};

export default CourseView;
