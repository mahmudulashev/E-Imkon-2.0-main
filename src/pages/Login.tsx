
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    setIsLoading(true);
    const mockUser = {
      id: 'demo-' + Math.random(),
      email: 'mehmon@e-imkon.uz',
      user_metadata: { full_name: 'Aziz Mehmon (Demo)' }
    };
    
    setTimeout(() => {
      onLoginSuccess(mockUser);
      setIsLoading(false);
      navigate('/', { replace: true });
    }, 400);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="brutal-btn py-6 flex flex-col items-center justify-center gap-3 bg-gray-100 cursor-not-allowed opacity-70">
            <span className="text-3xl">🔒</span>
            <span className="font-black text-lg uppercase">Google bilan kirish</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hozircha mavjud emas</span>
          </div>

          <button 
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="brutal-btn py-6 flex flex-col items-center justify-center gap-3 bg-yellow-400 group"
          >
            <span className="text-4xl group-hover:rotate-12 transition-transform">🚀</span>
            <span className="font-black text-lg uppercase">Mehmon bo'lib kirish</span>
          </button>
        </div>

        <div className="border-t-4 border-slate-100 pt-8 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Bu demo frontend versiyasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
