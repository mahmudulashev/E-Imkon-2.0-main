import React from 'react';
import type { UserPreferences } from '../types';

interface Props {
  prefs: UserPreferences;
}

const BusinessModel: React.FC<Props> = ({ prefs }) => {

  const baseStyle = { fontSize: `${prefs.fontSize}px` };


  const pricing = [
    {
      name: "Bepul",
      price: "0 so'm",
      description: "Asosiy kurslar va demo funksiyalar.",
      badge: "START"
    },
    {
      name: "Individual",
      price: "29 000 so'm/oy",
      description: "AI tutor, to'liq darslar, progress tracking.",
      badge: "ENG OMMABOP"
    },
    {
      name: "Oila",
      price: "59 000 so'm/oy",
      description: "3 ta profil, hisobotlar.",
      badge: "OILA PAKETI"
    },
    {
      name: "Maktab/Markaz",
      price: "10 000 so'm/oy / o'quvchi",
      description: "Minimal 50 o'quvchi,  statistika.",
      badge: "B2B"
    }
  ];



  return (
    <div className="max-w-6xl mx-auto py-12 space-y-16 animate-in fade-in duration-500" style={baseStyle}>
      <header className="border-b-8 border-slate-900 pb-10">
        <div className="inline-block bg-slate-900 text-white font-black px-4 py-2 mb-6 uppercase tracking-widest text-xs">
          Biznes model
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">
          E-Imkon: barqaror ta'lim modeli
        </h1>
        <p className="text-2xl font-bold text-slate-700 max-w-3xl leading-snug">
          Inklyuziv ta'limni ommalashtirish uchun aniq qiymat, adolatli narx va
          hamkorlikka tayyor ekotizim.
        </p>
      </header>

     

  

      <section>
        <div className="flex items-center justify-between gap-6 mb-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Tariflar</h2>
          <span className="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 border-2 border-slate-900">
            To'g'irlangan narxlar
          </span>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pricing.map((plan) => (
            <div key={plan.name} className="brutal-card p-8 bg-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                    {plan.badge}
                  </div>
                  <h3 className="text-3xl font-black mt-3 uppercase">{plan.name}</h3>
                </div>
                <div className="text-2xl font-black text-slate-900">{plan.price}</div>
              </div>
              <div className="inline-flex items-center gap-2 border-2 border-slate-900 bg-yellow-300 px-3 py-1 text-[11px] font-black uppercase tracking-widest mb-4">
                1-oy ishlatish tekin
              </div>
              <p className="text-lg font-bold text-slate-700 mb-6">{plan.description}</p>
              <button className="brutal-btn bg-yellow-300">Ariza qoldirish</button>
            </div>
          ))}
        </div>
        <p className="text-sm font-bold text-slate-500 mt-6">
          B2B paketlar uchun individual shartnoma va hisob-kitob taklif qilinadi.
        </p>
      </section>

      
    </div>
  );
};

export default BusinessModel;
