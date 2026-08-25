import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Radio,
  Sparkles,
  Terminal,
  Volume2,
  Users,
  AlertTriangle,
  Flame,
  Zap,
  CornerDownLeft,
} from 'lucide-react';
import { Participant, TranscriptTurn } from '../types';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { voiceService } from '../services/speechSynthesis';

interface ConversationPanelProps {
  participants: Participant[];
  transcript: TranscriptTurn[];
  activeSpeakerId: string | null;
  onSendVoicePrompt: (text: string, role: 'lead' | 'devops' | 'agent', isInterrupt?: boolean) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const TACTILE_ROCKER_PROMPTS = [
  { text: "What's the blast radius of this outage?", role: 'lead' as const, label: '💥 Blast Radius' },
  { text: 'Show recent commits on frontend-service', role: 'devops' as const, isInterrupt: true, label: '🔍 Git AST Blame' },
  { text: 'Why is CPU spiking on us-central1?', role: 'lead' as const, label: '⚡ Cluster CPU' },
  { text: 'Execute zero-downtime rollback', role: 'lead' as const, label: '🛡️ Stage Rollback' },
];

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  participants,
  transcript,
  activeSpeakerId,
  onSendVoicePrompt,
  isMuted,
  onToggleMute,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'lead' | 'devops'>('lead');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeSpeaker = participants.find(
    (p) => p.isSpeaking || activeSpeakerId === p.id
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);
        if (final.trim()) {
          // Barge in immediately and dispatch
          voiceService.stop();
          onSendVoicePrompt(final.trim(), selectedRole, true);
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedRole, onSendVoicePrompt]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Fallback simulated voice prompt
      onSendVoicePrompt("What's causing this 502 spike? Check cluster metrics.", selectedRole);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Barge-in: cut off any speaking agent
        voiceService.stop();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSendVoicePrompt(customInput.trim(), selectedRole);
    setCustomInput('');
  };

  return (
    <div className="flex flex-col h-full skeuo-panel rounded-2xl border border-[#DCD7CE] overflow-hidden shadow-sm font-sans select-none">
      {/* Panel Top Hardware Bar */}
      <div className="px-3.5 py-2.5 border-b border-[#DCD7CE] skeuo-chassis flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="skeuo-screw-sm" />
          <Radio className="w-3.5 h-3.5 text-[#9B4D73]" />
          <span className="font-bold text-xs text-[#181717] tracking-tight uppercase">
            Transceiver & Voice Stream
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg skeuo-well text-[10px] font-mono text-[#5C5852]">
            <Users className="w-3 h-3 text-[#7A756D]" />
            <span className="font-semibold">{participants.length} Active</span>
          </div>

          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#9B4D73] bg-[#FAF5F7] px-2 py-0.5 rounded-md border border-[#F2D6E3]">
            <span className="skeuo-led-plum animate-pulse" />
            WAR-ROOM
          </span>
        </div>
      </div>

      {/* 14-Bar Smoked-Glass Equalizer Spectrum Analyzer */}
      <div className="p-2.5 border-b border-[#E2DFDA] bg-[#F7F6F2] shrink-0">
        <AudioWaveformVisualizer
          isSpeaking={Boolean(activeSpeaker?.isSpeaking || isListening)}
          speakerRole={isListening ? selectedRole : activeSpeaker?.role || 'agent'}
          isMuted={isMuted}
          barCount={14}
        />
      </div>

      {/* Debossed Message Feed */}
      <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 skeuo-well">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B6866]">
            <Radio className="w-8 h-8 text-[#A8A4A0] mb-2 animate-pulse" />
            <p className="text-xs font-bold text-[#181717] uppercase tracking-wide">Transceiver Connected</p>
            <p className="text-[11px] text-[#7A756D] mt-1 max-w-xs leading-relaxed">
              SRE-Zero autonomous voice transceiver ready. Speak via Push-to-Talk or select a tactical prompt rocker below.
            </p>
          </div>
        ) : (
          transcript.map((turn) => {
            const isAgent = turn.role === 'agent';
            const isInterrupted = turn.isInterrupted;

            if (isAgent) {
              return (
                <div
                  key={turn.id}
                  className="flex items-start gap-2.5 max-w-[94%]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#181717] text-white flex items-center justify-center shrink-0 text-xs shadow-xs font-mono font-bold border border-white/20">
                    S0
                  </div>
                  <div className="skeuo-panel rounded-xl p-3 space-y-1.5 shadow-xs border border-[#DCD7CE]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono font-bold text-[#9B4D73] flex items-center gap-1.5">
                        <span>🤖 SRE-Zero (Agent)</span>
                        {turn.isSpeaking && (
                          <span className="flex gap-0.5 items-end h-2.5">
                            <span className="w-0.5 bg-[#9B4D73] h-full audio-bar-1" />
                            <span className="w-0.5 bg-[#9B4D73] h-3/4 audio-bar-2" />
                            <span className="w-0.5 bg-[#9B4D73] h-1/2 audio-bar-3" />
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A857D]">{turn.timestamp}</span>
                    </div>

                    <p className="text-xs text-[#181717] leading-relaxed select-text">
                      {turn.text}
                    </p>

                    {turn.toolCallReferenceId && (
                      <div className="pt-1 flex items-center gap-1.5 text-xs font-mono">
                        <Terminal className="w-3.5 h-3.5 text-[#9B4D73]" />
                        <span className="text-[#9B4D73] font-semibold bg-[#F5E9EF] px-1.5 py-0.5 rounded border border-[#ECD1DF]">
                          {turn.toolCallReferenceId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Engineer Message (Right-aligned)
            return (
              <div key={turn.id} className="flex flex-col items-end">
                <div
                  className={`max-w-[90%] rounded-xl p-3 space-y-1 shadow-xs border ${
                    isInterrupted
                      ? 'bg-[#FDE8E8] border-[#FBD5D5] text-[#9B1C1C]'
                      : 'bg-[#F5E9EF] border-[#ECD1DF] text-[#181717]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-[#9B4D73] flex items-center gap-1">
                      <span>{turn.avatar}</span>
                      <span>{turn.speakerName}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-semibold bg-white/70 text-[#7A756D] px-1.5 py-0.2 rounded border border-black/5">
                        VOICE
                      </span>
                      {isInterrupted && (
                        <span className="text-[9px] font-mono font-bold bg-[#9B1C1C] text-white px-1.5 py-0.2 rounded">
                          BARGE-IN
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#7A756D]">{turn.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#181717] leading-relaxed select-text">
                    {turn.text}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Interim Speech Transcription Bubble when User is Speaking */}
        {isListening && interimTranscript && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 shadow-xs animate-pulse">
            <Mic className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span className="font-semibold">Transcribing: "{interimTranscript}"</span>
          </div>
        )}
      </div>

      {/* Tactile Voice Prompt Rockers */}
      <div className="px-3 py-2 bg-[#F7F6F2] border-t border-[#E2DFDA] overflow-x-auto flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-mono text-[#8A857D] uppercase tracking-wider shrink-0 font-bold mr-0.5">
          Tactile Prompts:
        </span>
        {TACTILE_ROCKER_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendVoicePrompt(prompt.text, prompt.role, prompt.isInterrupt)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all shrink-0 cursor-pointer shadow-2xs ${
              prompt.isInterrupt
                ? 'bg-[#FDE8E8] border-[#FBC5C5] text-[#9B1C1C] hover:bg-[#FCD2D2]'
                : 'skeuo-btn text-[#181717]'
            }`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Debossed Command Input Well & PTT Push Button */}
      <div className="p-2.5 skeuo-panel border-t border-[#DCD7CE] flex items-center gap-2 shrink-0">
        {/* Heavy PTT Mic Switch */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
            isListening
              ? 'bg-[#E02424] text-white shadow-[0_0_10px_rgba(224,36,36,0.6)] animate-pulse'
              : 'skeuo-btn-plum'
          }`}
          title={isListening ? 'Stop Speech Recognition' : 'Push-to-Talk (Hold or Click to Speak)'}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-ping' : ''}`} />
          <span className="hidden sm:inline">{isListening ? 'LISTENING' : 'PTT'}</span>
        </button>

        {/* Role Selector */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as 'lead' | 'devops')}
          className="skeuo-well text-[#181717] border border-[#CCC6BC] text-xs font-mono rounded-lg px-2 py-2 focus:outline-none focus:border-[#9B4D73] cursor-pointer font-medium"
        >
          <option value="lead">Alex Rivera (Lead)</option>
          <option value="devops">Sarah Chen (DevOps)</option>
        </select>

        {/* Command Input Box */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type SRE prompt or speak via PTT..."
            className="flex-1 skeuo-well border border-[#CCC6BC] rounded-lg px-3 py-2 text-xs font-mono text-[#181717] placeholder-[#8A857D] focus:outline-none focus:border-[#9B4D73]"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="skeuo-btn-dark rounded-lg p-2 disabled:opacity-35 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

