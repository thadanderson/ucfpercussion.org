"use client";
import React from 'react';
import { Shuffle, Repeat, Music2, ChevronDown, ChevronUp, Guitar, ListChecks } from 'lucide-react';
import { SubCategory, RepetitionOption } from './types';
import { ProgressionDef } from './progressions';

interface ControlsProps {
  repetition: RepetitionOption;
  setRepetition: (val: RepetitionOption) => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  currentSubCategory: SubCategory;
  currentPhraseIndex: number;
  onPhraseSelect: (index: number) => void;
  isBackingTrack: boolean;
  toggleBackingTrack: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenFilter: () => void;
  excludedIndices: number[];
  availableProgressions: ProgressionDef[];
  currentProgressionId: string;
  onProgressionSelect: (id: string) => void;
  progressionLoading: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  repetition, setRepetition, isShuffle, toggleShuffle,
  currentSubCategory, currentPhraseIndex, onPhraseSelect,
  isBackingTrack, toggleBackingTrack, isOpen, onToggle, onOpenFilter,
  excludedIndices, availableProgressions, currentProgressionId,
  onProgressionSelect, progressionLoading,
}) => {
  const cardBase = "flex flex-col rounded-xl border p-3 shadow-sm relative overflow-hidden transition-all duration-200 min-h-[100px]";
  const labelClass = "text-[10px] text-neutral-500 uppercase font-bold tracking-wider flex items-center gap-1.5 mb-1";
  const activeBtn = "bg-ucf-gold/20 border border-ucf-gold/50 text-ucf-gold";
  const inactiveBtn = "bg-neutral-800 border border-neutral-700 text-neutral-400 hover:border-neutral-600";

  return (
    <div className="flex-none bg-neutral-800 border-t border-neutral-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-20 flex flex-col transition-all duration-300 pb-[env(safe-area-inset-bottom)] mb-4">
      <div className="w-full flex items-center justify-between px-4 p-1 border-b border-neutral-700/50">
        <div onClick={onToggle}
          className="flex-1 flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors h-full"
          title={isOpen ? "Hide Controls" : "Show Controls"}>
          {isOpen ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronUp className="w-4 h-4 text-neutral-500" />}
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-2">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* 1. BACKING TRACK */}
            <div className={`${cardBase} bg-neutral-900 border-neutral-700 justify-between`}>
              <label className={labelClass}><Guitar className="w-3 h-3" /> Audio</label>
              <div className="flex flex-col gap-2 pt-1">
                <button onClick={toggleBackingTrack}
                  className={`w-full py-2 px-3 rounded-md font-bold text-xs flex items-center justify-between transition-all ${isBackingTrack ? activeBtn : inactiveBtn}`}>
                  <span>{isBackingTrack ? 'Band On' : 'Band Off'}</span>
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isBackingTrack ? 'bg-ucf-gold shadow-[0_0_8px_rgba(255,201,4,0.6)]' : 'bg-neutral-600'}`} />
                </button>
                {isBackingTrack && (
                  <select value={currentProgressionId} onChange={e => onProgressionSelect(e.target.value)}
                    disabled={progressionLoading}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-neutral-800 text-white text-xs font-medium rounded-md border border-neutral-600 p-2 focus:ring-1 focus:ring-ucf-gold appearance-none disabled:opacity-50">
                    {availableProgressions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* 2. REPEATS */}
            <div className={`${cardBase} bg-neutral-900 border-neutral-700 justify-between`}>
              <label className={labelClass}><Repeat className="w-3 h-3" /> Repeats</label>
              <div className="grid grid-cols-4 gap-1 h-full items-end pb-0.5">
                {([1, 2, 4, 8] as RepetitionOption[]).map((opt) => (
                  <button key={opt} onClick={() => setRepetition(opt)}
                    className={`flex flex-col items-center justify-center py-1.5 rounded transition-all ${repetition === opt
                      ? 'bg-ucf-gold text-black font-bold shadow-md ring-1 ring-ucf-gold/50'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700/50'}`}>
                    <span className="text-lg leading-none">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. MODE */}
            <div className={`${cardBase} bg-neutral-900 border-neutral-700 justify-between`}>
              <label className={labelClass}><Shuffle className="w-3 h-3" /> Mode</label>
              <div className="flex-1 flex flex-col justify-end pb-0.5">
                <button onClick={toggleShuffle}
                  className={`w-full py-2 px-3 rounded-md font-bold text-xs flex items-center justify-between transition-all ${isShuffle ? activeBtn : inactiveBtn}`}>
                  <span>{isShuffle ? 'Random' : 'Linear'}</span>
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isShuffle ? 'bg-ucf-gold shadow-[0_0_8px_rgba(255,201,4,0.6)]' : 'bg-neutral-600'}`} />
                </button>
              </div>
            </div>

            {/* 4. PHRASE SELECTOR */}
            <div className={`${cardBase} bg-neutral-900 border-neutral-700 justify-between`}>
              <label className={labelClass}><Music2 className="w-3 h-3" /> Phrase</label>
              <div className="flex-1 flex flex-col justify-end pb-0.5">
                <div className="flex">
                  <select value={currentPhraseIndex} onChange={(e) => onPhraseSelect(parseInt(e.target.value))}
                    style={{ colorScheme: 'dark' }}
                    className="flex-1 bg-neutral-800 text-white text-xs font-medium rounded-l-md border border-neutral-600 focus:ring-1 focus:ring-ucf-gold block w-full p-2 appearance-none truncate">
                    {currentSubCategory.phrases.map((p, idx) => (
                      <option key={p.id} value={idx}>{idx + 1}. {p.name}</option>
                    ))}
                  </select>
                  <button onClick={onOpenFilter}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 border-y border-r border-neutral-600 rounded-r-md flex items-center justify-center transition-colors relative"
                    title="Filter Cards">
                    <ListChecks className="w-4 h-4" />
                    {excludedIndices.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ucf-gold rounded-full border border-neutral-800" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
