import React, { useState, useEffect } from 'react';
import { X, Radio, Volume2, Sliders, ShieldCheck, Check, Info, Key, Hash, Award, Cpu, Sparkles } from 'lucide-react';
import { groqService } from '../services/groqService';

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
  // 3 required credentials: Groq API Key, Agora App ID, and Agora Certificate ID
  const [groqApiKey, setGroqApiKey] = useState<string>(() => {
    return localStorage.getItem('groq_api_key') || 'gsk_demo_groq_lpu_fast_reasoning_token_984f';
  });
  const [appId, setAppId] = useState<string>(() => {
    return localStorage.getItem('agora_app_id') || '4a8b2c9d1e3f4a5b6c7d8e9f0a1b2c3d';
  });
  const [certificateId, setCertificateId] = useState<string>(() => {
    return localStorage.getItem('agora_certificate_id') || 'cert_7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b';
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedGroq = localStorage.getItem('groq_api_key');
    const storedAppId = localStorage.getItem('agora_app_id');
    const storedCertId = localStorage.getItem('agora_certificate_id');
    if (storedGroq) setGroqApiKey(storedGroq);
    if (storedAppId) setAppId(storedAppId);
    if (storedCertId) setCertificateId(storedCertId);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('groq_api_key', groqApiKey.trim());
    localStorage.setItem('agora_app_id', appId.trim());
    localStorage.setItem('agora_certificate_id', certificateId.trim());
    groqService.setApiKey(groqApiKey.trim());

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
              <Cpu className="w-4 h-4 text-[#FF80BF]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#181717] font-mono uppercase tracking-wide">
                Groq & Agora Credentials Calibration
              </h3>
              <p className="text-xs font-mono text-[#7A756D]">
                Groq API Key • Agora App ID • Agora Certificate ID
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
              Configure your <strong>Groq API Key</strong> for ultra-fast LPU incident reasoning alongside your <strong>Agora App ID</strong> and <strong>Agora Certificate ID</strong> for real-time voice streaming and war-room RTC channels.
            </p>
          </div>

          {/* 1. Groq API Key */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF6F8] border border-[#ECD3E1]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#9B4D73] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#9B4D73]" />
                <span>1. Groq API Key (GROQ_API_KEY)</span>
              </label>
              <span className="text-[10px] text-[#9B4D73] font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-[#ECD3E1]">
                Groq LPU
              </span>
            </div>
            <input
              type="password"
              value={groqApiKey}
              placeholder="e.g. gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              onChange={(e) => setGroqApiKey(e.target.value)}
              className="w-full bg-white border border-[#D8BFCE] rounded-xl px-3.5 py-2.5 text-xs text-[#181717] font-mono focus:outline-none focus:border-[#9B4D73] shadow-inner font-semibold"
            />
            <p className="text-[10px] text-[#7A756D] font-mono">
              Powers ultra-fast SRE incident diagnosis & automated root cause intelligence via Groq LPU.
            </p>
          </div>

          {/* 2. Agora App ID */}
          <div className="space-y-1.5 p-3 rounded-xl skeuo-panel border border-[#DCD7CE]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#9B4D73]" />
                <span>2. Agora App ID (AGORA_APP_ID)</span>
              </label>
              <span className="text-[10px] text-[#7A756D] font-mono">Agora RTC</span>
            </div>
            <input
              type="text"
              value={appId}
              placeholder="e.g. 4a8b2c9d1e3f4a5b6c7d8e9f0a1b2c3d"
              onChange={(e) => setAppId(e.target.value)}
              className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3.5 py-2.5 text-xs text-[#181717] font-mono focus:outline-none focus:border-[#9B4D73] shadow-inner font-semibold"
            />
          </div>

          {/* 3. Agora Certificate ID */}
          <div className="space-y-1.5 p-3 rounded-xl skeuo-panel border border-[#DCD7CE]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#7A756D] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#9B4D73]" />
                <span>3. Agora Certificate ID (AGORA_CERTIFICATE_ID)</span>
              </label>
              <span className="text-[10px] text-[#7A756D] font-mono">App Certificate</span>
            </div>
            <input
              type="password"
              value={certificateId}
              placeholder="e.g. cert_7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
              onChange={(e) => setCertificateId(e.target.value)}
              className="w-full skeuo-panel border border-[#CCC6BC] rounded-xl px-3.5 py-2.5 text-xs text-[#181717] font-mono focus:outline-none focus:border-[#9B4D73] shadow-inner font-semibold"
            />
          </div>

          {/* Audio Output & Mute Toggle */}
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl skeuo-panel border border-[#DCD7CE]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#9B4D73]" />
                <span className="text-[#181717] font-semibold">Agora RTC Audio Output</span>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className="px-3 py-1.5 rounded-lg skeuo-btn text-xs font-mono text-[#181717] font-bold cursor-pointer active:translate-y-0.5"
              >
                {isMuted ? '🔇 Audio Muted (Click to Enable)' : '🔊 Audio Active (Live)'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 border-t border-[#DCD7CE] skeuo-chassis flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[11px] text-[#1B5E20] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Groq LPU & Agora Voice Ready</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl skeuo-btn text-[#7A756D] hover:text-[#181717] text-xs font-mono font-semibold transition-colors cursor-pointer active:translate-y-0.5"
            >
              Close
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] hover:from-[#383635] hover:to-[#1F1E1E] text-white text-xs font-mono font-bold shadow-md border border-[#45423E] transition-colors cursor-pointer active:translate-y-0.5"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{saved ? 'Saved!' : 'Save Credentials'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

