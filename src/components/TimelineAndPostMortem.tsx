import React, { useState } from 'react';
import {
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { IncidentState, PostIncidentReport, TimelineEvent } from '../types';

interface TimelineAndPostMortemProps {
  stage: IncidentState;
  timeline: TimelineEvent[];
  postMortem: PostIncidentReport;
  onSelectEvent?: (event: TimelineEvent) => void;
}

export const TimelineAndPostMortem: React.FC<TimelineAndPostMortemProps> = ({
  stage,
  timeline,
  postMortem,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'postmortem'>('timeline');
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const isResolved = stage === 'RESOLVED';

  // Automatically switch to post-mortem when resolved
  React.useEffect(() => {
    if (isResolved) {
      setActiveTab('postmortem');
    }
  }, [isResolved]);

  const handleCopySlack = () => {
    const slackText = `*🚨 [POST-MORTEM] Incident ${postMortem.incidentId} - ${postMortem.serviceName}*
*Severity:* ${postMortem.severity} | *MTTR:* ${postMortem.mttrMinutes}
*Root Cause:* ${postMortem.rootCause}
*Remediation:* ${postMortem.actionsTaken[0]}
*Follow-ups:* ${postMortem.followUpTasks.map((t) => `\n• [${t.priority}] ${t.task} (${t.assignee})`).join('')}`;

    navigator.clipboard.writeText(slackText);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const md = `# Post-Incident Report: ${postMortem.incidentId}
**Service:** ${postMortem.serviceName}
**Severity:** ${postMortem.severity}
**Duration (MTTR):** ${postMortem.mttrMinutes} (${postMortem.startedAt} - ${postMortem.resolvedAt})

## Executive Summary
${postMortem.summary}

## Root Cause Analysis
${postMortem.rootCause}

## Timeline
${timeline.map((e) => `- **${e.timestamp}**: ${e.title} - ${e.description}`).join('\n')}

## Actions Taken
${postMortem.actionsTaken.map((a) => `- ${a}`).join('\n')}

## Preventative Action Items
${postMortem.followUpTasks.map((t) => `- [${t.priority}] ${t.task} (Owner: ${t.assignee})`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  return (
    <div className="border-t border-[#1A1A24] bg-[#0C0C10] relative z-20 font-sans">
      {/* Tab Navigation Header */}
      <div className="px-4 py-2.5 bg-[#0C0C10] border-b border-[#1A1A24] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#17141A] text-white border border-[#F472B6]/40 font-bold shadow-[0_0_10px_rgba(244,114,182,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>INCIDENT TIMELINE</span>
            <span className="text-xs text-gray-400 font-normal">({timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('postmortem')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all relative cursor-pointer ${
              activeTab === 'postmortem'
                ? 'bg-[#17141A] text-white border border-indigo-400/40 font-bold shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>POST-INCIDENT REPORT</span>
            {isResolved && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Action buttons for Post-Mortem */}
        {activeTab === 'postmortem' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySlack}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#121014] hover:bg-[#17141A] text-gray-300 hover:text-white border border-[#1A1A24] hover:border-[#F472B6]/30 transition-colors cursor-pointer"
            >
              {copiedSlack ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied to Slack</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#F472B6]" />
                  <span>Copy Slack Card</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#121014] hover:bg-[#17141A] text-gray-300 hover:text-white border border-[#1A1A24] hover:border-indigo-400/30 transition-colors cursor-pointer"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied MD</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export Markdown</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tab Body */}
      <div className="p-4 max-h-72 overflow-y-auto">
        {activeTab === 'timeline' ? (
          /* Horizontal / Vertical Timeline Stream */
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {timeline.map((event) => {
                const isAlert = event.type === 'alert';
                const isRecovery = event.type === 'recovery';
                const isApproval = event.type === 'approval';

                return (
                  <div
                    key={event.id}
                    className={`rounded-xl p-3.5 border text-xs font-mono relative transition-all duration-200 ${
                      isAlert
                        ? 'bg-red-950/25 border-red-500/40 text-red-200'
                        : isRecovery
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                        : isApproval
                        ? 'bg-[#1D1620] border-[#F472B6]/40 text-white shadow-[0_0_10px_rgba(244,114,182,0.15)]'
                        : 'bg-[#121014] border-[#1A1A24] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                      <span className="font-bold font-mono">{event.timestamp}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isAlert
                            ? 'bg-red-500/20 text-red-300'
                            : isRecovery
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-[#17141A] text-gray-300'
                        }`}
                      >
                        {event.type}
                      </span>
                    </div>

                    <div className="font-bold text-white text-xs sm:text-sm mb-1">
                      {event.title}
                    </div>

                    <div className="text-xs text-gray-300 font-sans leading-relaxed">
                      {event.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Post-Incident Report / Post-Mortem View */
          <div className="rounded-xl border border-[#1A1A24] bg-[#121014] p-5 space-y-4 font-mono text-xs">
            {/* Header & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1A24]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    INCIDENT POST-MORTEM: {postMortem.incidentId}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">
                    {postMortem.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Service: <span className="text-gray-100 font-semibold">{postMortem.serviceName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="bg-[#17141A] px-3.5 py-2 rounded-lg border border-[#1A1A24]">
                  <span className="text-gray-400 block text-xs">MTTR (Downtime):</span>
                  <span className="text-emerald-400 font-bold text-sm">{postMortem.mttrMinutes}</span>
                </div>
                <div className="bg-[#17141A] px-3.5 py-2 rounded-lg border border-[#1A1A24]">
                  <span className="text-gray-400 block text-xs">Resolution Method:</span>
                  <span className="text-indigo-300 font-bold text-sm">Human-Approved Rollback</span>
                </div>
              </div>
            </div>

            {/* Summary & Root Cause */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs sm:text-sm">
              <div className="bg-[#17141A] p-4 rounded-xl border border-[#1A1A24] space-y-2">
                <span className="text-xs font-mono font-bold text-[#F472B6] uppercase tracking-wider block">
                  Incident Summary
                </span>
                <p className="text-gray-200 leading-relaxed">
                  {postMortem.summary}
                </p>
              </div>

              <div className="bg-[#17141A] p-4 rounded-xl border border-[#1A1A24] space-y-2">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                  Identified Root Cause
                </span>
                <p className="text-gray-200 leading-relaxed font-mono text-xs sm:text-sm">
                  {postMortem.rootCause}
                </p>
              </div>
            </div>

            {/* Follow-up Action Items */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
                Preventative Action Items & Remediation Follow-ups
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
                {postMortem.followUpTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="bg-[#17141A] p-3.5 rounded-xl border border-[#1A1A24] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-400">{task.assignee}</span>
                    </div>
                    <p className="text-gray-200 font-sans text-xs pt-1 leading-relaxed">
                      {task.task}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

