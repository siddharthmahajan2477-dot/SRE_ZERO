import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  Sliders,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Layers,
  Check,
  Cpu,
  Database,
  GitPullRequest,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { IncidentScenario, IncidentState, ScenarioId } from '../types';

interface HeaderNavbarProps {
  stage: IncidentState;
  isDegraded: boolean;
  isResolved: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  currentStepIndex: number;
  onStepNext: () => void;
  onRunDemoScenario: () => void;
  onResetScenario: () => void;
  isAutoPlaying: boolean;
  onOpenPostMortem: () => void;
  onOpenSettings: () => void;
  scenarios: IncidentScenario[];
  selectedScenarioId: ScenarioId;
  onSelectScenario: (scenarioId: ScenarioId) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  stage,
  isDegraded,
  isResolved,
  isMuted,
  onToggleMute,
  currentStepIndex,
  onStepNext,
  onRunDemoScenario,
  onResetScenario,
  isAutoPlaying,
  onOpenPostMortem,
  onOpenSettings,
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}) => {
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsScenarioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4-Stage Stepper: Detected ➔ Triage & Diagnosis ➔ Mitigation Gate ➔ Restored
  const stages = [
    { label: 'Detected', completed: stage !== 'HEALTHY', active: stage === 'INCIDENT' },
    { label: 'Triage & Diagnosis', completed: stage === 'INVESTIGATING' || stage === 'MITIGATING' || stage === 'RESOLVED', active: stage === 'INVESTIGATING' },
    { label: 'Mitigation Gate', completed: stage === 'MITIGATING' || stage === 'RESOLVED', active: stage === 'MITIGATING' },
    { label: 'Restored', completed: stage === 'RESOLVED', active: stage === 'RESOLVED' },
  ];

  const getScenarioIcon = (id: ScenarioId) => {
    switch (id) {
      case 'scenario-2-memory-leak':
        return <Cpu className="w-3.5 h-3.5 text-amber-500" />;
      case 'scenario-3-db-connection':
        return <Database className="w-3.5 h-3.5 text-blue-500" />;
      case 'scenario-4-ci-broken-tests':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />;
      case 'scenario-5-ddos-flood':
        return <ShieldAlert className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return <Server className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full skeuo-chassis border-b border-[#D6D2CA] px-3 sm:px-5 lg:px-6 py-2.5 shadow-sm font-sans select-none">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-3">
        {/* Left Hardware Section: Screws & Plaque & Jewel LED Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Left Chassis Mounting Screw */}
          <div className="skeuo-screw hidden sm:inline-block" title="Hardware chassis mount bolt" />

          {/* Machined Metal Emblem Plaque */}
          <div className="flex items-center gap-2 bg-gradient-to-b from-[#242228] to-[#121115] text-white px-2.5 py-1.5 rounded-lg border border-[#3C3844] shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
            <span className="font-mono text-xs font-bold tracking-tight text-[#FF80BF] bg-[#3B1E2E] px-1.5 py-0.5 rounded border border-[#632948]">
              S0
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-tight text-white leading-none">
                SRE-Zero
              </span>
              <span className="text-[9px] font-mono text-[#A8A4B0] uppercase tracking-wider leading-tight">
                AUTONOMOUS COMMAND
              </span>
            </div>
          </div>

          {/* Active Jewel LED Status Indicator */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono text-xs shadow-xs transition-all ${
              isResolved
                ? 'bg-[#EBF7ED] border-[#C2E7C6] text-[#1B5E20]'
                : isDegraded
                ? 'bg-[#FDE8E8] border-[#FBC5C5] text-[#9B1C1C]'
                : 'bg-[#F3F2EF] border-[#DDD9D2] text-[#5C5852]'
            }`}
          >
            {isResolved ? (
              <>
                <span className="skeuo-led-green" />
                <span className="font-bold text-[11px]">NOMINAL (RESTORED)</span>
              </>
            ) : isDegraded ? (
              <>
                <span className="skeuo-led-red animate-pulse" />
                <span className="font-bold text-[11px] flex items-center gap-1">
                  <span>{activeScenario.badge} OUTAGE</span>
                  <span className="bg-[#9B1C1C] text-white text-[9px] px-1 py-0.2 rounded font-mono">
                    {activeScenario.id === 'scenario-4-ci-broken-tests' ? 'CI-FAIL' : 'INC-84920'}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="skeuo-led-amber" />
                <span className="font-medium text-[11px]">STANDBY / READY</span>
              </>
            )}
          </div>
        </div>

        {/* Center / Left-Center: PROMINENT SCENARIO SELECTOR (HIGH VISIBILITY) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsScenarioDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all border shadow-sm ${
              isScenarioDropdownOpen
                ? 'skeuo-btn-plum font-bold ring-2 ring-[#9B4D73]/30'
                : 'skeuo-btn text-[#181717] font-semibold hover:border-[#9B4D73]'
            }`}
            title="Click to Switch Outage Scenario (5 Live SRE Incidents Available)"
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9B4D73] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9B4D73]"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A756D] font-bold hidden sm:inline">
                SCENARIO:
              </span>
            </div>

            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-2xs"
              style={{ backgroundColor: activeScenario.badgeColor || '#9B1C1C' }}
            >
              {activeScenario.badge}
            </span>

            <span className="font-bold text-[#181717] truncate max-w-[130px] sm:max-w-[170px]">
              {activeScenario.name}
            </span>

            <ChevronDown
              className={`w-4 h-4 text-[#9B4D73] transition-transform duration-200 ${
                isScenarioDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Popup */}
          {isScenarioDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-84 sm:w-[420px] skeuo-panel rounded-2xl border border-[#DCD7CE] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-[#DCD7CE] mb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9B4D73] font-bold block">
                    ⚡ Production Incident Scenarios
                  </span>
                  <span className="text-xs font-bold text-[#181717] font-mono">
                    Select Outage to Simulate & Remediate
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-[#EBF7ED] text-[#1B5E20] border border-[#C2E7C6] px-2 py-0.5 rounded-full font-bold">
                  {scenarios.length} Scenarios
                </span>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {scenarios.map((sc, index) => {
                  const isSelected = sc.id === selectedScenarioId;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        onSelectScenario(sc.id);
                        setIsScenarioDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer border ${
                        isSelected
                          ? 'skeuo-well border-[#9B4D73] bg-[#F5E9EF]/50 shadow-inner'
                          : 'hover:bg-black/5 border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 p-2 rounded-lg skeuo-panel border border-[#DCD7CE]">
                        {getScenarioIcon(sc.id)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-mono text-xs font-bold text-[#181717] truncate">
                            {index + 1}. {sc.name}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#9B4D73] bg-white px-1.5 py-0.5 rounded border border-[#9B4D73]/30">
                              <Check className="w-3 h-3 text-[#9B4D73]" /> ACTIVE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded text-white"
                            style={{ backgroundColor: sc.badgeColor }}
                          >
                            {sc.badge}
                          </span>
                          <span className="text-[10px] font-mono text-[#7A756D]">
                            {sc.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#5C5852] line-clamp-2 leading-relaxed">
                          {sc.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[#DCD7CE] mt-2 flex items-center justify-between text-[10px] font-mono text-[#7A756D]">
                <span>Voice Interruption & Speech Ready</span>
                <span className="text-[#9B4D73] font-bold">1-Click Switch</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: 4-Stage SRE Incident Stepper */}
        <div className="hidden 2xl:flex items-center gap-1 p-1 rounded-xl skeuo-well">
          {stages.map((stg, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  stg.active
                    ? 'bg-white text-[#181717] font-bold shadow-xs border border-[#CEC9C0]'
                    : stg.completed
                    ? 'text-[#181717] font-semibold'
                    : 'text-[#8A857D]'
                }`}
              >
                {stg.active ? (
                  <span className={isDegraded ? 'skeuo-led-red animate-pulse' : isResolved ? 'skeuo-led-green' : 'skeuo-led-plum animate-pulse'} />
                ) : stg.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#CEC9C0]" />
                )}
                <span>{stg.label}</span>
              </div>
              {index < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[#A8A49C] mx-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* Right Section: Scenario Dropdown + Calibration Block + Agora Channel + Sequencer */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Agora RTC Channel Status */}
          <button
            onClick={onOpenSettings}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg skeuo-btn text-xs font-mono cursor-pointer"
            title="Agora RTC Incident War Room Channel"
          >
            <Radio className="w-3.5 h-3.5 text-[#9B4D73]" />
            <span className="font-semibold text-[#181717]">#incident-war-room</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse ml-0.5" />
            <span className="text-[10px] text-[#6B6866] bg-black/5 px-1 py-0.2 rounded">3 Active</span>
          </button>

          {/* Quick Mic Audio Output Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              isMuted
                ? 'skeuo-btn text-[#6B6866]'
                : 'skeuo-btn-plum'
            }`}
            title={isMuted ? 'Unmute Live Audio' : 'Mute Live Audio'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
          </button>

          {/* Interactive Outage Simulation Sequencer */}
          <div className="flex items-center p-0.5 rounded-lg skeuo-well">
            <button
              onClick={onRunDemoScenario}
              disabled={isAutoPlaying}
              className="flex items-center gap-1.5 skeuo-btn-dark text-xs font-mono font-medium px-3 py-1.5 rounded-md disabled:opacity-50 cursor-pointer shadow-xs"
              title={`Run Complete Automated Incident Drill (${activeScenario.shortName})`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Simulate Outage</span>
            </button>

            <button
              onClick={onStepNext}
              className="px-2.5 py-1.5 text-xs font-mono text-[#181717] hover:bg-white rounded-md transition-colors cursor-pointer font-semibold"
              title="Advance Single Step in Drill Scenario"
            >
              Step {currentStepIndex + 1}/8
            </button>

            <button
              onClick={onResetScenario}
              className="p-1.5 text-[#6B6866] hover:text-[#181717] hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Reset Scenario to Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Post-Mortem Report Trigger */}
          <button
            onClick={onOpenPostMortem}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg skeuo-btn text-xs font-mono cursor-pointer"
            title="View Post-Mortem Incident Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#9B4D73]" />
            <span className="hidden xl:inline font-semibold text-[#181717]">Post-Mortem</span>
          </button>

          {/* Agora RTC Configuration Modal Trigger (CALIBRATION BLOCK) */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg skeuo-btn text-[#6B6866] hover:text-[#181717] cursor-pointer"
            title="Agora Voice & Acoustic Calibration"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Right Chassis Mounting Screw */}
          <div className="skeuo-screw hidden sm:inline-block" title="Hardware chassis mount bolt" />
        </div>
      </div>
    </header>
  );
};


