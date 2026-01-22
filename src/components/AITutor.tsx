
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type } from '@google/genai';
import { useNavigate } from 'react-router-dom';
import { encode, decode, decodeAudioData } from '../geminiService';
import { getGeminiApiKey } from '../env';

const AITutor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcription, setTranscription] = useState('');
  
  const navigate = useNavigate();
  const audioContextRef = useRef<AudioContext | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // State closure problem check
  const isActiveRef = useRef(false);

  const stopAudio = () => {
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const initAudio = async () => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    if (!outCtxRef.current) outCtxRef.current = new AudioContext({ sampleRate: 24000 });
    if (!streamRef.current) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    if (outCtxRef.current.state === 'suspended') await outCtxRef.current.resume();
  };

  const handleToolCall = (fc: any, session: any) => {
    let result = "Bajarildi";
    const name = fc.name;
    const args = fc.args;

    if (name === 'navigate') {
      const page = args.page.toLowerCase();
      const paths: any = { 
        'home': '/', 'bosh sahifa': '/', 'asosiy': '/',
        'math': '/courses/math-101', 'matematika': '/courses/math-101', 'matemika': '/courses/math-101', 'hisob-kitob': '/courses/math-101',
        'english': '/courses/english-101', 'ingliz tili': '/courses/english-101', 'inglizcha': '/courses/english-101',
        'frontend': '/courses/frontend-101', 'dasturlash': '/courses/frontend-101', 'veb dasturlash': '/courses/frontend-101',
        'docs': '/docs', 'yo\'riqnoma': '/docs', 'yordam': '/docs'
      };
      
      const targetPath = paths[page];
      if (targetPath) {
        navigate(targetPath);
        result = `Hozir ${page} sahifasiga o'tamiz.`;
      } else {
        const fallbackKey = Object.keys(paths).find(k => page.includes(k) || k.includes(page));
        if (fallbackKey) {
          navigate(paths[fallbackKey]);
          result = `${fallbackKey} sahifasi ochildi.`;
        } else {
          result = `Xato: "${page}" nomli sahifa topilmadi.`;
        }
      }
    } else if (name === 'open_lesson') {
      const lessonMaps: any = {
        'english': ['eng-l1', 'eng-l2'],
        'ingliz tili': ['eng-l1', 'eng-l2'],
        'math': ['math-l1'],
        'matematika': ['math-l1'],
        'matemika': ['math-l1'],
        'frontend': ['fe-l1'],
        'dasturlash': ['fe-l1']
      };
      const courseKey = args.course.toLowerCase();
      const idx = parseInt(args.index) - 1;
      
      const lessons = lessonMaps[courseKey];
      if (lessons && lessons[idx]) {
        navigate(`/lesson/${lessons[idx]}`);
        result = `${args.course} kursidan ${args.index}-dars ochildi.`;
      } else {
        result = `Kechirasiz, ${args.course} kursida ${args.index}-darsni topa olmadim.`;
      }
    } else if (name === 'scroll') {
      window.scrollBy({ top: args.direction === 'up' ? -500 : 500, behavior: 'smooth' });
    } else if (name === 'lesson_audio') {
      window.dispatchEvent(new CustomEvent('app:control-audio', { detail: args.action }));
    }
    
    // Fix: Guideline-compliant single function response object instead of array
    session.sendToolResponse({ 
      functionResponses: { id: fc.id, name, response: { result } } 
    });
  };

  const startAssistant = async () => {
    setIsActive(true);
    isActiveRef.current = true;
    setStatus('listening');
    setTranscription('Sizni tinglayapman...');

    try {
      await initAudio();
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('Gemini API key topilmadi. .env faylini tekshiring.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            processor.onaudioprocess = (e) => {
              if (!isActiveRef.current) return;
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                const sample = Math.max(-1, Math.min(1, input[i]));
                int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
              }
              // Guideline: Use promise to prevent race conditions during streaming
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            audioContextRef.current!.createMediaStreamSource(streamRef.current!).connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            const toolCalls = m.toolCall?.functionCalls;
            if (toolCalls?.length) {
              sessionPromise.then(s => toolCalls.forEach(fc => handleToolCall(fc, s)));
            }
            
            const inputText = m.serverContent?.inputTranscription?.text;
            if (inputText) {
              setTranscription(inputText);
              setStatus('thinking');
            }
            
            const outputText = m.serverContent?.outputTranscription?.text;
            if (outputText) {
              setTranscription(outputText);
              setStatus('speaking');
              setIsSpeaking(true);
            }

            if (m.serverContent?.turnComplete) {
              setStatus('listening');
              setIsSpeaking(false);
            }

            const audio = m.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
            if (audio && outCtxRef.current) {
              const ctx = outCtxRef.current;
              // Guideline: Maintain synchronized audio playback queue
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buf = await decodeAudioData(decode(audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buf;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (m.serverContent?.interrupted) stopAudio();
          },
          onclose: () => stopAssistant(),
          onerror: () => stopAssistant()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `Siz E‑Imkon yordamchisiz. Oddiy, tushunarli va do'stona qilib gapiring. 
          Faqat o'zbek tilida javob bering.
          
          Navigatsiya bo'yicha yordam:
          - "Matematikani och" yoki "Matematika kursi" desa -> navigate(page: "matematika")
          - "Matemika sahifasiga o't" desa -> navigate(page: "matemika")
          - "Ingliz tilini och" -> navigate(page: "ingliz tili")
          - "Frontendni och" yoki "Dasturlash" -> navigate(page: "frontend")
          - "Matematika sahifasida 1-darsga o't" -> open_lesson(course: "matematika", index: 1)
          - "Darsni o'qib ber" desa -> lesson_audio(action: "play")
          
          Foydalanuvchi bilan xushmuomala bo'ling.`,
          tools: [{ functionDeclarations: [
            { name: 'open_lesson', parameters: { type: Type.OBJECT, properties: { course: { type: Type.STRING }, index: { type: Type.NUMBER } }, required: ['course', 'index'] } },
            { name: 'navigate', parameters: { type: Type.OBJECT, properties: { page: { type: Type.STRING } }, required: ['page'] } },
            { name: 'scroll', parameters: { type: Type.OBJECT, properties: { direction: { type: Type.STRING } }, required: ['direction'] } },
            { name: 'lesson_audio', parameters: { type: Type.OBJECT, properties: { action: { type: Type.STRING } }, required: ['action'] } }
          ]}],
          inputAudioTranscription: {}, outputAudioTranscription: {}
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gemini xizmatiga ulanishda xatolik.';
      console.error(e);
      alert(message);
      stopAssistant();
    }
  };

  const stopAssistant = () => {
    setIsActive(false);
    isActiveRef.current = false;
    setIsSpeaking(false);
    setStatus('idle');
    setTranscription('');
    stopAudio();
    if (sessionRef.current) sessionRef.current.then((s:any) => s.close());
    if (processorRef.current) processorRef.current.disconnect();
    sessionRef.current = null;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        // Use Ref value to correctly toggle regardless of state closures
        if (isActiveRef.current) {
          stopAssistant();
        } else {
          startAssistant();
        }
      }
      if (e.key === 'Escape' && isActiveRef.current) stopAssistant();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []); // Empty deps to listen once

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => isActive ? stopAssistant() : startAssistant()}
          className={`w-24 h-24 rounded-full brutal-card flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-90 ${isActive ? 'bg-red-500 -translate-y-4 shadow-none' : 'bg-indigo-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}`}
        >
          {isActive ? (
            <span className="text-4xl text-white font-black">✕</span>
          ) : (
            <span className="text-5xl">🤖</span>
          )}
        </button>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-[90] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <div className="bg-slate-900 text-white rounded-[48px] border-4 border-white shadow-[0_-20px_60px_rgba(99,102,241,0.3)] overflow-hidden relative">
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-1000 ${isSpeaking ? 'opacity-40' : 'opacity-10'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-[pulse_3s_infinite]" />
            </div>

            <div className="relative p-10 flex flex-col items-center space-y-8 text-center">
              <div className="w-16 h-1 bg-white/20 rounded-full mb-4" />
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-20 h-20 rounded-full border-4 border-indigo-400 flex items-center justify-center text-4xl mb-2 ${isSpeaking ? 'animate-pulse scale-110' : ''}`}>
                  {status === 'speaking' ? '🗣️' : '✨'}
                </div>
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-indigo-300">
                  {status === 'listening' ? 'Tinglayapman...' : status === 'thinking' ? 'O\'ylayapman...' : 'E-Imkon Gemini'}
                </h2>
              </div>
              <p className="text-3xl md:text-4xl font-black leading-tight max-w-xl min-h-[4rem] px-4 font-main tracking-tight">
                {transcription || "Qanday yordam beray?"}
              </p>
              <div className="flex gap-4">
                 <button onClick={stopAssistant} className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-full font-black uppercase text-sm border-2 border-white/20 transition-all">
                   Yopish (ESC)
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isActive && (
        <div 
          onClick={stopAssistant}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[85] animate-in fade-in duration-500" 
        />
      )}
    </>
  );
};

export default AITutor;
