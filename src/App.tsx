
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import type { UserPreferences } from './types';
import Home from './pages/Home';
import CourseView from './pages/CourseView';
import LessonView from './pages/LessonView';
import Login from './pages/Login';
import Documentation from './pages/Documentation';
import BusinessModel from './pages/BusinessModel';
import AccessibilityPanel from './components/AccessibilityPanel';
import AITutor from './components/AITutor';
import { generateSpeech, decode, decodeAudioData, playSoundCue } from './geminiService';

const AppContent: React.FC<{ 
  prefs: UserPreferences; 
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>; 
  currentUser: any; 
  setCurrentUser: (u: any) => void;
  handleLogout: () => void;
}> = ({ prefs, setPrefs, currentUser, setCurrentUser, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const lastSpokenText = useRef<string>("");

  const getCtx = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
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
                       location.pathname.includes('course') ? 'Kurs sahifasi' :
                       location.pathname.includes('business-model') ? 'Biznes model' : 'Sahifa';
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
                <Link to="/docs" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Yo'riqnoma</Link>
                <Link to="/business-model" className="font-black text-lg uppercase tracking-widest hover:underline decoration-4 underline-offset-8">Biznes model</Link>
                <button 
                  onClick={handleLogout}
                  className="font-black text-sm uppercase opacity-50 hover:opacity-100 transition-opacity"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <Link to="/login" className="brutal-btn bg-yellow-400 px-8 py-3 font-black uppercase text-black">Kirish</Link>
            )}
          </div>
        </div>
      </nav>
      <main id="main-content" className="flex-grow max-w-7xl mx-auto w-full p-6 outline-none" tabIndex={-1}>
        <Routes>
          <Route path="/" element={currentUser ? <Home prefs={prefs} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!currentUser ? <Login onLoginSuccess={setCurrentUser} /> : <Navigate to="/" replace />} />
          <Route path="/docs" element={currentUser ? <Documentation prefs={prefs} /> : <Navigate to="/login" replace />} />
          <Route path="/business-model" element={currentUser ? <BusinessModel prefs={prefs} /> : <Navigate to="/login" replace />} />
          <Route path="/courses/:subjectId" element={currentUser ? <CourseView prefs={prefs} /> : <Navigate to="/login" replace />} />
          <Route path="/lesson/:lessonId" element={currentUser ? <LessonView prefs={prefs} /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      {currentUser && <AccessibilityPanel prefs={prefs} setPrefs={setPrefs} />}
      {currentUser && <AITutor />}
    </div>
  );
};

const App: React.FC = () => {
  const [demoUser, setDemoUser] = useState<any>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('e_imkon_prefs');
    return saved ? JSON.parse(saved) : { fontSize: 15, contrast: 'normal', voiceSupport: true };
  });

  useEffect(() => {
    localStorage.setItem('e_imkon_prefs', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${prefs.fontSize}px`);
  }, [prefs.fontSize]);

  useEffect(() => {
    const savedUser = localStorage.getItem('e_imkon_demo_user');
    if (savedUser) setDemoUser(JSON.parse(savedUser));
    
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('e_imkon_demo_user');
    setDemoUser(null);
  };

  const handleLoginSuccess = (user: any) => {
    setDemoUser(user);
    localStorage.setItem('e_imkon_demo_user', JSON.stringify(user));
  };

  return (
    <HashRouter>
      <AppContent 
        prefs={prefs} setPrefs={setPrefs} 
        currentUser={demoUser} 
        setCurrentUser={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </HashRouter>
  );
};

export default App;
