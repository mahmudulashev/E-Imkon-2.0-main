import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserPreferences } from '../types';
import { MOCK_COURSES } from '../mockData';

interface Props {
  prefs: UserPreferences;
}

const Home: React.FC<Props> = ({ prefs }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const baseStyle = { fontSize: `${prefs.fontSize}px` };

  useEffect(() => {
    async function fetchCourses() {
      setCourses(MOCK_COURSES);
      setTimeout(() => setLoading(false), 800); // Silliq o'tish uchun biroz kechikish
    }
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
      <div className="text-8xl animate-bounce">🎓</div>
      <div className="text-center">
        <p className="font-black text-3xl uppercase tracking-tighter text-slate-900">Tayyorlanmoqda...</p>
        <p className="font-bold text-slate-400 handwritten text-xl">Bilimlar dunyosiga yo'l ochilyapti</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-24 py-10 animate-in fade-in duration-700" style={baseStyle}>
      <section className="max-w-4xl">
        <div className="inline-block bg-indigo-600 text-white font-black px-4 py-1 mb-6 -rotate-1 text-sm uppercase tracking-widest">
          E‑Imkon
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter text-slate-900">
          Bilim <span className="marker-yellow">hamma uchun</span> ochiq.
        </h1>
        <p className="text-2xl md:text-3xl text-slate-700 font-main font-bold max-w-2xl leading-tight">
          Bu oddiy va tushunarli o'quv platforma. <span className="handwritten text-indigo-600">AI Tutor</span> kerak bo'lsa yo'l ko'rsatadi.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {courses.map((sub) => (
          <Link key={sub.id} to={`/courses/${sub.id}`} className="group">
            <div className="brutal-card h-full p-8 flex flex-col items-start relative overflow-hidden" style={{ backgroundColor: sub.color_hex || '#fff' }}>
              <div className="w-20 h-20 bg-white border-4 border-slate-900 flex items-center justify-center text-5xl mb-8 -rotate-6 group-hover:rotate-0 transition-all duration-300 shadow-[4px_4px_0px_0px_#1a1a1a]">
                {sub.icon}
              </div>
              <span className="bg-slate-900 text-white px-3 py-0.5 text-[10px] font-black uppercase mb-4 shadow-[3px_3px_0px_0px_#fbbf24]">
                {sub.level_tag}
              </span>
              <h3 className="text-4xl font-black mb-4 leading-none tracking-tighter text-slate-900">{sub.name}</h3>
              <p className="text-slate-900/70 font-bold mb-10 text-lg leading-snug font-main">
                {sub.description}
              </p>
              <div className="mt-auto w-full flex justify-between items-center pt-6 border-t-4 border-slate-900">
                <span className="font-black text-sm uppercase tracking-widest">Darsga kirish</span>
                <span className="text-3xl group-hover:translate-x-3 transition-transform duration-300">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className="relative overflow-hidden border-4 border-slate-900 bg-gradient-to-br from-[#fff1cc] via-white to-[#d9f1ff] p-12 md:p-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 left-8 h-32 w-32 rounded-full border-4 border-slate-900 bg-white/70"></div>
          <div className="absolute top-1/2 -right-16 h-56 w-56 rounded-full border-4 border-slate-900 bg-yellow-300/70"></div>
          <div className="absolute -bottom-12 left-1/3 h-40 w-40 rotate-12 border-4 border-slate-900 bg-indigo-200/70"></div>
        </div>
        <div className="relative z-10 grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-4 py-2 text-xs font-black uppercase tracking-widest">
              <span className="text-lg">✦</span> Qisqa va aniq
            </div>
            <h2 className="text-5xl md:text-7xl font-black mt-6 mb-6 leading-[0.9] tracking-tight">
              O'qish oson bo'lsin, natija tez kelsin.
            </h2>
            <p className="text-xl md:text-2xl font-bold text-slate-700 font-main leading-snug max-w-2xl">
              Har bir dars qisqa va tushunarli. AI yordamchi esa savollaringizga javob beradi.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="brutal-btn bg-slate-900 text-white border-4 rotate-1 font-black">🏁 BOSHLASH</div>
              <div className="brutal-btn bg-white text-black border-4 -rotate-1 font-black">📚 KURSLAR</div>
            </div>
          </div>
          <div className="md:col-span-5 grid gap-4">
            <div className="brutal-card bg-white p-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moslashuv</div>
              <div className="text-3xl font-black mt-2">Katta shrift</div>
              <p className="text-sm font-bold text-slate-600 mt-2">O'qish yengil bo'ladi.</p>
            </div>
            <div className="brutal-card bg-slate-900 text-white p-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Tinglash</div>
              <div className="text-3xl font-black mt-2 text-white">Ovozli dars</div>
              <p className="text-sm font-bold mt-2 text-white/80">Matnlarni o'zbekcha eshiting.</p>
            </div>
            <div className="brutal-card bg-yellow-300 text-slate-900 p-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Yo'lboshchi</div>
              <div className="text-3xl font-black mt-2">AI Tutor</div>
              <p className="text-sm font-bold text-slate-700 mt-2">Yo'l ko'rsatadi va javob beradi.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="brutal-card p-10 md:p-12 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Biznes model</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">To'lovlar va hamkorlik</h2>
          <p className="text-lg md:text-xl font-bold text-slate-700 max-w-2xl">
            Paketlar, to'lov usullari va hamkorlik shartlari haqida batafsil.
          </p>
        </div>
        <Link to="/business-model" className="brutal-btn bg-yellow-400 text-black uppercase font-black">
          Ko'rish →
        </Link>
      </section>

      <footer className="text-center py-10 opacity-30 font-black uppercase text-xs tracking-[0.3em]">
        E-Imkon &copy; 2025 • Inklyuziv Ta'lim Kelajagi
      </footer>
    </div>
  );
};

export default Home;
