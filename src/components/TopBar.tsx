import React from 'react';
import {
  Activity,
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Cpu,
  Zap,
} from 'lucide-react';
import { IncidentState, Participant } from '../types';

interface TopBarProps {
  stage: IncidentState;
  participants: Participant[];
  isVoiceActive: boolean;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onRunDemoScenario: () => void;
  onResetScenario: () => void;
  onStepNext: () => void;
  currentStepIndex: number;
  totalSteps: number;
  isAutoPlaying: boolean;
}

const STEPPER_STAGES: { num: string; key: IncidentState; label: string }[] = [
  { num: '01', key: 'INCIDENT', label: 'IDENTIFIED' },
  { num: '02', key: 'INVESTIGATING', label: 'INVESTIGATING' },
  { num: '03', key: 'MITIGATING', label: 'MITIGATING' },
  { num: '04', key: 'RESOLVED', label: 'RESOLVED' },
];

export const TopBar: React.FC<TopBarProps> = ({
  stage,
  participants,
  isVoiceActive,
  isAudioMuted,
  onToggleAudioMute,
  onRunDemoScenario,
  onResetScenario,
  onStepNext,
  currentStepIndex,
  totalSteps,
  isAutoPlaying,
}) => {
  return (
    <header className="h-16 border-b border-[#1A1A24] px-4 md:px-6 flex items-center justify-between bg-[#0C0C10]/90 backdrop-blur-md z-30 shrink-0">
      {/* Brand & Stepper */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#F472B6] rounded-full shadow-[0_0_8px_rgba(244,114,182,0.6)]"></div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-white font-sans">
            SRE<span className="text-[#F472B6] font-extrabold">-ZERO</span>
          </span>
        </div>

        <div className="hidden sm:block h-6 w-px bg-[#1A1A24] mx-1 md:mx-2"></div>

        {/* Stepper */}
        <div className="hidden md:flex gap-4 lg:gap-6 items-center">
          {STEPPER_STAGES.map((s) => {
            const isCurrent =
              stage === s.key ||
              (stage === 'HEALTHY' && s.key === 'RESOLVED');

            return (
              <div
                key={s.key}
                className={`flex items-center gap-1.5 transition-all ${
                  isCurrent ? '' : 'opacity-50 hover:opacity-80'
                }`}
              >
                <span
                  className={`text-[10px] font-mono ${
                    isCurrent ? 'text-[#F472B6] font-bold' : 'text-gray-400'
                  }`}
                >
                  {s.num}
                </span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isCurrent
                      ? 'text-white border-b-2 border-[#F472B6] pb-1'
                      : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Participant Avatars, Voice Active Pill, Demo Action Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Avatars stacked with -space-x-2 */}
        <div className="flex -space-x-2">
          {participants.map((p, idx) => (
            <div
              key={p.id}
              title={`${p.name} (${p.role}) ${p.isSpeaking ? '— Speaking' : ''}`}
              className={`w-8 h-8 rounded-full border-2 border-[#0A0A0D] flex items-center justify-center text-[10px] font-bold transition-all relative ${
                p.isAgent
                  ? 'bg-rose-500/80 text-white shadow-[0_0_8px_rgba(244,114,182,0.3)]'
                  : idx === 0
                  ? 'bg-gray-600 text-white'
                  : 'bg-indigo-600 text-white'
              } ${p.isSpeaking ? 'ring-2 ring-[#F472B6] scale-105 z-10' : ''}`}
            >
              <span>{p.isAgent ? 'AI' : p.name.split(' ').map(n => n[0]).join('')}</span>
              {p.isSpeaking && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F472B6] border border-[#0A0A0D]" />
              )}
            </div>
          ))}
        </div>

        {/* Voice Active Capsule */}
        <div className="flex items-center gap-2.5 bg-[#17141A] px-3 py-1.5 rounded-full border border-[#F472B6]/25 shadow-[0_0_12px_rgba(244,114,182,0.1)]">
          <div className="flex gap-0.5 items-end h-3">
            <div className="w-0.5 bg-[#F472B6] h-full audio-bar-1"></div>
            <div className="w-0.5 bg-[#F472B6] h-1/2 audio-bar-2"></div>
            <div className="w-0.5 bg-[#F472B6] h-3/4 audio-bar-3"></div>
            <div className="w-0.5 bg-[#F472B6] h-full audio-bar-4"></div>
          </div>
          <span className="text-xs font-mono text-gray-200 tracking-wide">
            {isVoiceActive ? 'VOICE ACTIVE' : 'AGORA RTC'}
          </span>

          <button
            onClick={onToggleAudioMute}
            title={isAudioMuted ? 'Unmute Web Speech Synthesizer' : 'Mute Speech Synthesizer'}
            className="text-gray-400 hover:text-[#F472B6] ml-0.5 transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#F472B6]" />}
          </button>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRunDemoScenario}
            disabled={isAutoPlaying}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              isAutoPlaying
                ? 'bg-[#F472B6]/20 border-[#F472B6]/50 text-[#FBCFE8] cursor-wait'
                : 'bg-rose-500/80 hover:bg-rose-500 text-white border-rose-400/50 shadow-[0_0_12px_rgba(244,114,182,0.25)] active:scale-95'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutoPlaying ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAutoPlaying ? 'Running...' : 'Run Demo'}</span>
          </button>

          <button
            onClick={onStepNext}
            title="Step to next scenario stage"
            className="flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-[#17141A] hover:bg-[#201C25] text-gray-300 border border-[#1A1A24] active:scale-95 transition-all cursor-pointer"
          >
            <span>Next</span>
            <span className="text-[10px] text-gray-500">({currentStepIndex + 1}/{totalSteps})</span>
          </button>

          <button
            onClick={onResetScenario}
            title="Reset Incident Scenario"
            className="p-1.5 rounded-lg bg-[#17141A] hover:bg-[#201C25] text-gray-400 hover:text-gray-200 border border-[#1A1A24] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

