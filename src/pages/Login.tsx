
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google orqali kirishda xatolik.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="brutal-card p-8 md:p-12 max-w-2xl w-full bg-white border-slate-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center mb-10">
          <div className="inline-block bg-indigo-600 text-white text-4xl font-black px-6 py-2 mb-4 -rotate-1 border-4 border-black">
            E-IMKON
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Inklyuziv Ta'lim</h1>
          <p className="font-bold text-slate-400 mt-2 uppercase text-xs tracking-[0.2em]">Kirish sahifasi</p>
        </div>
        
        <div className="mb-10">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full brutal-card border-4 border-slate-900 bg-white hover:bg-yellow-50 transition-colors p-6 flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center ]">
                <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.22 1.53 7.65 2.82l5.2-5.2C33.38 4.15 29.08 2 24 2 14.64 2 6.73 7.5 3.52 15.47l6.45 5.01C11.6 13.89 17.37 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46 24.5c0-1.56-.14-2.72-.44-3.93H24v7.41h12.52c-.25 1.93-1.64 4.84-4.73 6.8l6.09 4.72c3.64-3.36 5.72-8.3 5.72-15z"/>
                  <path fill="#FBBC05" d="M9.98 28.48A14.5 14.5 0 0 1 9.2 24c0-1.56.27-3.06.78-4.48l-6.45-5A22.01 22.01 0 0 0 2 24c0 3.55.85 6.9 2.53 9.89l5.45-5.41z"/>
                  <path fill="#34A853" d="M24 46c6.1 0 11.22-2.02 14.96-5.5l-6.1-4.72c-1.63 1.13-3.82 1.92-8.86 1.92-6.66 0-12.3-4.39-14.3-10.45l-5.45 5.41C7.47 40.5 14.76 46 24 46z"/>
                </svg>
              </span>
              <div className="text-left">
                <div className="text-xl font-black uppercase tracking-tight">Google bilan kirish</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Xavfsiz va tez kirish</div>
              </div>
            </div>
            <span className="text-3xl group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>

        {error && (
          <p className="text-xs font-bold text-red-600 text-center mb-6">{error}</p>
        )}

        
      </div>
    </div>
  );
};

export default Login;
