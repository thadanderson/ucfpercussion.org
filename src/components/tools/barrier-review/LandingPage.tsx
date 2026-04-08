"use client";

import React from "react";

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="flex-1 bg-black text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80 z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-block border-b-2 border-amber-500 pb-2 mb-2">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em]">UCF Percussion Studies</span>
          </div>
          <h1 className="font-black font-serif text-white tracking-tight leading-none">
            <span className="block text-6xl md:text-9xl mb-2">BARRIER</span>
            <span className="block text-2xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 tracking-wide">
              REVIEW & DRAWING
            </span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto font-light border-l-2 border-amber-500/50 pl-6 italic text-left md:text-center md:border-l-0 md:pl-0 mt-6">
            &ldquo;Luck is what happens when preparation meets opportunity.&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 text-left">
          {[
            { step: "01", title: "Configure", desc: "Select your proficiency level and the specific method book or rudiment family you wish to review." },
            { step: "02", title: "Draw", desc: "Initiate the chance operation mechanism. The system will randomly select a specific etude or rudiment for your barrier." },
            { step: "03", title: "Analyze", desc: "Receive instant, AI-generated technical focus points tailored specifically to your drawn selection." },
          ].map((item, idx) => (
            <div key={idx} className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm hover:border-amber-500 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl font-black text-amber-500">{item.step}</span>
              </div>
              <h3 className="text-white font-bold uppercase tracking-wider mb-3 text-lg">{item.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-8">
          <button
            onClick={onEnter}
            className="group relative px-12 py-6 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_50px_rgba(245,158,11,0.5)]"
          >
            <span className="relative z-10">Open Menu</span>
            <div className="absolute inset-0 border border-white/20 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
