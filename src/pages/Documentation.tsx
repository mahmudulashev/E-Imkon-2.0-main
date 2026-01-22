
import React, { useState, useRef, useEffect } from 'react';
import type { UserPreferences } from '../types';
// Fix: Corrected exported members from geminiService
import { generateSpeech, decode, decodeAudioData } from '../geminiService';

interface Props {
  prefs: UserPreferences;
}

const Documentation: React.FC<Props> = ({ prefs }) => {
  const isHigh = prefs.contrast === 'high';
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const getAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.onended = null;
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (isAudioLoading) return;
    
    try {
      const ctx = await getAudioContext();
      
      if (!audioBufferRef.current) {
        setIsAudioLoading(true);
        const text = `E-Imkon yo'riqnomasi. 
        Shortcutlar: Ctrl yoki Cmd + Shift + H - bosh sahifa. 
        Ctrl yoki Cmd + Shift + D - yo'riqnoma. 
        Ctrl yoki Cmd + Shift + C - kontrast rejim. 
        Ctrl yoki Cmd + Shift + P - dars audio yoki qo'llanma audio. 
        Ctrl yoki Cmd + Shift + R - ekran o'qish rejimi (avtomatik o'qish). 
        Ctrl yoki Cmd + Shift + T - testni boshlash. 
        Ctrl yoki Cmd + Shift + K - qulaylik panelini ochish yoki yopish. 
        M - AI tutor, ESC - yopish. 
        Darsda Ctrl yoki Cmd + Shift + chap yoki o'ng strelka bilan oldingi yoki keyingi darsga o'tish mumkin. 
        Kurs sahifasida Alt + yuqoriga yoki pastga bilan darslarni tez tanlash mumkin. 
        Testda A, B, C variant tanlash, Enter tasdiqlash.`;
        
        const base64 = await generateSpeech(text);
        if (base64) {
          // Fix: Changed decodePCM to decodeAudioData and decodeBase64 to decode
          const buf = await decodeAudioData(decode(base64), ctx);
          audioBufferRef.current = buf;
        }
      }

      if (audioBufferRef.current) {
        stopAudio();
        const source = ctx.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(ctx.destination);
        source.onended = () => {
          setIsPlaying(false);
          sourceNodeRef.current = null;
        };
        source.start(0);
        sourceNodeRef.current = source;
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) stopAudio();
    else playAudio();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const modifier = (e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey);
      if (modifier && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleAudio();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      stopAudio();
    };
  }, [isPlaying]);

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-16 animate-in fade-in duration-500 text-black">
      <header className="border-b-8 border-slate-900 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">
            Yo'riqnoma
          </h1>
          <p className="text-2xl font-bold italic handwritten text-slate-600">
            Dasturchilar va foydalanuvchilar uchun qo'llanma.
          </p>
        </div>
        <button 
          onClick={toggleAudio}
          className={`brutal-btn ${isPlaying ? 'bg-red-400' : 'bg-yellow-400'} font-black text-lg py-4 px-8 min-w-[200px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all`}
        >
          {isAudioLoading ? '⌛ YUKLANMOQDA...' : isPlaying ? '⏸️ TO\'XTATISH' : '🔊 ESHITISH (Ctrl/Cmd+Shift+P)'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className={`brutal-card p-10 ${isHigh ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white border-slate-900'}`}>
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tight flex items-center">
            <span className="mr-4 text-5xl">⌨️</span> Shortcutlar
          </h2>
          <div className="space-y-6 font-main font-bold text-xl">
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Bosh sahifa</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + H</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Yo'riqnoma</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + D</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>AI Tutor (Suhbat)</span>
              <kbd className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">M tugmasi</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Kontrast Rejim</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + C</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Dars audio</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + P</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Testni boshlash</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + T</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Kursdagi darslar</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Alt + ↑ / ↓</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Qulaylik paneli</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + K</kbd>
            </div>
            <div className="flex justify-between items-center border-b-4 border-slate-100 pb-3">
              <span>Ekran o'qish rejimi</span>
              <kbd className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Ctrl/Cmd + Shift + R</kbd>
            </div>
          </div>
        </section>

        <section className={`brutal-card p-10 bg-slate-900 text-white border-slate-900`}>
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tight text-yellow-400">🗣️ Ovozli buyruqlar</h2>
          <div className="space-y-6 text-lg font-bold">
            <p className='text-black'>AI Tutor bilan quyidagicha gaplashishingiz mumkin:</p>
            <ul className="list-disc pl-6 space-y-4 text-black">
              <li>"Matematika sahifasiga o't"</li>
              <li>"Ingliz tili kursini och"</li>
              <li>"Frontend kursini ko'rsat"</li>
              <li>"Matematika sahifasida 1-darsga o't"</li>
              <li>"Darsni o'qib ber"</li>
            </ul>
            <p className="text-sm text-white/70">
              Eslatma: AI faqat o'zbek tilida javob beradi.
            </p>
          </div>
        </section>
      </div>

      <div className={`brutal-card p-12 ${isHigh ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-indigo-600 '}`}>
        <h2 className="text-5xl font-black mb-8 uppercase italic">Tez yordam kartasi</h2>
        <p className="text-2xl font-bold mb-8 leading-relaxed text-black">
          Eng ko'p kerak bo'ladigan amallar bir joyda:
        </p>
        <ul className="grid md:grid-cols-2 gap-8 text-xl font-bold">
          <li className="bg-white/10 p-6 border-2 border-white/20 text-black">
            <span className="text-yellow-400 block mb-2">Darsni tinglash</span>
            Alt/Option/Cmd + P yoki AI ga "Darsni o'qib ber" deb ayting.
          </li>
          <li className="bg-white/10 p-6 border-2 border-white/20">
            <span className="text-yellow-400 block mb-2">Darslar orasida yurish</span>
            Dars sahifasida Ctrl/Cmd + Shift + ← / →. Kurs sahifasida Alt + ↑ / ↓.
          </li>
          <li className="bg-white/10 p-6 border-2 border-white/20">
            <span className="text-yellow-400 block mb-2">Testni tez boshlash</span>
            Alt/Option/Cmd + T yoki sahifadagi tugma.
          </li>
          <li className="bg-white/10 p-6 border-2 border-white/20">
            <span className="text-yellow-400 block mb-2">AI Tutor</span>
            M tugmasi bilan oching, ESC bilan yoping.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Documentation;
