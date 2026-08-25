import React, { useEffect, useState } from 'react';
import { Activity, Volume2, Mic } from 'lucide-react';

interface AudioWaveformVisualizerProps {
  isSpeaking: boolean;
  speakerRole?: 'agent' | 'lead' | 'devops' | 'system';
  isMuted?: boolean;
  barCount?: number;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isSpeaking,
  speakerRole = 'agent',
  isMuted = false,
  barCount = 14,
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 12)
  );

  useEffect(() => {
    let animId: number;
    let tick = 0;

    const updateFrequencies = () => {
      tick++;
      if (isMuted) {
        setFrequencies(Array.from({ length: barCount }, () => 6));
      } else if (isSpeaking) {
        // High energy harmonic wave
        const isAgent = speakerRole === 'agent';
        setFrequencies((prev) =>
          prev.map((_, i) => {
            const base = Math.sin(tick * 0.25 + i * 0.45) * 35;
            const jitter = Math.random() * 25;
            const centerPeak = Math.sin((i / (barCount - 1)) * Math.PI) * 30;
            return Math.min(95, Math.max(15, base + jitter + centerPeak));
          })
        );
      } else {
        // Ambient baseline breathing pulse
        setFrequencies((prev) =>
          prev.map((_, i) => {
            const base = Math.sin(tick * 0.08 + i * 0.5) * 8 + 12;
            return Math.max(8, base);
          })
        );
      }

      animId = requestAnimationFrame(updateFrequencies);
    };

    animId = requestAnimationFrame(updateFrequencies);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isMuted, speakerRole, barCount]);

  const barColor = isMuted
    ? '#6B6866'
    : isSpeaking
    ? speakerRole === 'agent'
      ? '#FF2E88'
      : '#22C55E'
    : '#A8537D';

  const glowShadow = isSpeaking
    ? speakerRole === 'agent'
      ? '0 0 8px rgba(255, 46, 136, 0.6)'
      : '0 0 8px rgba(34, 197, 94, 0.6)'
    : 'none';

  return (
    <div className="skeuo-screen-dark rounded-xl p-3 border border-[#2B2832] overflow-hidden select-none">
      {/* Header telemetry readout */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8A94] mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isMuted
                ? 'bg-gray-500'
                : isSpeaking
                ? speakerRole === 'agent'
                  ? 'bg-[#FF2E88] animate-ping'
                  : 'bg-emerald-400 animate-ping'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-semibold text-gray-200">
            {isMuted
              ? 'AUDIO MUTED'
              : isSpeaking
              ? speakerRole === 'agent'
                ? 'SRE-ZERO VOICE STREAM'
                : 'ENGINEER SPEECH INGRESS'
              : 'RTC FREQ ANALYZER'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>{isSpeaking ? (speakerRole === 'agent' ? '-14 dBFS' : '-18 dBFS') : '-42 dBFS'}</span>
          <span className="text-[#64606B]">48kHz/Opus</span>
        </div>
      </div>

      {/* 14-Bar Smoked Glass Equalizer Array */}
      <div className="flex items-end justify-between gap-1 h-12 px-1 pt-1 bg-black/40 rounded-lg border border-white/5">
        {frequencies.map((height, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col justify-end items-center h-full group"
          >
            <div
              className="w-full rounded-t-sm transition-all duration-75"
              style={{
                height: `${height}%`,
                backgroundColor: barColor,
                boxShadow: glowShadow,
                opacity: isSpeaking ? 0.95 : 0.45,
              }}
            />
          </div>
        ))}
      </div>

      {/* Frequency scale markers */}
      <div className="flex justify-between text-[8px] font-mono text-[#5C5863] mt-1.5 px-1 uppercase tracking-widest">
        <span>60Hz</span>
        <span>250Hz</span>
        <span>1kHz</span>
        <span>4kHz</span>
        <span>16kHz</span>
      </div>
    </div>
  );
};
