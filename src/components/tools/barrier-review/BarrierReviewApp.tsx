"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { RouletteItem, RouletteResult } from "./types";
import { PERCUSSION_DATA, SARCASTIC_QUOTES } from "./constants";
import { soundService } from "./soundService";
import DrawSelector from "./DrawSelector";
import SideMenu from "./SideMenu";
import LandingPage from "./LandingPage";
import FilterMenu from "./FilterMenu";
import ProfessorComment from "./ProfessorComment";
import FullScreenMode from "./FullScreenMode";

export default function BarrierReviewApp() {
  const [showLanding, setShowLanding] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("Snare 1");
  const [selectedCategory, setSelectedCategory] = useState("Portraits in Rhythm");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<RouletteResult | null>(null);
  const [history, setHistory] = useState<RouletteResult[]>([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [professorQuote, setProfessorQuote] = useState<string | null>(null);

  useEffect(() => {
    const initAudio = () => {
      soundService.init();
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
    window.addEventListener("click", initAudio);
    window.addEventListener("keydown", initAudio);
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    soundService.setMute(newState);
    if (!newState) soundService.playClick();
  };

  const rawItems = useMemo(() => PERCUSSION_DATA[selectedLevel]?.[selectedCategory] || [], [selectedLevel, selectedCategory]);
  const activeItems = useMemo(() => rawItems.filter((item) => !excludedIds.includes(item.id)), [rawItems, excludedIds]);

  const handleSpinEnd = useCallback(async (item: RouletteItem) => {
    soundService.playSuccess();
    setIsLoadingAdvice(true);
    const randomQuote = SARCASTIC_QUOTES[Math.floor(Math.random() * SARCASTIC_QUOTES.length)];
    setProfessorQuote(randomQuote);
    const newResult: RouletteResult = { item, timestamp: Date.now() };
    setCurrentResult(newResult);

    try {
      const res = await fetch("/api/etude-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: item.label, source: item.source, tempo: item.tempo }),
      });
      const { advice } = await res.json();
      const finalizedResult = { ...newResult, advice };
      setCurrentResult(finalizedResult);
      setHistory((prev) => [finalizedResult, ...prev].slice(0, 20));
    } catch {
      const finalizedResult = { ...newResult, advice: "Focus on steady time and clean articulation. You've got this!" };
      setCurrentResult(finalizedResult);
      setHistory((prev) => [finalizedResult, ...prev].slice(0, 20));
    }
    setIsLoadingAdvice(false);
  }, []);

  const handleSelection = (level: string, category: string) => {
    setSelectedLevel(level);
    setSelectedCategory(category);
    setCurrentResult(null);
    setProfessorQuote(null);
    setExcludedIds([]);
  };

  const handleToggleItem = (id: string) => {
    soundService.playClick();
    setExcludedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleAll = (shouldExclude: boolean) => {
    soundService.playClick();
    setExcludedIds(shouldExclude ? rawItems.map((i) => i.id) : []);
  };

  if (showLanding) {
    return (
      <>
        <FullScreenMode />
        <LandingPage onEnter={() => {
        soundService.playClick();
        setShowLanding(false);
        setIsMenuOpen(true);
      }} />
      </>
    );
  }

  return (
    <div className="flex-1 bg-black text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <FullScreenMode />
      <SideMenu
        data={PERCUSSION_DATA}
        selectedLevel={selectedLevel}
        selectedCategory={selectedCategory}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelect={(l, c) => { soundService.playClick(); handleSelection(l, c); }}
        onHome={() => { soundService.playClick(); setShowLanding(true); }}
      />

      <FilterMenu
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        items={rawItems}
        excludedIds={excludedIds}
        onToggle={handleToggleItem}
        onToggleAll={handleToggleAll}
      />

      {/* Toolbar (replaces the original fixed navbar) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-black">
        <button
          onClick={() => { soundService.playClick(); setIsMenuOpen(true); }}
          className="p-2 text-amber-500 hover:text-white hover:bg-neutral-800 rounded-sm transition-colors"
          aria-label="Open Menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-lg md:text-xl font-serif font-black text-amber-400 tracking-wider uppercase">
          Barrier Review &amp; Drawing
        </h2>

        <button
          onClick={toggleMute}
          className={`p-2 rounded-sm transition-colors ${isMuted ? "text-neutral-600 hover:text-neutral-400" : "text-amber-500 hover:text-amber-300"}`}
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center py-10 px-4 md:px-8">
        {/* Context Header */}
        <header className="text-center mb-10 max-w-4xl w-full">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-neutral-700" />
            <div className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">{selectedLevel}</div>
            <div className="h-[1px] w-12 bg-neutral-700" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <h3 className="text-3xl md:text-5xl font-black font-serif text-white tracking-tight">{selectedCategory}</h3>
            <button
              onClick={() => { soundService.playClick(); setIsFilterOpen(true); }}
              className="group relative p-2 text-neutral-500 hover:text-amber-500 transition-colors"
              title="Configure Pool"
            >
              <div className="absolute inset-0 bg-neutral-800 rounded-full scale-0 group-hover:scale-100 transition-transform" />
              <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Wheel & Result */}
        <main className="w-full max-w-2xl flex flex-col items-center gap-12">
          <DrawSelector items={activeItems} onSpinEnd={handleSpinEnd} />

          <div className={`w-full transition-all duration-700 ${currentResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 h-0 overflow-hidden"}`}>
            {currentResult && (
              <div className="relative">
                {professorQuote && <ProfessorComment quote={professorQuote} />}
                <div className={`w-full p-8 rounded-sm border-l-4 transition-all duration-500 relative bg-neutral-900 ${isLoadingAdvice ? "border-neutral-700" : "border-amber-500 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)]"}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-neutral-800 pb-6">
                    <div>
                      <span className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-2 block">Drawing Result</span>
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{currentResult.item.label}</h2>
                      {currentResult.item.tempo && (
                        <div className="inline-block mt-3 px-3 py-1 bg-neutral-800 rounded-sm">
                          <p className="text-amber-400 font-mono text-sm">{currentResult.item.tempo}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{currentResult.item.source}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-neutral-300 text-lg font-serif leading-relaxed">
                      {isLoadingAdvice ? (
                        <div className="flex items-center gap-3 py-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                          </div>
                          <span className="text-sm font-bold text-amber-500 uppercase tracking-wider">Analyzing...</span>
                        </div>
                      ) : (
                        <div className="relative pl-6">
                          <span className="absolute top-0 left-0 text-4xl text-neutral-700">&ldquo;</span>
                          <p className="italic">{currentResult.advice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Session History */}
        {history.length > 0 && (
          <section className="w-full max-w-6xl mt-24 pt-12 border-t border-neutral-800">
            <h3 className="text-center text-sm font-bold text-neutral-500 mb-8 uppercase tracking-[0.2em]">Session Log</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {history.map((res, index) => (
                <div key={res.timestamp} className="bg-neutral-900/50 border border-neutral-800 hover:border-amber-500/50 p-4 rounded-sm transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-neutral-600 font-mono">{new Date(res.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-[10px] text-amber-500/50 group-hover:text-amber-500 font-bold uppercase">#{history.length - index}</span>
                  </div>
                  <p className="text-sm font-bold text-neutral-300 group-hover:text-white truncate">{res.item.label}</p>
                  <p className="text-[10px] text-neutral-500 mt-1 truncate">{res.item.source}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
