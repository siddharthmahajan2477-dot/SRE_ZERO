import React from 'react';
import { X, FileText, Download, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';
import { PostIncidentReport } from '../types';

interface PostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PostIncidentReport;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `# SRE Incident Post-Mortem: ${report.serviceName}
Incident ID: ${report.incidentId}
Severity: ${report.severity}
Duration / MTTR: ${report.mttrMinutes}

## Executive Summary
${report.summary}

## Root Cause
${report.rootCause}

## Mitigations Executed
${report.actionsTaken.map((a) => `- ${a}`).join('\n')}

## Follow-up Action Items
${report.followUpTasks.map((t) => `- [ ] ${t.task} (${t.assignee}, Priority: ${t.priority})`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl skeuo-panel rounded-2xl border border-[#DCD7CE] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Hardware Chassis */}
        <div className="p-4 sm:p-5 border-b border-[#DCD7CE] flex justify-between items-center skeuo-chassis">
          <div className="flex items-center gap-2.5">
            <div className="skeuo-screw-sm" />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] text-white flex items-center justify-center border border-[#45423E] shadow-inner">
              <FileText className="w-4 h-4 text-[#FF80BF]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#181717] font-mono uppercase tracking-wide">
                Automated Incident Post-Mortem Report
              </h3>
              <p className="text-xs font-mono text-[#7A756D]">
                Report Ref: {report.incidentId} • MTTR: {report.mttrMinutes}
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

        {/* Scrollable Report Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm skeuo-well">
          {/* Executive Overview Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
            <div className="skeuo-panel p-3 rounded-xl border border-[#DCD7CE]">
              <span className="text-[10px] text-[#7A756D] block uppercase font-bold">Service Affected</span>
              <span className="font-bold text-xs text-[#181717] mt-0.5 block">{report.serviceName}</span>
            </div>
            <div className="skeuo-panel p-3 rounded-xl border border-[#DCD7CE]">
              <span className="text-[10px] text-[#7A756D] block uppercase font-bold">Severity Tier</span>
              <span className="font-bold text-xs text-[#9B1C1C] mt-0.5 block">{report.severity}</span>
            </div>
            <div className="skeuo-panel p-3 rounded-xl border border-[#DCD7CE]">
              <span className="text-[10px] text-[#7A756D] block uppercase font-bold">Total MTTR</span>
              <span className="font-bold text-xs text-[#16A34A] mt-0.5 block">{report.mttrMinutes}</span>
            </div>
            <div className="skeuo-panel p-3 rounded-xl border border-[#DCD7CE]">
              <span className="text-[10px] text-[#7A756D] block uppercase font-bold">Resolution Method</span>
              <span className="font-bold text-xs text-[#181717] mt-0.5 block">K8s Git Rollback</span>
            </div>
          </div>

          {/* Incident Summary */}
          <div className="skeuo-panel p-4 rounded-xl border border-[#DCD7CE]">
            <h4 className="font-bold text-xs font-mono uppercase text-[#7A756D] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#9B4D73]">1.</span> Executive Summary
            </h4>
            <p className="text-xs sm:text-sm text-[#181717] leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Root Cause Analysis */}
          <div className="skeuo-panel p-4 rounded-xl border border-[#FBC5C5] bg-[#FDE8E8]/40 space-y-2">
            <h4 className="font-bold text-xs font-mono uppercase text-[#9B1C1C] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2. Root Cause Analysis & AST Diff</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#181717]">{report.rootCause}</p>
            <div className="font-mono text-xs skeuo-screen-dark text-gray-200 p-3 rounded-lg border border-[#2B2832] shadow-inner">
              <span className="text-red-400 font-bold">commit d8f3a19b: fix(auth): update session cache config</span>{'\n'}
              <span className="text-gray-400">max_connections: 500 ➔ max_connections: 20 (96% drop causing starvation cascade)</span>
            </div>
          </div>

          {/* Mitigations Taken */}
          <div className="skeuo-panel p-4 rounded-xl border border-[#DCD7CE]">
            <h4 className="font-bold text-xs font-mono uppercase text-[#7A756D] mb-2 flex items-center gap-1.5">
              <span className="text-[#9B4D73]">3.</span> Mitigations Executed by SRE-Zero
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#181717]">
              {report.actionsTaken.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2.5 skeuo-well p-2.5 rounded-lg border border-[#DCD7CE]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span className="font-medium">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow-up Preventive Tasks */}
          <div className="skeuo-panel p-4 rounded-xl border border-[#DCD7CE]">
            <h4 className="font-bold text-xs font-mono uppercase text-[#7A756D] mb-2 flex items-center gap-1.5">
              <span className="text-[#9B4D73]">4.</span> Follow-up Preventive Engineering Items
            </h4>
            <div className="space-y-2 font-mono">
              {report.followUpTasks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg skeuo-well border border-[#DCD7CE] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9B4D73]" />
                    <span className="text-[#181717] font-semibold">{item.task}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7A756D]">{item.assignee}</span>
                    <span className="px-2 py-0.5 bg-white border border-[#DCD7CE] rounded-md text-[10px] font-bold text-[#181717]">
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 border-t border-[#DCD7CE] skeuo-chassis flex justify-end items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl skeuo-btn text-[#181717] text-xs font-mono font-semibold transition-colors cursor-pointer active:translate-y-0.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#7A756D]" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] hover:from-[#383635] hover:to-[#1F1E1E] text-white text-xs font-mono font-bold shadow-md border border-[#45423E] transition-colors cursor-pointer active:translate-y-0.5"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
