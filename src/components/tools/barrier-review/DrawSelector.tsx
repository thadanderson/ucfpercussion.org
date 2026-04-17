"use client";

import React, { useState, useEffect, useRef } from "react";
import { RouletteItem } from "./types";
import { soundService } from "./soundService";

interface DrawSelectorProps {
  items: RouletteItem[];
  onSpinEnd: (item: RouletteItem) => void;
  hideResult?: boolean;
}

const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const REPEAT_COUNT = 30;

const SPEED_OPTIONS = [
  { id: "blitz", label: "0.8s", duration: 800, flavor: "Blitz" },
  { id: "rapid", label: "2.5s", duration: 2500, flavor: "Rapid" },
  { id: "normal", label: "4.5s", duration: 4500, flavor: "Normal" },
  { id: "slow", label: "8.0s", duration: 8000, flavor: "Slow" },
  { id: "epic", label: "15.0s", duration: 15000, flavor: "Epic" },
];

const DrawSelector: React.FC<DrawSelectorProps> = ({ items, onSpinEnd, hideResult = false }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [stripOffset, setStripOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState(SPEED_OPTIONS[2]);
  const tickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stripItems = React.useMemo(() => {
    if (items.length === 0) return [];
    const arr: RouletteItem[] = [];
    for (let i = 0; i < REPEAT_COUNT; i++) arr.push(...items);
    return arr;
  }, [items]);

  const startTicking = (duration: number) => {
    if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
    const startTime = Date.now();
    const playNextTick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      if (progress >= 1) return;
      soundService.playTick();
      const currentDelay = 30 + progress * progress * 400;
      tickTimeoutRef.current = setTimeout(playNextTick, currentDelay);
    };
    playNextTick();
  };

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    soundService.playClick();
    setIsSpinning(true);
    setWinningIndex(null);
    setTransitionEnabled(false);
    setStripOffset(0);
    setTimeout(() => {
      const randomOffset = Math.floor(Math.random() * items.length);
      const targetSetIndex = REPEAT_COUNT - 2;
      const totalIndex = targetSetIndex * items.length + randomOffset;
      const viewportHalf = (VISIBLE_ITEMS * ITEM_HEIGHT) / 2;
      const itemHalf = ITEM_HEIGHT / 2;
      const targetPixel = totalIndex * ITEM_HEIGHT - viewportHalf + itemHalf;
      startTicking(selectedSpeed.duration);
      setTransitionEnabled(true);
      setStripOffset(targetPixel);
      setTimeout(() => {
        setIsSpinning(false);
        setWinningIndex(totalIndex);
        if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
        onSpinEnd(items[randomOffset]);
      }, selectedSpeed.duration);
    }, 50);
  };

  useEffect(() => {
    return () => { if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current); };
  }, []);

  useEffect(() => {
    setTransitionEnabled(false);
    setStripOffset(0);
    setWinningIndex(null);
  }, [items]);

  const isDisabled = isSpinning || items.length === 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="relative w-full bg-neutral-900 rounded-lg border-4 border-ucf-gold shadow-[0_0_50px_rgba(255,201,4,0.15)] overflow-hidden">
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-neutral-700 z-20" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neutral-700 z-20" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-neutral-700 z-20" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-neutral-700 z-20" />

        <div className="relative w-full bg-black flex items-center justify-center" style={{ height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px` }}>
          {items.length === 0 && (
            <div className="text-neutral-600 font-bold uppercase tracking-widest text-sm text-center px-4">
              Pool Empty<br /><span className="text-[10px] text-neutral-700 normal-case">Select items in configuration</span>
            </div>
          )}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10 border-y-2 border-ucf-gold/50 bg-ucf-gold/10 pointer-events-none shadow-[0_0_30px_rgba(255,201,4,0.2)]" style={{ height: `${ITEM_HEIGHT}px` }}>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-ucf-gold border-y-[6px] border-y-transparent" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-r-[8px] border-r-ucf-gold border-y-[6px] border-y-transparent" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

          {/* Drawing Mode overlay — hazy while spinning, sealed when stopped */}
          {hideResult && isSpinning && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 pointer-events-none"
              style={{ backdropFilter: "blur(12px) brightness(0.45)" }}>
              {/* Animated pulse ring */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full border-2 border-ucf-gold/40 animate-ping" />
                <div className="w-10 h-10 rounded-full border-2 border-ucf-gold/60 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-ucf-gold/80 animate-pulse" />
                </div>
              </div>
              <p className="text-ucf-gold/60 text-[10px] font-black uppercase tracking-[0.25em] animate-pulse">
                Drawing…
              </p>
            </div>
          )}
          {hideResult && !isSpinning && winningIndex !== null && (
            <div className="absolute inset-0 z-20 bg-neutral-900/96 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
              <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Result Sealed</p>
            </div>
          )}
          {items.length > 0 && (
            <div
              className="w-full will-change-transform absolute top-0 left-0"
              style={{ transform: `translateY(-${stripOffset}px)`, transition: transitionEnabled ? `transform ${selectedSpeed.duration}ms cubic-bezier(0.1, 0.7, 0.1, 1)` : "none" }}
            >
              {stripItems.map((item, index) => {
                const isWinner = winningIndex === index;
                return (
                  <div key={`${item.id}-${index}`} className="w-full flex items-center justify-center px-4 text-center border-b border-neutral-900/50" style={{ height: `${ITEM_HEIGHT}px` }}>
                    <span className={`text-lg md:text-2xl font-bold uppercase tracking-wider transition-all duration-500 ${isWinner ? "text-ucf-gold scale-110 drop-shadow-[0_0_10px_rgba(255,201,4,0.8)]" : "text-neutral-600 blur-[0.5px]"}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-end px-1">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Draw Duration</span>
          <span className="text-[10px] text-ucf-gold font-bold uppercase tracking-widest">{selectedSpeed.flavor}</span>
        </div>
        <div className="flex bg-neutral-900/80 p-1 rounded-sm border border-neutral-800">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { if (!isSpinning) { soundService.playClick(); setSelectedSpeed(opt); } }}
              disabled={isSpinning}
              className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${selectedSpeed.id === opt.id ? "bg-ucf-gold text-black shadow-[0_0_10px_rgba(255,201,4,0.3)]" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"} ${isSpinning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isDisabled}
        className={`relative w-full group overflow-hidden px-8 py-5 rounded-sm text-lg font-black uppercase tracking-[0.2em] transition-all duration-200 ${isDisabled ? "bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800" : "bg-ucf-gold hover:bg-ucf-gold/90 text-black cursor-pointer shadow-[0_0_30px_rgba(255,201,4,0.4)] border border-ucf-gold/70"}`}
      >
        <span className="relative z-10">{isSpinning ? "Reviewing..." : items.length === 0 ? "Pool Empty" : "Initiate Draw"}</span>
        {!isDisabled && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />}
      </button>

      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
};

export default DrawSelector;
