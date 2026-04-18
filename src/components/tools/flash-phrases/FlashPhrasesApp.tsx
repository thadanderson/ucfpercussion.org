"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, PanelLeft, Play, Square, Minus, Plus } from 'lucide-react';
import Sidebar, { ViewType } from './Sidebar';
import CardDisplay from './CardDisplay';
import Controls from './Controls';
import FilterModal from './FilterModal';
import { HomeView, GuideView, SourcesView } from './InfoViews';
import { DATA, getFirstSubCategory } from './data';
import { PlayState, RepetitionOption, SubCategory } from './types';
import { audioEngine } from './services/audioEngine';
import { ALL_PROGRESSION_DEFS } from './progressions';
import { loadMidiProgression } from './services/midiLoader';

export default function FlashPhrasesApp() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isControlsOpen, setControlsOpen] = useState(true);
  const [isFilterOpen, setFilterOpen] = useState(false);

  const [currentView, setCurrentView] = useState<ViewType>('HOME');
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory>(getFirstSubCategory());
  const [excludedCardIndices, setExcludedCardIndices] = useState<number[]>([]);

  const [playState, setPlayState] = useState<PlayState>(PlayState.STOPPED);
  const [tempo, setTempo] = useState<number>(100);
  const [repetition, setRepetition] = useState<RepetitionOption>(4);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isBackingTrack, setIsBackingTrack] = useState<boolean>(false);
  const [currentProgressionId, setCurrentProgressionId] = useState<string>('builtin-rock');
  const [progressionLoading, setProgressionLoading] = useState<boolean>(false);

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const [nextPhraseIndex, setNextPhraseIndex] = useState<number>(1);
  const [currentBarCount, setCurrentBarCount] = useState<number>(0);
  const [countInBeat, setCountInBeat] = useState<number>(0);
  const [countInBars, setCountInBars] = useState<number>(1);
  const [currentCountInBar, setCurrentCountInBar] = useState<number>(1);

  const stateRef = useRef({
    currentPhraseIndex, nextPhraseIndex, currentBarCount, countInBeat,
    repetition, isShuffle, phrasesLength: currentSubCategory.phrases.length,
    playState, excludedCardIndices, countInBars, currentCountInBar,
  });

  useEffect(() => {
    stateRef.current = {
      currentPhraseIndex, nextPhraseIndex, currentBarCount, countInBeat,
      repetition, isShuffle, phrasesLength: currentSubCategory.phrases.length,
      playState, excludedCardIndices, countInBars, currentCountInBar,
    };
  }, [currentPhraseIndex, nextPhraseIndex, currentBarCount, countInBeat, repetition,
      isShuffle, currentSubCategory, playState, excludedCardIndices, countInBars, currentCountInBar]);

  // Lock body scroll while this full-height tool is mounted (prevents footer from being visible)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Persist count-in preference
  useEffect(() => {
    const saved = localStorage.getItem('flash-phrases-count-in');
    if (saved) {
      const parsed = parseInt(saved, 10);
      setCountInBars(parsed > 0 ? parsed : 1);
    }
  }, []);

  const handleSetCountIn = (bars: number) => {
    setCountInBars(bars);
    localStorage.setItem('flash-phrases-count-in', bars.toString());
  };

  // Persist per-subcategory filter
  useEffect(() => {
    const saved = localStorage.getItem(`flash-phrases-filter-${currentSubCategory.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExcludedCardIndices(parsed.filter((i: number) => i >= 0 && i < currentSubCategory.phrases.length));
        }
      } catch { setExcludedCardIndices([]); }
    } else {
      setExcludedCardIndices([]);
    }
  }, [currentSubCategory]);

  const saveExclusions = (indices: number[]) => {
    setExcludedCardIndices(indices);
    localStorage.setItem(`flash-phrases-filter-${currentSubCategory.id}`, JSON.stringify(indices));
  };

  // Navigation helpers
  const getNextSeq = (cur: number, len: number, excl: number[]) => {
    let idx = (cur + 1) % len; let att = 0;
    while (excl.includes(idx) && att < len) { idx = (idx + 1) % len; att++; }
    return idx;
  };
  const getPrevSeq = (cur: number, len: number, excl: number[]) => {
    let idx = (cur - 1 + len) % len; let att = 0;
    while (excl.includes(idx) && att < len) { idx = (idx - 1 + len) % len; att++; }
    return idx;
  };
  const getRandom = (cur: number, len: number, excl: number[]) => {
    const avail = Array.from({ length: len }, (_, i) => i).filter(i => !excl.includes(i) && i !== cur);
    return avail.length === 0 ? cur : avail[Math.floor(Math.random() * avail.length)];
  };

  const handleBeat = useCallback((beatNumber: number) => {
    let activePlayState = stateRef.current.playState;

    if (activePlayState === PlayState.COUNT_IN) {
      if (beatNumber === 0 && stateRef.current.countInBeat === 4) {
        const { currentCountInBar, countInBars } = stateRef.current;
        if (currentCountInBar < countInBars) {
          setCurrentCountInBar(currentCountInBar + 1);
          setCountInBeat(1);
        } else {
          setPlayState(PlayState.PLAYING);
          setCountInBeat(0);
          activePlayState = PlayState.PLAYING;
        }
      }
      setCountInBeat(beatNumber + 1);
    }

    if (activePlayState === PlayState.PLAYING) {
      if (beatNumber === 0) {
        const { currentBarCount, repetition, phrasesLength, isShuffle, nextPhraseIndex, excludedCardIndices } = stateRef.current;
        const newBarCount = currentBarCount + 1;
        if (newBarCount > repetition) {
          const newCurrent = nextPhraseIndex;
          const newNext = isShuffle
            ? getRandom(newCurrent, phrasesLength, excludedCardIndices)
            : getNextSeq(newCurrent, phrasesLength, excludedCardIndices);
          setCurrentPhraseIndex(newCurrent);
          setNextPhraseIndex(newNext);
          setCurrentBarCount(1);
        } else {
          setCurrentBarCount(newBarCount);
        }
      }
    }
  }, []);

  useEffect(() => {
    audioEngine.onBeat = handleBeat;
    return () => { audioEngine.onBeat = null; };
  }, [handleBeat]);

  const currentStyle = currentSubCategory.id.startsWith('rf') ? 'rock-funk' : 'swing' as const;
  const availableProgressions = ALL_PROGRESSION_DEFS.filter(p => p.style === currentStyle);

  useEffect(() => { audioEngine.setTempo(tempo); }, [tempo]);
  useEffect(() => { audioEngine.setBackingTrack(isBackingTrack); }, [isBackingTrack]);
  useEffect(() => { audioEngine.setStyle(currentStyle); }, [currentSubCategory]);  // eslint-disable-line

  useEffect(() => {
    const builtinId = currentStyle === 'rock-funk' ? 'builtin-rock' : 'builtin-swing';
    setCurrentProgressionId(builtinId);
    audioEngine.clearProgression();
  }, [currentSubCategory]);  // eslint-disable-line

  useEffect(() => {
    const def = ALL_PROGRESSION_DEFS.find(p => p.id === currentProgressionId);
    if (!def || def.source === 'builtin') { audioEngine.clearProgression(); return; }
    let cancelled = false;
    setProgressionLoading(true);
    loadMidiProgression(`/midi/${def.midiFile}`).then(result => {
      if (cancelled) return;
      if (!result) {
        setCurrentProgressionId(currentStyle === 'rock-funk' ? 'builtin-rock' : 'builtin-swing');
        audioEngine.clearProgression();
      } else {
        audioEngine.setProgression(result.events, result.loopBeats);
      }
      setProgressionLoading(false);
    });
    return () => { cancelled = true; setProgressionLoading(false); };
  }, [currentProgressionId]);  // eslint-disable-line

  const stopPlayback = () => {
    setPlayState(PlayState.STOPPED);
    setCountInBeat(0); setCurrentBarCount(0);
    audioEngine.stop();
  };

  const handlePhraseSelect = useCallback((index: number) => {
    setCurrentPhraseIndex(index);
    setNextPhraseIndex(isShuffle
      ? getRandom(index, currentSubCategory.phrases.length, excludedCardIndices)
      : getNextSeq(index, currentSubCategory.phrases.length, excludedCardIndices));
    setCurrentBarCount(0);
  }, [isShuffle, currentSubCategory, excludedCardIndices]);

  const togglePlay = () => {
    if (playState === PlayState.STOPPED) {
      if (countInBars > 0) {
        setPlayState(PlayState.COUNT_IN);
        setCurrentCountInBar(1);
        setCountInBeat(1);
      } else {
        setPlayState(PlayState.PLAYING);
        setCountInBeat(0);
      }
      setCurrentBarCount(0);
      const next = isShuffle
        ? getRandom(currentPhraseIndex, currentSubCategory.phrases.length, excludedCardIndices)
        : getNextSeq(currentPhraseIndex, currentSubCategory.phrases.length, excludedCardIndices);
      setNextPhraseIndex(next);
      audioEngine.start(countInBars);
    } else {
      stopPlayback();
    }
  };

  const handleSubCategorySelect = (sub: SubCategory) => {
    stopPlayback();
    setCurrentSubCategory(sub);
    setCurrentPhraseIndex(0);
    setNextPhraseIndex(sub.phrases.length > 1 ? 1 : 0);
    setCurrentView('APP');
  };

  const handleViewSelect = (view: ViewType) => {
    if (view !== 'APP') stopPlayback();
    setCurrentView(view);
  };

  const handleNextPhrase = useCallback(() => {
    const len = currentSubCategory.phrases.length;
    if (len - excludedCardIndices.length <= 1) return;
    handlePhraseSelect(getNextSeq(currentPhraseIndex, len, excludedCardIndices));
  }, [currentPhraseIndex, currentSubCategory, excludedCardIndices, handlePhraseSelect]);

  const handlePrevPhrase = useCallback(() => {
    const len = currentSubCategory.phrases.length;
    if (len - excludedCardIndices.length <= 1) return;
    handlePhraseSelect(getPrevSeq(currentPhraseIndex, len, excludedCardIndices));
  }, [currentPhraseIndex, currentSubCategory, excludedCardIndices, handlePhraseSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'APP') return;
      if (e.key === 'ArrowRight') handleNextPhrase();
      else if (e.key === 'ArrowLeft') handlePrevPhrase();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleNextPhrase, handlePrevPhrase]);

  const toggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    if (playState === PlayState.STOPPED) {
      setNextPhraseIndex(next
        ? getRandom(currentPhraseIndex, currentSubCategory.phrases.length, excludedCardIndices)
        : getNextSeq(currentPhraseIndex, currentSubCategory.phrases.length, excludedCardIndices));
    }
  };

  // Re-sync if current phrase becomes excluded
  useEffect(() => {
    if (excludedCardIndices.includes(currentPhraseIndex)) {
      const len = currentSubCategory.phrases.length;
      if (len - excludedCardIndices.length > 0) {
        handlePhraseSelect(getNextSeq(currentPhraseIndex, len, excludedCardIndices));
      }
    }
  }, [excludedCardIndices, currentPhraseIndex, currentSubCategory, handlePhraseSelect]);

  const isPlaying = playState !== PlayState.STOPPED;

  return (
    <div className="relative flex bg-black text-white font-sans overflow-hidden" style={{ height: 'calc(100dvh - 64px)' }}>
      <Sidebar
        currentSubCategory={currentSubCategory}
        onSelectSubCategory={handleSubCategorySelect}
        currentView={currentView}
        onSelectView={handleViewSelect}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col relative w-full h-full min-w-0 transition-all duration-300">
        {/* Mobile header */}
        <div className="md:hidden flex items-center p-4 border-b border-neutral-800 bg-neutral-950 z-10 shrink-0 justify-between">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-neutral-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-2 text-lg font-bold text-ucf-gold truncate max-w-[150px]">Flash Phrases</h1>
          </div>
          {currentView === 'APP' && (
            <button onClick={togglePlay}
              className={`p-2 rounded-full ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          )}
        </div>

        {!isSidebarOpen && (
          <button onClick={() => setSidebarOpen(true)}
            className="hidden md:flex absolute top-4 left-4 z-20 bg-neutral-800 text-neutral-300 p-2 rounded-md hover:text-white hover:bg-neutral-700 shadow-lg border border-neutral-700"
            title="Open Menu">
            <PanelLeft className="w-6 h-6" />
          </button>
        )}

        {currentView === 'APP' ? (
          <>
            <div className="flex-1 overflow-hidden relative bg-black">
              <CardDisplay
                currentPhrase={currentSubCategory.phrases[currentPhraseIndex]}
                nextPhrase={currentSubCategory.phrases[nextPhraseIndex]}
                playState={playState}
                countInBeat={countInBeat}
                countInBars={countInBars}
                currentCountInBar={currentCountInBar}
                onNext={handleNextPhrase}
                onPrev={handlePrevPhrase}
              />

              {/* Desktop top-left controls */}
              <div className={`absolute top-4 transition-all duration-300 z-10 hidden md:flex gap-3 ${isSidebarOpen ? 'left-4' : 'left-16'}`}>
                <button onClick={togglePlay}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-md border transition-all active:scale-95 ${isPlaying
                    ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-100'
                    : 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30 text-green-100'}`}>
                  <div className={`p-1 rounded-full ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </div>
                  <span className="font-bold uppercase tracking-wide text-sm w-12">{isPlaying ? 'Stop' : 'Start'}</span>
                </button>

                <div className="flex items-center gap-2 bg-neutral-800/80 backdrop-blur-md border border-neutral-700 rounded-lg px-3 py-2 shadow-lg">
                  <button onClick={() => setTempo(Math.max(40, tempo - 5))} className="p-1 text-neutral-400 hover:text-white">
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-center w-16">
                    <span className="text-xl font-mono font-black text-ucf-gold leading-none block">{tempo}</span>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase">BPM</span>
                  </div>
                  <button onClick={() => setTempo(Math.min(240, tempo + 5))} className="p-1 text-neutral-400 hover:text-white">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col justify-center bg-neutral-800/80 backdrop-blur-md border border-neutral-700 rounded-lg px-2 py-1 shadow-lg">
                  <label className="text-[8px] text-neutral-500 font-bold uppercase text-center mb-0.5">Count-in</label>
                  <select value={countInBars} onChange={(e) => handleSetCountIn(parseInt(e.target.value))}
                    style={{ colorScheme: 'dark' }} className="bg-transparent text-ucf-gold font-bold text-xs focus:outline-none cursor-pointer text-center appearance-none">
                    <option value={1}>1 Bar</option>
                    <option value={2}>2 Bars</option>
                    <option value={4}>4 Bars</option>
                  </select>
                </div>
              </div>

              {/* Bar counter */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-3 rounded-xl shadow-xl text-right min-w-[120px]">
                  <h1 className="text-neutral-300 tracking-tight opacity-80 uppercase text-xs mb-1 font-bold">{currentSubCategory.name}</h1>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-sm font-bold text-neutral-400 uppercase">Bar</span>
                    <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                      {playState === PlayState.PLAYING && currentBarCount > 0 ? currentBarCount : 1}
                      <span className="text-neutral-500 text-2xl">/</span>
                      <span className="text-neutral-400 text-3xl">{repetition}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Controls
              repetition={repetition} setRepetition={setRepetition}
              isShuffle={isShuffle} toggleShuffle={toggleShuffle}
              currentSubCategory={currentSubCategory}
              currentPhraseIndex={currentPhraseIndex} onPhraseSelect={handlePhraseSelect}
              isBackingTrack={isBackingTrack} toggleBackingTrack={() => setIsBackingTrack(!isBackingTrack)}
              isOpen={isControlsOpen} onToggle={() => setControlsOpen(!isControlsOpen)}
              onOpenFilter={() => setFilterOpen(true)}
              excludedIndices={excludedCardIndices}
              availableProgressions={availableProgressions}
              currentProgressionId={currentProgressionId}
              onProgressionSelect={setCurrentProgressionId}
              progressionLoading={progressionLoading}
            />

            <FilterModal
              isOpen={isFilterOpen} onClose={() => setFilterOpen(false)}
              onSave={(indices) => { saveExclusions(indices); setFilterOpen(false); }}
              phrases={currentSubCategory.phrases}
              excludedIndices={excludedCardIndices}
            />
          </>
        ) : (
          <div className="flex-1 bg-black overflow-hidden flex flex-col">
            {currentView === 'HOME' && <HomeView />}
            {currentView === 'GUIDE' && <GuideView />}
            {currentView === 'SOURCES' && <SourcesView />}
          </div>
        )}
      </main>
    </div>
  );
}
