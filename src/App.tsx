
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import type { UserPreferences, UserProfile } from './types';
import { getOrCreateLocalUid, loadLocalProfile, saveLocalProfile } from './localUserData';

const Home = React.lazy(() => import('./pages/Home'));
const CourseView = React.lazy(() => import('./pages/CourseView'));
const LessonView = React.lazy(() => import('./pages/LessonView'));
const Documentation = React.lazy(() => import('./pages/Documentation'));
const Profile = React.lazy(() => import('./pages/Profile'));
const BusinessModel = React.lazy(() => import('./pages/BusinessModel'));
const AccessibilityPanel = React.lazy(() => import('./components/AccessibilityPanel'));
const AITutor = React.lazy(() => import('./components/AITutor'));

const PageFallback: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="font-black text-2xl uppercase">Yuklanmoqda...</div>
  </div>
);

const AppContent: React.FC<{ 
  prefs: UserPreferences; 
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>; 
  uid: string;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}> = ({ prefs, setPrefs, uid, profile, setProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const lastSpokenText = useRef<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const geminiModuleRef = useRef<Promise<typeof import('./geminiService')> | null>(null);

  const loadGemini = () => {
    if (!geminiModuleRef.current) geminiModuleRef.current = import('./geminiService');
    return geminiModuleRef.current;
  };

  const getCtx = async () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) throw new Error('AudioContext not supported');
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const stopGlobalAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
  };

  const speakGlobal = async (text: string) => {
    if (!prefs.voiceSupport) return;
    stopGlobalAudio();
    try {
      const [gemini, ctx] = await Promise.all([loadGemini(), getCtx()]);
      const base64 = await gemini.generateSpeech(text);
      if (base64) {
        const buf = await gemini.decodeAudioData(gemini.decode(base64), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.connect(ctx.destination);
        source.start(0);
        sourceNodeRef.current = source;
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadGemini()
      .then((gemini) => getCtx().then((ctx) => gemini.playSoundCue('nav', ctx)))
      .catch(() => {});
    const pageName = location.pathname === '/' ? 'Bosh sahifa' :
                     location.pathname.includes('lesson') ? 'Dars sahifasi' :
                     location.pathname.includes('course') ? 'Kurs sahifasi' : 'Sahifa';
    speakGlobal(pageName + " yuklandi.");
  }, [location.pathname]);

  useEffect(() => {
    const loadIdle = () => {
      setShowAccessibility(true);
      setShowAITutor(true);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(loadIdle, { timeout: 1500 });
      return () => {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
      };
    }

    const t = setTimeout(loadIdle, 900);
    return () => clearTimeout(t);
  }, []);

  const routeElements = useMemo(() => {
    return {
      home: <Home prefs={prefs} />,
      docs: <Documentation prefs={prefs} />,
      business: <BusinessModel prefs={prefs} />,
      profile: <Profile prefs={prefs} uid={uid} profile={profile} />,
      course: <CourseView prefs={prefs} uid={uid} profile={profile} setProfile={setProfile} />,
      lesson: <LessonView prefs={prefs} uid={uid} />,
    };
  }, [prefs, uid, profile, setProfile]);

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      const modifier = (e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey);
      if (modifier && e.key.toLowerCase() === 'h') { e.preventDefault(); navigate('/'); }
      if (modifier && e.key.toLowerCase() === 'd') { e.preventDefault(); navigate('/docs'); }
      if (modifier && e.key.toLowerCase() === 'c') { 
        e.preventDefault(); 
        setPrefs(p => ({ ...p, contrast: p.contrast === 'high' ? 'normal' : 'high' })); 
      }
      if (modifier && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setPrefs(p => ({ ...p, readerMode: !p.readerMode }));
      }
      if (modifier && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        stopGlobalAudio();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate, setPrefs]);

  useEffect(() => {
    if (!prefs.voiceSupport) return;

    const speakFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.tagName === 'BODY' || target.tagName === 'HTML' || ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      
      const label = target.ariaLabel || target.innerText || target.getAttribute('placeholder') || '';
      if (!label || label.length > 150 || label === lastSpokenText.current) return;
      
      lastSpokenText.current = label;
      const role = target.tagName === 'A' ? 'havola' : target.tagName === 'BUTTON' ? 'tugma' : '';
      speakGlobal(`${label}. ${role}`);
    };

    document.addEventListener('focus', speakFocus, true);
    return () => document.removeEventListener('focus', speakFocus, true);
  }, [prefs.voiceSupport]);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 font-main ${prefs.contrast === 'high' ? 'contrast-high' : 'contrast-normal'}`}>
      <nav role="navigation" className={`p-6 border-b-8 border-slate-900 sticky top-0 z-40 ${prefs.contrast === 'high' ? 'bg-black border-yellow-400' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-1 group" aria-label="E-Imkon Bosh sahifasiga o'tish">
            <span className={`text-4xl font-black px-4 py-1 -rotate-2 transition-transform group-hover:rotate-0 ${prefs.contrast === 'high' ? 'bg-yellow-400 text-black' : 'bg-slate-900 text-white'}`}>E</span>
            <span className="text-4xl font-black tracking-tighter uppercase">IMKON</span>
          </Link>
          <div className="flex items-center space-x-8">
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Bosh sahifa</Link>
                <Link to="/docs" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Yo'riqnoma</Link>
                <Link to="/business" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Biznes model</Link>
                <Link to="/profile" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Profil</Link>
              </div>
              <button
                type="button"
                aria-label="Menyu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="md:hidden brutal-btn bg-yellow-400 px-4 py-2 font-black uppercase text-black"
              >
                ☰
              </button>
            </>
          </div>
        </div>
        <div className={`md:hidden px-6 pb-6 ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="brutal-card bg-white border-4 border-slate-900 p-4 space-y-4">
            <Link to="/" className="block font-black uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
              Bosh sahifa
            </Link>
            <Link to="/docs" className="block font-black uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
              Yo'riqnoma
            </Link>
            <Link to="/business" className="block font-black uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
              Biznes model
            </Link>
            <Link to="/profile" className="block font-black uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
              Profil
            </Link>
          </div>
        </div>
      </nav>
      <main id="main-content" className="flex-grow max-w-7xl mx-auto w-full p-6 outline-none" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={routeElements.home} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/docs" element={routeElements.docs} />
            <Route path="/business" element={routeElements.business} />
            <Route path="/profile" element={routeElements.profile} />
            <Route path="/courses/:subjectId" element={routeElements.course} />
            <Route path="/lesson/:lessonId" element={routeElements.lesson} />
          </Routes>
        </Suspense>
      </main>
      {showAccessibility ? (
        <Suspense fallback={null}>
          <AccessibilityPanel prefs={prefs} setPrefs={setPrefs} />
        </Suspense>
      ) : null}
      {showAITutor ? (
        <Suspense fallback={null}>
          <AITutor />
        </Suspense>
      ) : null}
    </div>
  );
};

const App: React.FC = () => {
  const [uid] = useState<string>(() => getOrCreateLocalUid());
  const [profile, setProfile] = useState<UserProfile>(() => loadLocalProfile());
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('e_imkon_prefs');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        fontSize: parsed.fontSize ?? 15,
        contrast: parsed.contrast ?? 'normal',
        voiceSupport: parsed.voiceSupport ?? true,
        readerMode: parsed.readerMode ?? false,
      };
    }
    return { fontSize: 15, contrast: 'normal', voiceSupport: true, readerMode: false };
  });

  useEffect(() => {
    localStorage.setItem('e_imkon_prefs', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${prefs.fontSize}px`);
  }, [prefs.fontSize]);

  useEffect(() => {
    saveLocalProfile(profile);
  }, [profile]);

  return (
    <HashRouter>
      <AppContent 
        prefs={prefs} setPrefs={setPrefs} 
        uid={uid}
        profile={profile}
        setProfile={setProfile}
      />
    </HashRouter>
  );
};

export default App;
