
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import type { UserPreferences, UserProfile } from './types';
import Home from './pages/Home';
import CourseView from './pages/CourseView';
import LessonView from './pages/LessonView';
import Login from './pages/Login';
import Documentation from './pages/Documentation';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import BusinessModel from './pages/BusinessModel';
import AccessibilityPanel from './components/AccessibilityPanel';
import AITutor from './components/AITutor';
import { generateSpeech, decode, decodeAudioData, playSoundCue } from './geminiService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { ensureUserProfile, getUserProfile } from './firebaseData';

const AppContent: React.FC<{ 
  prefs: UserPreferences; 
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>; 
  currentUser: User | null; 
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  handleLogout: () => void;
}> = ({ prefs, setPrefs, currentUser, profile, setProfile, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const lastSpokenText = useRef<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      const ctx = await getCtx();
      const base64 = await generateSpeech(text);
      if (base64) {
        const buf = await decodeAudioData(decode(base64), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.connect(ctx.destination);
        source.start(0);
        sourceNodeRef.current = source;
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (currentUser) {
      getCtx().then(ctx => playSoundCue('nav', ctx));
      const pageName = location.pathname === '/' ? 'Bosh sahifa' :
                       location.pathname.includes('lesson') ? 'Dars sahifasi' :
                       location.pathname.includes('course') ? 'Kurs sahifasi' : 'Sahifa';
      speakGlobal(pageName + " yuklandi.");
    }
  }, [location.pathname, currentUser]);

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
    if (!prefs.voiceSupport || !currentUser) return;

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
  }, [prefs.voiceSupport, currentUser]);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 font-main ${prefs.contrast === 'high' ? 'contrast-high' : 'contrast-normal'}`}>
      <nav role="navigation" className={`p-6 border-b-8 border-slate-900 sticky top-0 z-40 ${prefs.contrast === 'high' ? 'bg-black border-yellow-400' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-1 group" aria-label="E-Imkon Bosh sahifasiga o'tish">
            <span className={`text-4xl font-black px-4 py-1 -rotate-2 transition-transform group-hover:rotate-0 ${prefs.contrast === 'high' ? 'bg-yellow-400 text-black' : 'bg-slate-900 text-white'}`}>E</span>
            <span className="text-4xl font-black tracking-tighter uppercase">IMKON</span>
          </Link>
          <div className="flex items-center space-x-8">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Bosh sahifa</Link>
                  <Link to="/docs" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Yo'riqnoma</Link>
                  <Link to="/business" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Biznes model</Link>
                  <Link to="/profile" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Profil</Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Admin</Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="font-black text-sm uppercase opacity-50 hover:opacity-100 transition-opacity"
                  >
                    Chiqish
                  </button>
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
            ) : null}
          </div>
        </div>
        {currentUser && (
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
              {profile?.role === 'admin' && (
                <Link to="/admin" className="block font-black uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full brutal-btn bg-slate-900 text-black font-black uppercase"
              >
                Chiqish
              </button>
            </div>
          </div>
        )}
      </nav>
      <main id="main-content" className="flex-grow max-w-7xl mx-auto w-full p-6 outline-none" tabIndex={-1}>
        <Routes>
          <Route path="/" element={currentUser ? <Home prefs={prefs} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/docs" element={currentUser ? <Documentation prefs={prefs} /> : <Navigate to="/login" replace />} />
          <Route path="/business" element={<BusinessModel prefs={prefs} />} />
          <Route path="/profile" element={currentUser ? <Profile prefs={prefs} currentUser={currentUser} profile={profile} /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={currentUser && profile?.role === 'admin' ? <AdminPanel prefs={prefs} /> : <Navigate to="/" replace />} />
          <Route path="/courses/:subjectId" element={currentUser ? <CourseView prefs={prefs} currentUser={currentUser} profile={profile} setProfile={setProfile} /> : <Navigate to="/login" replace />} />
          <Route path="/lesson/:lessonId" element={currentUser ? <LessonView prefs={prefs} currentUser={currentUser} /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      {currentUser && <AccessibilityPanel prefs={prefs} setPrefs={setPrefs} />}
      {currentUser && <AITutor />}
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const ensured = await ensureUserProfile(user);
        const fresh = await getUserProfile(user.uid);
        setProfile(fresh || ensured);
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-black text-2xl uppercase">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent 
        prefs={prefs} setPrefs={setPrefs} 
        currentUser={currentUser} 
        profile={profile}
        setProfile={setProfile}
        handleLogout={handleLogout}
      />
    </HashRouter>
  );
};

export default App;
