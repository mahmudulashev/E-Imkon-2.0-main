import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Course, UserPreferences, UserProfile, UserProgress } from '../types';
import type { User } from 'firebase/auth';
import { getCourses, getLessonsByCourseId, getUserProgress } from '../firebaseData';

interface Props {
  prefs: UserPreferences;
  currentUser: User | null;
  profile: UserProfile | null;
}

const Profile: React.FC<Props> = ({ prefs, currentUser, profile }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseStyle = { fontSize: `${prefs.fontSize}px` };

  useEffect(() => {
    async function loadProfileData() {
      if (!currentUser) return;
      try {
        const [courseData, progressData] = await Promise.all([
          getCourses(),
          getUserProgress(currentUser.uid),
        ]);
        setCourses(courseData);
        setProgress(progressData);
        const enrolledIds = new Set(profile?.enrolledCourseIds || []);
        const enrolledCourses = courseData.filter((course) => enrolledIds.has(course.id));
        const lessonTotals = await Promise.all(
          enrolledCourses.map(async (course) => {
            const lessons = await getLessonsByCourseId(course.id);
            return { courseId: course.id, total: lessons.length };
          }),
        );
        const countsMap: Record<string, number> = {};
        lessonTotals.forEach((item) => {
          countsMap[item.courseId] = item.total;
        });
        setLessonCounts(countsMap);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Profil maʼlumotlarini yuklashda xatolik.');
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [currentUser, profile]);

  const progressMap = useMemo(() => {
    return new Map(progress.map((p) => [p.courseId, p]));
  }, [progress]);

  const enrolledCourses = useMemo(() => {
    if (!profile?.enrolledCourseIds?.length) return [];
    return courses.filter((course) => profile.enrolledCourseIds.includes(course.id));
  }, [courses, profile]);

  const totalCompleted = progress.reduce((sum, item) => sum + (item.completedLessonIds?.length || 0), 0);

  if (loading) return <div className="p-20 text-center font-black text-3xl uppercase">Yuklanmoqda...</div>;
  if (error) return <div className="p-20 text-center font-black text-3xl uppercase">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12 animate-in fade-in duration-500" style={baseStyle}>
      <header className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-end border-b-4 border-slate-900 pb-8">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tight">Profil</h1>
          <p className="text-xl font-bold text-slate-600">
            {profile?.displayName || currentUser?.displayName || 'Oquvchi'}
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            {currentUser?.email}
          </p>
        </div>
        <div className="brutal-card bg-indigo-100 p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kurslar soni</div>
          <div className="text-4xl font-black mt-2">{enrolledCourses.length}</div>
        </div>
        <div className="brutal-card bg-green-100 p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tugatilgan darslar</div>
          <div className="text-4xl font-black mt-2">{totalCompleted}</div>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tight">Qatnashayotgan kurslar</h2>
        {enrolledCourses.length === 0 ? (
          <div className="brutal-card p-8 bg-slate-50 text-center font-black uppercase">
            Hali kurslarga yozilmagansiz.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {enrolledCourses.map((course) => {
              const courseProgress = progressMap.get(course.id);
              const totalLessons = lessonCounts[course.id] ?? 0;
              const completedCount = courseProgress?.completedLessonIds?.length || 0;
              const progressPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
              return (
                <div key={course.id} className="brutal-card p-8 bg-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-300 border-4 border-slate-900 flex items-center justify-center text-2xl font-black">
                      {course.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{course.name}</h3>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{course.level_tag}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-600 mb-6">{course.description}</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-black uppercase text-slate-500 mb-2">
                      <span>Progress</span>
                      <span>{completedCount}/{totalLessons}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 border-2 border-slate-900">
                      <div className="h-full bg-green-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black uppercase text-slate-400">
                      {courseProgress?.lastLessonId ? `Qayergacha: ${courseProgress.lastLessonId}` : 'Hali boshlanmagan'}
                    </div>
                    <Link to={`/courses/${course.id}`} className="brutal-btn bg-white">Davom ettirish</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
