import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  Radio,
  Sparkles,
  Send,
  CornerDownLeft,
  Volume2,
  ShieldAlert,
  Terminal,
  Zap,
  Activity,
  Flame,
  User,
  Bot,
} from 'lucide-react';
import { TranscriptTurn, Participant } from '../types';

interface VoiceTranscriptPanelProps {
  transcript: TranscriptTurn[];
  participants: Participant[];
  onSendVoicePrompt: (text: string, speakerRole: 'lead' | 'devops' | 'agent', isInterrupted?: boolean) => void;
  isAudioMuted: boolean;
  activeSpeakerId: string | null;
}

const QUICK_PROMPTS = [
  { text: "What's the current CPU load and error rate?", role: 'lead' as const, label: '📊 Query Metrics' },
  { text: 'Check recent commits pushed to main.', role: 'lead' as const, label: '🔍 Query Commits' },
  { text: 'Stop. Just check what changed in recent commits.', role: 'devops' as const, label: '⚡ Barge-in Interruption', isInterrupt: true },
  { text: 'Check whether that deployment is associated with the error.', role: 'lead' as const, label: '🚀 Check Deployment' },
  { text: 'Prepare a rollback.', role: 'lead' as const, label: '🛡️ Stage Rollback' },
  { text: 'Approve rollback execution to v2.14.2.', role: 'lead' as const, label: '✅ Approve Rollback' },
];

export const VoiceTranscriptPanel: React.FC<VoiceTranscriptPanelProps> = ({
  transcript,
  participants,
  onSendVoicePrompt,
  isAudioMuted,
  activeSpeakerId,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'lead' | 'devops'>('lead');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSendVoicePrompt(customInput.trim(), selectedRole);
    setCustomInput('');
  };

  return (
    <aside className="w-full h-full border-r border-[#1A1A24] flex flex-col bg-[#0C0C10]/60 relative overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#1A1A24] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold">
            Incident Voice War Room
          </span>
          <span className="text-xs text-gray-500 font-mono">#live-audio</span>
        </div>
        <span className="text-xs text-[#F472B6] font-mono font-bold animate-pulse flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F472B6]"></span>
          LIVE
        </span>
      </div>

      {/* Participants Quick Status */}
      <div className="px-4 py-2.5 border-b border-[#1A1A24] bg-[#0A0A0D]/60 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider shrink-0 font-medium">Speakers:</span>
        {participants.map((p) => {
          const isCurrentSpeaker = p.isSpeaking || activeSpeakerId === p.id;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all shrink-0 ${
                isCurrentSpeaker
                  ? 'bg-[#1D1620] border border-[#F472B6]/60 text-white shadow-[0_0_8px_rgba(244,114,182,0.2)]'
                  : 'bg-[#121014] border border-[#1A1A24] text-gray-300'
              }`}
            >
              <span className={p.isAgent ? 'text-[#F472B6] font-bold' : 'text-indigo-300 font-semibold'}>
                {p.isAgent ? '🤖 SRE-Zero' : p.name}
              </span>
              {isCurrentSpeaker && (
                <span className="w-2 h-2 rounded-full bg-[#F472B6] animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* Transcript List */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <Radio className="w-8 h-8 text-gray-500 mb-2.5 animate-pulse" />
            <p className="text-sm font-mono font-medium text-gray-300">Incident audio channel active.</p>
            <p className="text-xs text-gray-500 mt-1">Ready for voice instructions or automated triage...</p>
          </div>
        ) : (
          transcript.map((turn) => {
            const isAgent = turn.role === 'agent';
            const isInterrupted = turn.isInterrupted;

            if (isAgent) {
              return (
                <div
                  key={turn.id}
                  className="space-y-1.5 p-3.5 rounded-xl bg-[#17141A] border-l-4 border-[#F472B6] border-t border-r border-b border-[#1A1A24] shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[#F472B6] font-bold uppercase tracking-wider flex items-center gap-2">
                      <span>🤖 SRE-Zero (Agent)</span>
                      {turn.isSpeaking && (
                        <span className="flex gap-0.5 items-end h-2.5">
                          <span className="w-0.5 bg-[#F472B6] h-full audio-bar-1"></span>
                          <span className="w-0.5 bg-[#F472B6] h-3/4 audio-bar-2"></span>
                          <span className="w-0.5 bg-[#F472B6] h-1/2 audio-bar-3"></span>
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{turn.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-100 leading-relaxed font-sans font-medium">
                    {turn.text}
                  </p>
                  {turn.toolCallReferenceId && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-gray-300">
                      <Terminal className="w-3.5 h-3.5 text-[#F472B6]" />
                      <span className="text-[#F472B6] font-semibold">{turn.toolCallReferenceId}</span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={turn.id}
                className={`space-y-1.5 p-3 rounded-lg ${
                  isInterrupted ? 'bg-red-950/25 border-l-4 border-red-500 border-t border-r border-b border-red-500/20' : 'bg-[#121014] border border-[#1A1A24]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-indigo-300 font-bold uppercase">
                    {turn.avatar} {turn.speakerName} [{turn.timestamp}]
                  </span>
                  {isInterrupted && (
                    <span className="text-[10px] font-mono text-red-300 uppercase font-bold bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                      BARGE-IN
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-sans">
                  {turn.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Prompts & Spoken Inputs */}
      <div className="p-3 border-t border-[#1A1A24] bg-[#0C0C10] shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider font-semibold">
          <span className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-[#F472B6]" />
            Quick Voice Inquiries
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendVoicePrompt(prompt.text, prompt.role, prompt.isInterrupt)}
              className={`text-left p-2 rounded-lg border text-xs font-mono transition-all truncate hover:bg-white/5 active:scale-95 cursor-pointer ${
                prompt.isInterrupt
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-[#121014] border-[#1A1A24] text-gray-200 hover:text-white hover:border-[#F472B6]/40'
              }`}
              title={prompt.text}
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Custom Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-1">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as 'lead' | 'devops')}
            className="bg-[#121014] text-gray-200 border border-[#1A1A24] text-xs font-mono rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#F472B6] cursor-pointer"
          >
            <option value="lead">Alex (Lead)</option>
            <option value="devops">Sarah (DevOps)</option>
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Speak to SRE-Zero..."
              className="w-full bg-[#121014] text-gray-100 placeholder-gray-500 text-xs font-mono rounded-lg pl-3 pr-8 py-2 border border-[#1A1A24] focus:outline-none focus:border-[#F472B6]"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F472B6] disabled:opacity-30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};

