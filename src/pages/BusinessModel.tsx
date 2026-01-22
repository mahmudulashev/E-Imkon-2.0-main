import React from 'react';
import type { UserPreferences } from '../types';

interface Props {
  prefs: UserPreferences;
}

const BusinessModel: React.FC<Props> = ({ prefs }) => {
  const baseStyle = { fontSize: `${prefs.fontSize}px` };

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-16 animate-in fade-in duration-500" style={baseStyle}>
      <header className="border-b-8 border-slate-900 pb-8">
        <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-4 py-2 text-xs font-black uppercase tracking-widest">
          Biznes model
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mt-6">
          E‑Imkon <span className="marker-yellow">obuna</span> rejasi
        </h1>
        <p className="text-2xl font-bold text-slate-600 mt-4 max-w-3xl">
          Birinchi oy to'liq bepul, keyin esa moslashuvchan paketlar. Maqsad: inklyuziv ta'limni
          hamma uchun arzon va qulay qilish.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <div className="brutal-card p-8 bg-white">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Free plan</div>
          <h2 className="text-3xl font-black mt-3">Bepul</h2>
          <p className="text-4xl font-black mt-6">0 so'm</p>
          <ul className="mt-6 space-y-3 text-sm font-bold text-slate-600">
            <li>• Cheklangan kurslar</li>
            <li>• Asosiy funksiyalar</li>
            <li>• Sinab ko'rish uchun ideal</li>
          </ul>
        </div>

        <div className="brutal-card p-8 bg-yellow-300 border-slate-900">
          <div className="text-xs font-black uppercase tracking-widest text-slate-900">Trial</div>
          <h2 className="text-3xl font-black mt-3">1 oy bepul</h2>
          <p className="text-4xl font-black mt-6">0 so'm</p>
          <ul className="mt-6 space-y-3 text-sm font-bold text-slate-900">
            <li>• To'liq funksiyalar</li>
            <li>• Hammasi ochiq</li>
            <li>• 30 kun sinov</li>
          </ul>
        </div>

        <div className="brutal-card p-8 bg-slate-900 text-black border-slate-900">
          <div className="text-xs font-black uppercase tracking-widest text-yellow-400">Oyma‑oy</div>
          <h2 className="text-3xl font-black mt-3">1 oy</h2>
          <p className="text-4xl font-black mt-6">49 000 so'm</p>
          <ul className="mt-6 space-y-3 text-sm font-bold text-black">
            <li>• Barcha kurslar</li>
            <li>• AI yordamchi</li>
            <li>• Progress saqlanadi</li>
          </ul>
        </div>

        <div className="brutal-card p-8 bg-white border-slate-900">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Eng foydali</div>
          <h2 className="text-3xl font-black mt-3">3 oy</h2>
          <p className="text-4xl font-black mt-6">119 000 so'm</p>
          <ul className="mt-6 space-y-3 text-sm font-bold text-slate-600">
            <li>• 3 oy to'liq kirish</li>
            <li>• Oylikdan arzonroq</li>
            <li>• Kurslar + testlar</li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="brutal-card p-10 bg-indigo-600 border-slate-900 text-black">
          <div className="text-xs font-black uppercase tracking-widest text-black/70">Yillik paket</div>
          <h2 className="text-4xl font-black mt-4">1 yil</h2>
          <p className="text-5xl font-black mt-6">519 000 so'm</p>
          <p className="text-lg font-bold mt-4 text-black/90">
            Eng arzon narx. Yillik ta'lim rejalari, doimiy yangilanishlar, va to'liq access.
          </p>
        </div>

        <div className="brutal-card p-10 bg-white border-slate-900">
          <h3 className="text-3xl font-black uppercase">Nima uchun shu model?</h3>
          <p className="text-lg font-bold text-slate-600 mt-4">
            Ta'lim platformamizda inklyuzivlik birinchi o'rinda. Shuning uchun free plan orqali
            kirish oson, lekin platformani rivojlantirish uchun pullik paketlar ham mavjud.
          </p>
          <div className="mt-6 space-y-3 text-sm font-black uppercase text-slate-500">
            <div>• 1 oy bepul sinov</div>
            <div>• Oylik va yillik moslashuv</div>
            <div>• Talabalar uchun arzon narx</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessModel;
