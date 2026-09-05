import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, SkipForward, SkipBack, Music } from 'lucide-react';
import { DhammaTalk } from '../types';

interface ZenAudioPlayerProps {
  currentTalk: DhammaTalk | null;
  onClose: () => void;
}

export const ZenAudioPlayer: React.FC<ZenAudioPlayerProps> = ({
  currentTalk,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!currentTalk) return;
    setIsPlaying(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.5;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTalk]);

  if (!currentTalk) return null;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff8f5]/95 backdrop-blur-md border-t border-[#dbc1b4] shadow-2xl transition-all duration-300">
      {/* Progress Bar (Saffron Accent) */}
      <div 
        className="w-full bg-[#fceae2] h-1.5 cursor-pointer relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newPct = (clickX / rect.width) * 100;
          setProgress(Math.max(0, Math.min(100, newPct)));
        }}
      >
        <div
          className="h-full bg-[#b35c1e] transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#703100] rounded-full shadow-xs" />
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Track Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#fceae2] border border-[#dbc1b4]/40 flex items-center justify-center text-[#703100] shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#231a15] truncate">
              {currentTalk.title}
            </h4>
            <p className="text-[11px] text-[#554339] truncate">
              {currentTalk.speaker} • {currentTalk.paliTitle}
            </p>
          </div>
        </div>

        {/* Center: Play/Pause Controls (Forest Green #2d4739) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setProgress((p) => Math.max(0, p - 10))}
            className="text-[#554339] hover:text-[#703100] p-1.5 transition-colors"
            title="Rewind 10s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#2d4739] text-white flex items-center justify-center hover:bg-[#1f3228] active:scale-95 shadow-xs transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => setProgress((p) => Math.min(100, p + 10))}
            className="text-[#554339] hover:text-[#703100] p-1.5 transition-colors"
            title="Forward 10s"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-[#554339] hover:text-[#703100] p-1.5 transition-colors hidden sm:block"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#554339] hover:text-[#ba1a1a] rounded-full hover:bg-[#f7e5dc] transition-colors"
            title="Close Audio Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
