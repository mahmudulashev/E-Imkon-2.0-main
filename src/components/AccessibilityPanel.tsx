
import React, { useEffect, useState } from 'react';
import type { UserPreferences } from '../types';

interface Props {
  prefs: UserPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

const AccessibilityPanel: React.FC<Props> = ({ prefs, setPrefs }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = (e: KeyboardEvent) => {
      const modifier = (e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey);
      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleToggle);
    return () => window.removeEventListener('keydown', handleToggle);
  }, []);

  return (
    <section 
      aria-label="Qulaylik va Ovoz sozlamalari"
      className={`fixed bottom-4 left-4 z-50 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-900 rounded-lg p-6 md:p-8 w-72 md:w-96 transition-transform ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.25rem)]'}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left font-black uppercase tracking-tight pb-4 border-b-4 border-slate-100"
        aria-expanded={isOpen}
      >
        <span className="flex items-center text-slate-900">
          <span className="mr-3 text-2xl" aria-hidden="true">♿</span> Qulaylik
        </span>
        <span className="text-xs bg-slate-100 px-3 py-1 border-2 border-slate-900">
          {isOpen ? "Yopish" : "Ochish"}
        </span>
      </button>
      
      <div className={`space-y-8 pt-6 ${isOpen ? '' : 'hidden'}`}>
        <div>
          <label htmlFor="font-range" className="text-xs font-black text-slate-500 uppercase block mb-4">Shrift hajmi: {prefs.fontSize}px</label>
          <input 
            id="font-range"
            type="range" min="12" max="28" value={prefs.fontSize}
            onChange={(e) => setPrefs(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
            className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 border-2 border-slate-900"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-slate-700 uppercase">Yuqori Kontrast (ALT+4)</span>
          <button 
            role="switch"
            aria-checked={prefs.contrast === 'high'}
            onClick={() => setPrefs(prev => ({ ...prev, contrast: prev.contrast === 'high' ? 'normal' : 'high' }))}
            className={`w-12 h-6 rounded-full transition-colors border-2 border-slate-900 ${prefs.contrast === 'high' ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform border border-slate-900 ${prefs.contrast === 'high' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AccessibilityPanel;
