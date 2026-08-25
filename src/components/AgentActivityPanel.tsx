import React, { useState } from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Radio,
  FileCode,
  Zap,
  FileText,
} from 'lucide-react';
import { ToolCall, TimelineEvent, IncidentState, DeploymentInfo, IncidentScenario } from '../types';

interface AgentActivityPanelProps {
  toolCalls: ToolCall[];
  timeline: TimelineEvent[];
  stage: IncidentState;
  deployment: DeploymentInfo;
  scenario?: IncidentScenario;
  isApprovalModalOpen: boolean;
  onOpenApprovalModal: () => void;
  onApproveRollback: () => void;
  onRejectApproval: () => void;
  isExecutingRollback: boolean;
  thoughtStream: string[];
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  toolCalls,
  timeline,
  stage,
  deployment,
  scenario,
  onOpenApprovalModal,
  onApproveRollback,
  onRejectApproval,
  isExecutingRollback,
  thoughtStream,
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'timeline' | 'thoughts'>('tools');
  const [expandedToolId, setExpandedToolId] = useState<string | null>(toolCalls[0]?.id || null);

  const isPendingApproval = stage === 'MITIGATING' || stage === 'INVESTIGATING';
  const isResolved = stage === 'RESOLVED';

  const actionText =
    scenario?.remediationTitle ||
    `Rollback frontend-service to ${deployment.previousStableVersion} (${deployment.previousStableCommit})`;
  const targetLabel = scenario?.remediationDetails?.actionLabel || 'Authorize Mitigation';
  const executingMsg = scenario?.remediationDetails?.executingMessage || 'Executing Infrastructure Mitigation...';

  return (
    <div className="space-y-4 overflow-y-auto pl-0.5 font-sans h-full select-none">
      {/* 1. Human Approval Gate Card (Pinned at Top for Maximum Operational Visibility) */}
      <div className={`rounded-2xl border p-4 shadow-sm transition-all ${
        isResolved
          ? 'bg-[#EDF7ED]/70 border-[#C2E7C6]'
          : isPendingApproval
          ? 'skeuo-panel border-[#E2DFDA] ring-2 ring-[#9B4D73]/30'
          : 'skeuo-panel border-[#DCD7CE]'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DFDA]">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-inner ${
              isResolved
                ? 'bg-gradient-to-b from-[#16A34A] to-[#14532D] text-white border border-[#0F3F23]'
                : 'bg-gradient-to-b from-[#A8537D] to-[#631D45] text-white border border-[#43142F]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#181717] uppercase tracking-wide font-mono">
              Human Sign-Off Gate
            </h3>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
            isResolved
              ? 'bg-[#EDF7ED] text-[#16A34A] border border-[#C2E7C6]'
              : 'bg-[#FAF5F7] text-[#9B4D73] border border-[#F2D6E3] animate-pulse'
          }`}>
            {isResolved ? 'APPROVED & APPLIED' : 'ACTION REQUIRED'}
          </span>
        </div>

        <div className="pt-3 space-y-3">
          <div>
            <span className="text-[10px] font-mono text-[#7A756D] uppercase font-bold tracking-wider block">
              Pending Automated Action
            </span>
            <p className="text-xs font-bold font-mono text-[#181717] mt-0.5 leading-snug">
              {actionText}
            </p>
          </div>

          <div className="skeuo-well p-2.5 rounded-xl border border-[#DCD7CE] text-xs font-mono space-y-1">
            <div className="text-[#7A756D] flex justify-between">
              <span>Safety Analysis:</span>
              <span className="text-[#16A34A] font-bold">PASS (Automated Pre-flight Check)</span>
            </div>
            <div className="text-[#7A756D] flex justify-between">
              <span>Execution Policy:</span>
              <span className="text-[#181717] font-semibold">{scenario?.badge || 'P0'} Production Interlock</span>
            </div>
          </div>

          {/* Progress / Status Indicator */}
          {isExecutingRollback ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono text-[#9B4D73] font-bold">
                <span>{executingMsg}</span>
                <span>65%</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-black/10">
                <div className="h-full bg-gradient-to-r from-[#9B4D73] to-pink-500 rounded-full w-2/3 animate-pulse shadow-sm" />
              </div>
            </div>
          ) : isResolved ? (
            <div className="flex items-center gap-2 text-xs font-mono text-[#16A34A] font-bold bg-[#EDF7ED] p-2.5 rounded-xl border border-[#C2E7C6]">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Mitigation completed safely and metrics restored.</span>
            </div>
          ) : (
            /* High-Tactile Two-Button Approval Flexbox */
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onApproveRollback}
                disabled={isExecutingRollback}
                className="flex-1 py-2.5 bg-gradient-to-b from-[#2A2928] to-[#141414] hover:from-[#383635] hover:to-[#1F1E1E] text-white text-xs font-mono font-bold rounded-xl shadow-md border border-[#45423E] transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{targetLabel}</span>
              </button>

              <button
                onClick={onRejectApproval}
                disabled={isExecutingRollback}
                className="py-2.5 px-3.5 skeuo-btn text-[#7A756D] hover:text-[#181717] text-xs font-mono rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50 active:translate-y-0.5"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Tab Switcher Card */}
      <div className="rounded-2xl skeuo-panel border border-[#DCD7CE] p-3.5 shadow-sm">
        {/* Tab Header */}
        <div className="flex border-b border-[#E2DFDA] mb-3">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 pb-2 text-xs font-mono font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'tools'
                ? 'border-[#9B4D73] text-[#9B4D73]'
                : 'border-transparent text-[#7A756D] hover:text-[#181717]'
            }`}
          >
            Tool Traces ({toolCalls.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 pb-2 text-xs font-mono font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'timeline'
                ? 'border-[#9B4D73] text-[#9B4D73]'
                : 'border-transparent text-[#7A756D] hover:text-[#181717]'
            }`}
          >
            Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('thoughts')}
            className={`flex-1 pb-2 text-xs font-mono font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'thoughts'
                ? 'border-[#9B4D73] text-[#9B4D73]'
                : 'border-transparent text-[#7A756D] hover:text-[#181717]'
            }`}
          >
            Thoughts
          </button>
        </div>

        {/* Tab 1: Live Tool Execution Traces */}
        {activeTab === 'tools' && (
          <div className="space-y-2">
            {toolCalls.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-[#7A756D]">
                No tool calls executed yet. SRE-Zero will trigger diagnostic commands during triage.
              </div>
            ) : (
              toolCalls.map((call) => {
                const isExpanded = expandedToolId === call.id;
                return (
                  <div
                    key={call.id}
                    className="rounded-xl border border-[#DCD7CE] skeuo-panel overflow-hidden text-xs font-mono"
                  >
                    <button
                      onClick={() => setExpandedToolId(isExpanded ? null : call.id)}
                      className="w-full p-2.5 flex items-center justify-between text-left hover:bg-white/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-[#9B4D73]" />
                        <span className="font-bold text-[#181717]">{call.name}()</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#7A756D]">{call.latencyMs}ms</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#EDF7ED] text-[#16A34A] text-[9px] font-bold border border-[#C2E7C6]">
                          200 OK
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#7A756D]" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-[#7A756D]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 skeuo-screen-dark text-gray-200 border-t border-[#2B2832] space-y-2 text-[11px] font-mono overflow-x-auto">
                        <div>
                          <span className="text-gray-400 block">$ {call.displayName}</span>
                        </div>
                        <div>
                          <span className="text-pink-400 block font-bold">Input Params:</span>
                          <pre className="text-gray-300">
                            {JSON.stringify(call.inputParams, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-emerald-400 block font-bold">Response Payload:</span>
                          <pre className="text-gray-300">
                            {JSON.stringify(call.responseData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Chronological Incident Timeline */}
        {activeTab === 'timeline' && (
          <div className="relative pl-5 space-y-3.5 text-xs py-1">
            {/* Connected Vertical Milestone Line */}
            <div className="absolute left-2 top-2 bottom-2 w-[1.5px] bg-[#DCD7CE]" />

            {timeline.map((event) => {
              const isAlert = event.type === 'alert';
              const isRecovery = event.type === 'recovery';
              return (
                <div key={event.id} className="relative group">
                  <div
                    className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center shadow-xs ${
                      isAlert
                        ? 'border-[#9B1C1C] bg-[#FDE8E8]'
                        : isRecovery
                        ? 'border-[#16A34A] bg-[#EDF7ED]'
                        : 'border-[#9B4D73] bg-[#FAF5F7]'
                    }`}
                  />
                  <div className="font-mono text-[10px] font-semibold text-[#7A756D]">{event.timestamp}</div>
                  <h4 className="font-bold text-[#181717] text-xs mt-0.5">{event.title}</h4>
                  <p className="text-xs text-[#7A756D] mt-0.5 leading-snug">{event.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Agent Thought Stream */}
        {activeTab === 'thoughts' && (
          <div className="space-y-2 text-xs font-mono">
            {thoughtStream.map((thought, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl skeuo-well border border-[#DCD7CE] text-[#181717] leading-relaxed flex items-start gap-2"
              >
                <span className="text-[#9B4D73] font-bold text-sm leading-none">›</span>
                <span>{thought}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

