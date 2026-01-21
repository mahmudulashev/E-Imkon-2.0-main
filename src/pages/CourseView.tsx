import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { UserPreferences } from '../types';
import { MOCK_COURSES, MOCK_LESSONS } from '../mockData';

interface Props {
  prefs: UserPreferences;
}

const CourseView: React.FC<Props> = ({ prefs }) => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setCourse(MOCK_COURSES.find(c => c.id === subjectId));
      setLessons(MOCK_LESSONS[subjectId as keyof typeof MOCK_LESSONS] || []);
      setLoading(false);
    }
    fetchData();
  }, [subjectId]);

  if (loading) return <div role="alert" className="p-20 text-center font-black text-3xl">Yuklanmoqda...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in duration-500">
      <Link to="/" aria-label="Asosiy sahifaga qaytish" className="brutal-btn inline-block bg-white mb-6">← ORQAGA QAYTISH</Link>
      
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-12 border-b-4 border-slate-900">
        <div>
          <h1 className="text-7xl font-black mb-4 tracking-tighter uppercase leading-none">{course?.name}</h1>
          <p className="text-2xl text-slate-600 font-bold handwritten italic">{course?.description}</p>
        </div>
        <div className="brutal-card bg-yellow-300 p-6 -rotate-2" aria-label={`${lessons.length} ta dars mavjud`}>
           <span className="text-3xl font-black">{lessons.length} TA DARS</span>
        </div>
      </header>

      <nav aria-label="Darslar ro'yxati" className="grid gap-8">
        {lessons.length > 0 ? lessons.map((lesson, idx) => (
          <Link 
            key={lesson.id} 
            to={`/lesson/${lesson.id}`} 
            className="group"
            aria-label={`${idx + 1}-dars: ${lesson.title}. Davomiyligi ${lesson.duration}`}
          >
            <div className={`brutal-card p-8 flex items-center gap-8 ${prefs.contrast === 'high' ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white'}`}>
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
                <span className="brutal-btn bg-slate-100 group-hover:bg-yellow-400 transition-colors" aria-hidden="true">BOSHLASH →</span>
              </div>
            </div>
          </Link>
        )) : (
          <div role="status" className="text-center py-20 brutal-card bg-slate-50 opacity-50 font-bold text-xl uppercase italic">
            Darslar mavjud emas.
          </div>
        )}
      </nav>
    </div>
  );
};

export default CourseView;
