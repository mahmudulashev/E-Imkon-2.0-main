
import React, { useState, useEffect, useRef } from 'react';
import type { QuizQuestion, UserPreferences } from '../types';
import { generateSpeech, decode, decodeAudioData } from '../geminiService';

interface Props {
  questions: QuizQuestion[];
  prefs: UserPreferences;
}

const Quiz: React.FC<Props> = ({ questions, prefs }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentQuestion = questions[currentIdx];

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
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsReading(false);
  };

  const speak = async (text: string) => {
    stopAudio();
    setIsReading(true);
    try {
      const ctx = await getAudioContext();
      const base64 = await generateSpeech(text);
      if (base64) {
        const buffer = await decodeAudioData(decode(base64), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsReading(false);
        source.start(0);
        sourceNodeRef.current = source;
      }
    } catch (e) {
      setIsReading(false);
    }
  };

  const readCurrentState = () => {
    if (quizFinished) return;
    const optionsText = currentQuestion.options
      .map((opt, i) => `${String.fromCharCode(65 + i)}-variant: ${opt.text}`)
      .join('. ');
    const fullText = `Savol: ${currentQuestion.question}. Variantlar: ${optionsText}. Tanlash uchun harflarni bosing.`;
    speak(fullText);
  };

  const handleStartQuiz = () => {
    setHasStarted(true);
    document.getElementById('quiz-container')?.focus();
  };

  useEffect(() => {
    if (hasStarted && !quizFinished) {
      readCurrentState();
    }
    return () => stopAudio();
  }, [currentIdx, quizFinished, hasStarted]);

  const toggleQuizAudio = () => {
    if (isReading) {
      stopAudio();
    } else {
      readCurrentState();
    }
  };

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const modifier = (e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey);
      
      // Alt + T: Testni boshlash
      if (modifier && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (!hasStarted) handleStartQuiz();
      }

      if (modifier && e.key.toLowerCase() === 'p') {
        if (hasStarted && !quizFinished) {
          e.preventDefault();
          toggleQuizAudio();
        }
      }

      if (quizFinished || !hasStarted) return;

      const key = e.key.toUpperCase();
      const idx = key.charCodeAt(0) - 65;
      if (idx >= 0 && idx < currentQuestion.options.length) {
        handleSelect(idx);
      }

      if (e.key === 'Enter') {
        if (!isSubmitted && selectedIdx !== null) {
          handleSubmit();
        } else if (isSubmitted) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [selectedIdx, isSubmitted, currentIdx, quizFinished, hasStarted, isReading]);

  const handleSelect = (idx: number) => {
    if (isSubmitted || !hasStarted) return;
    setSelectedIdx(idx);
    speak(`Siz ${String.fromCharCode(65 + idx)}-variantni tanladingiz. Tasdiqlash uchun Enterni bosing.`);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || isSubmitted) return;
    
    const isCorrect = currentQuestion.options[selectedIdx].isCorrect;
    if (isCorrect) setScore(s => s + 1);
    setIsSubmitted(true);

    const feedbackText = isCorrect 
      ? `To'g'ri javob! Barakalla. ${currentQuestion.explanation}` 
      : `Xato javob. To'g'ri javob: ${currentQuestion.options.find(o => o.isCorrect)?.text}. ${currentQuestion.explanation}`;
    
    speak(feedbackText + ". Keyingi savolga o'tish uchun Enterni bosing.");
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedIdx(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      speak(`Tabriklaymiz! Siz testni tugatdingiz. Natijangiz ${score + (currentQuestion.options[selectedIdx!]?.isCorrect ? 1 : 0)} ball.`);
    }
  };

  if (!hasStarted) {
    return (
      <div className={`brutal-card p-12 text-center bg-indigo-600 border-slate-900`}>
        <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Bilimingizni sinab ko'rasizmi?</h3>
        <p className="text-indigo-100 font-bold mb-8 text-xl">Testni boshlash uchun quyidagi tugmani yoki <kbd className="bg-white text-indigo-600 px-2 py-1 rounded">Alt + T</kbd> ni bosing:</p>
        <button 
          onClick={handleStartQuiz}
          className="brutal-btn bg-yellow-400 text-slate-900 py-6 px-12 text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform active:translate-x-1 active:translate-y-1"
        >
          📝 TESTNI BOSHLASH (Alt + T)
        </button>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className={`brutal-card p-10 text-center animate-in zoom-in duration-300 ${prefs.contrast === 'high' ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-green-50'}`}>
        <div className="text-6xl mb-6">🎉</div>
        <h3 className="text-4xl font-black mb-4 uppercase">Sinov tugadi!</h3>
        <p className="text-2xl font-bold mb-8">Natijangiz: {score} / {questions.length}</p>
        <button 
          onClick={() => {
            setQuizFinished(false);
            setCurrentIdx(0);
            setScore(0);
            setIsSubmitted(false);
            setSelectedIdx(null);
            setHasStarted(false);
          }}
          className="brutal-btn bg-white text-slate-900 hover:bg-slate-100"
        >
          QAYTA TOPSHIRISH
        </button>
      </div>
    );
  }

  return (
    <div 
      id="quiz-container"
      tabIndex={-1}
      role="region" 
      aria-label="Bilimni sinash testi"
      className={`brutal-card p-8 md:p-12 animate-in fade-in duration-500 outline-none ${prefs.contrast === 'high' ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white'}`}
    >
      <div className="flex justify-between items-center mb-10">
        <span className="bg-indigo-600 text-white px-4 py-1 text-sm font-black uppercase -rotate-2">
          Savol {currentIdx + 1} / {questions.length}
        </span>
        <button 
          onClick={toggleQuizAudio}
          className="text-xs font-black uppercase underline decoration-2 underline-offset-4 hover:text-indigo-600"
        >
          {isReading ? '⏸️ To\'xtatish (Ctrl/Cmd+Shift+P)' : '🔊 Qayta eshitish (Ctrl/Cmd+Shift+P)'}
        </button>
      </div>

      <h3 className="text-3xl md:text-4xl font-black mb-10 leading-tight tracking-tight">
        {currentQuestion.question}
      </h3>

      <div className="grid gap-6 mb-10" role="radiogroup" aria-label="Variantlar">
        {currentQuestion.options.map((opt, idx) => {
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-900';
          
          if (selectedIdx === idx) {
            bgColor = 'bg-indigo-50';
            borderColor = 'border-indigo-600';
          }
          
          if (isSubmitted) {
            if (opt.isCorrect) {
              bgColor = 'bg-green-100';
              borderColor = 'border-green-600';
            } else if (selectedIdx === idx) {
              bgColor = 'bg-red-100';
              borderColor = 'border-red-600';
            }
          }

          return (
            <button
              key={idx}
              role="radio"
              aria-checked={selectedIdx === idx}
              disabled={isSubmitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-6 brutal-btn text-2xl font-bold flex items-center justify-between transition-all ${bgColor} ${borderColor} ${selectedIdx === idx ? 'translate-x-2 -translate-y-1' : ''} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none`}
            >
              <div className="flex items-center">
                <span className="w-10 h-10 rounded-full border-4 border-slate-900 flex items-center justify-center mr-4 bg-white text-base">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt.text}</span>
              </div>
              {isSubmitted && opt.isCorrect && <span className="text-3xl" aria-label="To'g'ri javob">✅</span>}
              {isSubmitted && selectedIdx === idx && !opt.isCorrect && <span className="text-3xl" aria-label="Noto'g'ri javob">❌</span>}
            </button>
          );
        })}
      </div>

      {isSubmitted && (
        <div className="mb-10 p-8 bg-slate-900 text-white border-l-8 border-yellow-400 animate-in slide-in-from-left-4 duration-500">
          <p className="font-black text-yellow-400 mb-2 uppercase text-xs tracking-widest">Tushuntirish:</p>
          <p className="text-xl font-bold leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedIdx === null}
            className="brutal-btn bg-yellow-400 disabled:opacity-50 px-12 py-5 text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            TEKSHIRISH (ENTER)
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="brutal-btn bg-slate-900 text-white px-12 py-5 text-2xl font-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
          >
            {currentIdx < questions.length - 1 ? 'KEYINGI SAVOL →' : 'YAKUNLASH'}
          </button>
        )}
      </div>
      
      <p className="text-[10px] font-black uppercase mt-8 text-slate-400 text-center tracking-widest">
        Klaviatura: A, B, C - Tanlash | Enter - Tasdiqlash | Ctrl/Cmd+Shift+P - Audio
      </p>
    </div>
  );
};

export default Quiz;
