import React, { useState } from 'react';
import {
  Terminal,
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';
import { ToolCall } from '../types';

interface ToolCallsPanelProps {
  toolCalls: ToolCall[];
  activeToolId?: string | null;
  agentThoughtStream: string[];
}

export const ToolCallsPanel: React.FC<ToolCallsPanelProps> = ({
  toolCalls,
  activeToolId,
  agentThoughtStream,
}) => {
  const [expandedCalls, setExpandedCalls] = useState<Record<string, boolean>>({
    default: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCalls((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const isExpanded = (id: string, idx: number) => {
    if (expandedCalls[id] !== undefined) return expandedCalls[id];
    return idx === 0; // Latest is expanded
  };

  const handleCopyJson = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <aside className="w-full h-full border-l border-[#1A1A24] flex flex-col bg-[#0C0C10]/60 relative overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#1A1A24] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold">
            Agent Reasoning & Tools
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {toolCalls.length} EXECUTED
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[#F472B6]">
          <Brain className="w-3.5 h-3.5 text-[#F472B6]" />
          <span>LLM Agent</span>
        </div>
      </div>

      {/* Agent Thought Chain / Live Deduction Stream */}
      {agentThoughtStream.length > 0 && (
        <div className="p-3 bg-[#17141A] border-b border-[#1A1A24] shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#F472B6] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F472B6] animate-pulse" />
            <span>AI Reasoning Stream</span>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {agentThoughtStream.slice(-3).map((thought, idx) => (
              <div
                key={idx}
                className="text-xs font-mono text-gray-200 bg-[#121014] p-2.5 rounded-lg border-l-3 border-[#F472B6] border-t border-r border-b border-[#1A1A24] leading-relaxed flex items-start gap-2"
              >
                <span className="text-[#F472B6] font-bold text-sm">›</span>
                <span>{thought}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Call Cards List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {toolCalls.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 font-mono text-xs">
            <Terminal className="w-8 h-8 text-gray-500 mb-2.5 animate-pulse" />
            <p className="text-sm text-gray-300 font-medium">No tools executed yet.</p>
            <p className="text-xs text-gray-500 mt-1">SRE-Zero calls telemetry tools automatically upon voice inquiries.</p>
          </div>
        ) : (
          toolCalls.map((call, idx) => {
            const isAction = call.type === 'action';
            const expanded = isExpanded(call.id, idx);
            const isRequiresApproval = call.status === 'requires_approval';

            return (
              <div
                key={call.id}
                className={`space-y-2 p-3.5 rounded-xl border text-xs font-mono transition-all overflow-hidden ${
                  isAction
                    ? 'bg-[#17141A] border-[#F472B6]/40 shadow-[0_0_12px_rgba(244,114,182,0.1)]'
                    : isRequiresApproval
                    ? 'bg-amber-950/25 border-amber-500/40'
                    : 'bg-[#121014] border-[#1A1A24]'
                }`}
              >
                {/* Tool Header */}
                <div
                  onClick={() => toggleExpand(call.id)}
                  className="flex items-center justify-between cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>

                    <span className="font-mono font-bold text-xs sm:text-sm text-white">
                      [{call.displayName}]
                    </span>

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                        isAction
                          ? 'bg-rose-500/20 text-[#FBCFE8] border border-rose-400/30'
                          : 'bg-[#17141A] text-gray-300 border border-[#1A1A24]'
                      }`}
                    >
                      {isAction ? 'ACTION' : 'READ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {call.latencyMs}ms
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        call.status === 'completed'
                          ? 'text-emerald-400'
                          : call.status === 'requires_approval'
                          ? 'text-[#F472B6] animate-pulse'
                          : 'text-amber-400'
                      }`}
                    >
                      {call.status === 'completed' ? 'SUCCESS' : call.status === 'requires_approval' ? 'HOLD' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <div className="pt-2 space-y-2.5 text-xs font-mono">
                    {/* Agent Justification */}
                    {call.reasoning && (
                      <div className="text-xs text-gray-200 font-sans bg-[#0C0C10] p-2.5 rounded-lg border border-[#1A1A24] leading-relaxed">
                        <span className="text-[#F472B6] font-mono text-xs uppercase font-bold block mb-1">
                          Agent Justification:
                        </span>
                        {call.reasoning}
                      </div>
                    )}

                    {/* Input Params */}
                    <div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                        Input Parameters:
                      </div>
                      <pre className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                        {JSON.stringify(call.inputParams, null, 2)}
                      </pre>
                    </div>

                    {/* JSON Response Payload */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                        <span>Response Payload:</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyJson(call.id, call.responseData);
                          }}
                          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === call.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-xs text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
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
    </aside>
  );
};

