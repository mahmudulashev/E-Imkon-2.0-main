
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { UserPreferences } from '../types';
import { generateSpeech, decode, decodeAudioData } from '../geminiService';
import { getGeminiApiKey } from '../env';
import { MOCK_LESSONS } from '../mockData';
import Quiz from '../components/Quiz';

interface Props {
  prefs: UserPreferences;
}

const LessonView: React.FC<Props> = ({ prefs }) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [allLessonsInCourse, setAllLessonsInCourse] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [currentActiveChunk, setCurrentActiveChunk] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentChunkIdx = useRef(0);
  const isPlayingRef = useRef(false);
  const audioCache = useRef<{ [key: number]: AudioBuffer }>({});
  const inFlightPrefetch = useRef<Set<number>>(new Set());

  const getAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    async function fetchLessonData() {
      const flatMock = Object.values(MOCK_LESSONS).flat();
      const currentLesson = flatMock.find(l => l.id === lessonId);
      const courseLessons = currentLesson
        ? MOCK_LESSONS[currentLesson.course_id as keyof typeof MOCK_LESSONS] || []
        : [];

      setLesson(currentLesson);
      setAllLessonsInCourse(courseLessons);
    }
    fetchLessonData();
    window.scrollTo(0, 0);
    return () => stopAudio();
  }, [lessonId]);

  const prefetchSection = async (idx: number) => {
    if (!lesson) return;
    if (audioCache.current[idx] || inFlightPrefetch.current.has(idx)) return;
    const sections = lesson.content.sections;
    if (!sections || idx >= sections.length) return;
    inFlightPrefetch.current.add(idx);
    try {
      const ctx = await getAudioContext();
      const section = sections[idx];
      const text = `${section.title}. ${section.content}`;
      const base64 = await generateSpeech(text);
      if (base64) {
        const buffer = await decodeAudioData(decode(base64), ctx);
        audioCache.current[idx] = buffer;
      }
    } catch (e) {
      console.error("Prefetch audio error:", e);
    } finally {
      inFlightPrefetch.current.delete(idx);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setLoadingAudio(false);
  };

  const playChunk = async (idx: number) => {
    if (!lesson || !isPlayingRef.current) return;
    
    const sections = lesson.content.sections;
    if (idx >= sections.length) {
      stopAudio();
      currentChunkIdx.current = 0;
      setCurrentActiveChunk(0);
      return;
    }

    setCurrentActiveChunk(idx);
    currentChunkIdx.current = idx;

    try {
      const ctx = await getAudioContext();
      let buffer = audioCache.current[idx];

      if (!buffer) {
        setLoadingAudio(true);
        const section = sections[idx];
        const text = `${section.title}. ${section.content}`;
        const base64 = await generateSpeech(text);
        if (base64) {
          buffer = await decodeAudioData(decode(base64), ctx);
          audioCache.current[idx] = buffer;
        } else {
          setAudioError("Ovozli o'qish uchun Gemini API key kerak. .env faylini tekshiring.");
        }
      }

      if (buffer && isPlayingRef.current) {
        setLoadingAudio(false);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
          if (isPlayingRef.current) {
            playChunk(idx + 1);
          }
        };
        
        source.start(0);
        sourceNodeRef.current = source;
        
        prefetchSection(idx + 1);
        prefetchSection(idx + 2);
      } else {
        if (isPlayingRef.current) stopAudio();
      }
    } catch (e) {
      console.error("Audio play error:", e);
      stopAudio();
    }
  };

  const toggleAudio = async () => {
    if (isPlaying) {
      stopAudio();
    } else {
      if (!getGeminiApiKey()) {
        setAudioError("Ovozli o'qish uchun Gemini API key kerak. .env faylini tekshiring.");
        return;
      }
      setAudioError(null);
      setIsPlaying(true);
      isPlayingRef.current = true;
      await playChunk(currentChunkIdx.current);
    }
  };

  useEffect(() => {
    if (!lesson) return;
    prefetchSection(0);
    prefetchSection(1);
  }, [lesson]);

  useEffect(() => {
    const handleAudioCommand = (e: any) => {
      const action = e.detail;
      if (action === 'play') toggleAudio();
      else if (action === 'pause' || action === 'stop') stopAudio();
    };
    window.addEventListener('app:control-audio', handleAudioCommand);
    return () => window.removeEventListener('app:control-audio', handleAudioCommand);
  }, [isPlaying, lesson]);

  const currentIndex = allLessonsInCourse.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessonsInCourse[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && currentIndex < allLessonsInCourse.length - 1 ? allLessonsInCourse[currentIndex + 1] : null;

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      const modifier = (e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey);
      if (!modifier) return;

      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleAudio();
      }
      if (e.key === 'ArrowLeft' && prevLesson) {
        e.preventDefault();
        navigate(`/lesson/${prevLesson.id}`);
      }
      if (e.key === 'ArrowRight' && nextLesson) {
        e.preventDefault();
        navigate(`/lesson/${nextLesson.id}`);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [prevLesson, nextLesson, navigate, isPlaying, lesson]);

  if (!lesson) return <div className="p-20 text-center font-black text-3xl uppercase">Yuklanmoqda...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-16 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <Link to={`/courses/${lesson.course_id}`} className="brutal-btn bg-white">← ORQAGA</Link>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={toggleAudio}
            className={`brutal-btn ${isPlaying ? 'bg-red-400' : 'bg-yellow-400'} font-black flex items-center space-x-3 px-8 py-4 text-xl min-w-[280px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1`}
          >
            <span>{loadingAudio ? '⌛ YUKLANMOQDA...' : isPlaying ? '⏸️ TO\'XTATISH' : '🔊 DARSNI ESHITISH'}</span>
          </button>
          <p className="text-[10px] font-black uppercase mt-2 text-slate-400 tracking-widest italic">Shortcut: Ctrl/Cmd + Shift + P</p>
          {audioError && (
            <p className="text-[11px] font-bold mt-2 text-red-600">{audioError}</p>
          )}
        </div>
      </div>

      <div className="brutal-card p-10 bg-white">
        <h1 className="text-5xl md:text-7xl font-black mb-12 border-b-8 border-slate-900 pb-6 uppercase leading-none tracking-tighter">{lesson.title}</h1>
        <div className="space-y-12">
          {lesson.content.sections.map((section: any, idx: number) => (
            <section key={idx} className="transition-all duration-500">
              <h3 className={`text-2xl font-black mb-4 uppercase italic tracking-tight transition-colors ${isPlaying && currentActiveChunk === idx ? 'text-indigo-600' : 'text-slate-400'}`}>
                {section.title}
              </h3>
              <p className={`text-2xl font-bold font-main leading-relaxed transition-all duration-300 rounded-lg ${isPlaying && currentActiveChunk === idx ? 'bg-indigo-50 border-l-8 border-indigo-600 pl-6 py-4 shadow-sm' : 'pl-2'}`} style={{ fontSize: `${prefs.fontSize}px` }}>
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>

      {lesson.content.quiz && <Quiz questions={lesson.content.quiz} prefs={prefs} />}

      <div className="flex justify-between items-center py-10 border-t-4 border-slate-900">
        {prevLesson && <button onClick={() => navigate(`/lesson/${prevLesson.id}`)} className="brutal-btn bg-white text-black">← OLDINGI DARS</button>}
        {nextLesson ? <button onClick={() => navigate(`/lesson/${nextLesson.id}`)} className="brutal-btn bg-slate-900 text-black">KEYINGI DARS →</button> : <Link to="/" className="brutal-btn bg-green-500 text-white">TUGATISH 🎉</Link>}
      </div>
    </div>
  );
};

export default LessonView;
