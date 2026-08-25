import React, { useState } from 'react';
import { X, Radio, Volume2, Mic, Sliders, ShieldCheck, Check, Info } from 'lucide-react';

interface AgoraSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AgoraSettingsModal: React.FC<AgoraSettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
}) => {
  const [appId, setAppId] = useState('demo-agora-rtc-incident-room-us');
  const [apiKey, setApiKey] = useState('agora-ai-live-voice-token-****');
  const [agentId, setAgentId] = useState('sre-zero-voice-agent');
  const [channelName, setChannelName] = useState('sre-zero-war-room-01');
  const [voiceModel, setVoiceModel] = useState('Agora Conversational AI (Real-Time Voice)');
  const [sampleRate, setSampleRate] = useState('48000 Hz (Opus High Fidelity)');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [bargeInSensitivity, setBargeInSensitivity] = useState('Aggressive (Sub-100ms Interrupt)');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl skeuo-panel rounded-2xl border border-[#DCD7CE] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Hardware Chassis */}
        <div className="p-4 sm:p-5 border-b border-[#DCD7CE] flex justify-between items-center skeuo-chassis">
          <div className="flex items-center gap-2.5">
            <div className="skeuo-screw-sm" />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] text-white flex items-center justify-center border border-[#45423E] shadow-inner">
              <Radio className="w-4 h-4 text-[#FF80BF]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#181717] font-mono uppercase tracking-wide">
                Agora AI Voice Assistant Calibration
              </h3>
              <p className="text-xs font-mono text-[#7A756D]">
                Sub-100ms Conversational Voice RTC Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl skeuo-btn text-[#7A756D] hover:text-[#181717] transition-colors cursor-pointer active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono skeuo-well">
          <div className="skeuo-panel p-3.5 rounded-xl border border-[#DCD7CE] flex items-start gap-2.5 shadow-sm">
            <Info className="w-4 h-4 text-[#9B4D73] shrink-0 mt-0.5" />
            <p className="text-[#181717] leading-relaxed">
              SRE-Zero is driven by <strong>Agora AI Voice Assistant</strong> with bidirectional real-time audio streaming, instant barge-in voice interruption, and multi-speaker incident war-room orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">
                Agora App ID (AGORA_AI_APP_ID)
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">
                Voice Assistant API Key (AGORA_AI_API_KEY)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">
                Voice Agent ID (AGORA_AI_AGENT_ID)
              </label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">
                RTC Channel Name
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">
              AI Voice Assistant Model Pipeline
            </label>
            <select
              value={voiceModel}
              onChange={(e) => setVoiceModel(e.target.value)}
              className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2.5 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] cursor-pointer shadow-inner font-medium"
            >
              <option value="Agora Conversational AI (Real-Time Voice)">Agora Conversational AI (Real-Time Voice Engine)</option>
              <option value="Agora Voice-to-Voice Ultra-Low Latency">Agora Voice-to-Voice Ultra-Low Latency Bridge</option>
              <option value="Agora Multi-Speaker War-Room Mode">Agora Multi-Speaker SRE War-Room Mode</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">Audio Codec & Quality</label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(e.target.value)}
                className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] cursor-pointer shadow-inner font-medium"
              >
                <option value="48000 Hz (Opus High Fidelity)">48,000 Hz (Opus High Fidelity)</option>
                <option value="24000 Hz (Standard Voice)">24,000 Hz (Standard Bandwidth)</option>
                <option value="16000 Hz (Low Bandwidth)">16,000 Hz (Low Bandwidth Mobile)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">Barge-in Interruption</label>
              <select
                value={bargeInSensitivity}
                onChange={(e) => setBargeInSensitivity(e.target.value)}
                className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3 py-2 text-xs text-[#181717] focus:outline-none focus:border-[#9B4D73] cursor-pointer shadow-inner font-medium"
              >
                <option value="Aggressive (Sub-100ms Interrupt)">Aggressive (Sub-100ms Interrupt)</option>
                <option value="Standard Natural Cadence">Standard Natural Cadence (200ms)</option>
                <option value="Push-to-Talk Authoritative Only">Push-to-Talk Authoritative Only</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#DCD7CE] space-y-2.5">
            <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider">Hardware Voice Processors</label>
            
            <div className="flex items-center justify-between p-3 rounded-xl skeuo-panel border border-[#DCD7CE]">
              <span className="text-[#181717] font-semibold">AI Noise Suppression (AINS)</span>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="w-4 h-4 accent-[#9B4D73] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl skeuo-panel border border-[#DCD7CE]">
              <span className="text-[#181717] font-semibold">Acoustic Echo Cancellation (AEC)</span>
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
                className="w-4 h-4 accent-[#9B4D73] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl skeuo-panel border border-[#DCD7CE]">
              <span className="text-[#181717] font-semibold">Agora AI Speech Output</span>
              <button
                type="button"
                onClick={onToggleMute}
                className="px-3 py-1 rounded-lg skeuo-btn text-xs font-mono text-[#181717] font-bold cursor-pointer active:translate-y-0.5"
              >
                {isMuted ? 'Muted (Click to Unmute)' : 'Active (Audio Output)'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 border-t border-[#DCD7CE] skeuo-chassis flex justify-end items-center gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl skeuo-btn text-[#7A756D] hover:text-[#181717] text-xs font-mono font-semibold transition-colors cursor-pointer active:translate-y-0.5"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] hover:from-[#383635] hover:to-[#1F1E1E] text-white text-xs font-mono font-bold shadow-md border border-[#45423E] transition-colors cursor-pointer active:translate-y-0.5"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
