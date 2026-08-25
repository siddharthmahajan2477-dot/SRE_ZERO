import React from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Lock,
  X,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Database,
  GitPullRequest,
  ShieldAlert,
} from 'lucide-react';
import { IncidentScenario } from '../types';

interface ApprovalGateModalProps {
  isOpen: boolean;
  scenario?: IncidentScenario;
  targetVersion?: string;
  targetCommit?: string;
  currentCommit?: string;
  onApprove: () => void;
  onReject: () => void;
  isExecutingRollback: boolean;
}

export const ApprovalGateModal: React.FC<ApprovalGateModalProps> = ({
  isOpen,
  scenario,
  targetVersion = 'v2.14.2',
  targetCommit = '9b21f04',
  currentCommit = 'd8f3a19',
  onApprove,
  onReject,
  isExecutingRollback,
}) => {
  if (!isOpen) return null;

  const remediationTitle = scenario?.remediationTitle || `Authorize Kubernetes Rollback (${targetVersion})`;
  const remediationDescription =
    scenario?.remediationDescription ||
    'SRE-Zero has staged an automated infrastructure mitigation action. Operator authorization is required:';
  const currentText = scenario?.remediationDetails?.current || `v2.14.3 (${currentCommit})`;
  const targetText = scenario?.remediationDetails?.target || `${targetVersion} (${targetCommit})`;
  const actionLabel = scenario?.remediationDetails?.actionLabel || `Authorize & Rollback (${targetVersion})`;
  const safetyChecks = scenario?.remediationDetails?.safetyChecks || [
    'Stateless change: 0 DB schema migrations required',
    `Container image pre-cached across node clusters`,
    'Zero-downtime drain window estimated: 14-18 seconds',
  ];
  const executingMsg = scenario?.remediationDetails?.executingMessage || 'Executing Infrastructure Mitigation...';

  const getScenarioIcon = () => {
    switch (scenario?.remediationType) {
      case 'restart':
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      case 'db_failover':
        return <Database className="w-4 h-4 text-blue-400" />;
      case 'revert_commit':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'waf_rule':
        return <ShieldAlert className="w-4 h-4 text-pink-400" />;
      default:
        return <Lock className="w-4 h-4 text-[#FF80BF]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans select-none animate-in fade-in duration-200">
      <div className="relative z-10 w-full max-w-lg skeuo-panel rounded-2xl border border-[#DCD7CE] shadow-2xl overflow-hidden">
        {/* Header Hardware Chassis */}
        <div className="p-4 sm:p-5 skeuo-chassis border-b border-[#DCD7CE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="skeuo-screw-sm" />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] border border-[#45423E] flex items-center justify-center text-white shadow-inner">
              {getScenarioIcon()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#181717] uppercase tracking-wide font-mono">
                Human Sign-Off Gate
              </h2>
              <p className="text-[11px] font-mono text-[#7A756D]">
                SRE-Zero: Autonomous Remediation Interlock
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#FDE8E8] text-[#9B1C1C] border border-[#FBC5C5] uppercase flex items-center gap-1">
            <span className="skeuo-led-red animate-pulse" />
            {scenario?.badge || 'P0 MITIGATION'}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="text-[#181717] font-medium leading-relaxed">
            {remediationDescription}
          </div>

          <div className="flex items-center justify-between skeuo-well p-4 rounded-xl border border-[#DCD7CE] font-mono text-xs shadow-inner">
            <div className="space-y-1">
              <span className="text-[10px] text-[#9B1C1C] block font-bold uppercase tracking-wider">
                Current Degraded:
              </span>
              <span className="text-[#181717] font-bold text-xs sm:text-sm">{currentText}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-[#9B4D73]" />

            <div className="space-y-1 text-right">
              <span className="text-[10px] text-[#16A34A] block font-bold uppercase tracking-wider">
                Target State:
              </span>
              <span className="text-[#16A34A] font-bold text-xs sm:text-sm">{targetText}</span>
            </div>
          </div>

          {/* Safety Checklist */}
          <div className="space-y-2 text-xs font-mono">
            <div className="text-[10px] uppercase tracking-wider text-[#7A756D] font-bold">
              Safety Verification Matrix:
            </div>
            <div className="space-y-2 skeuo-panel p-3.5 rounded-xl border border-[#DCD7CE]">
              {safetyChecks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[#16A34A] font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-[#181717] text-xs">{chk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Animation */}
          {isExecutingRollback && (
            <div className="p-3.5 rounded-xl skeuo-well border border-[#DCD7CE] space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-[#181717]">
                <span className="flex items-center gap-2 font-bold text-[#9B4D73]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#9B4D73]" />
                  {executingMsg}
                </span>
                <span className="text-[#16A34A] text-xs font-bold">Executing</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-black/10">
                <div className="h-full bg-gradient-to-r from-[#9B4D73] to-pink-500 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 skeuo-chassis border-t border-[#DCD7CE] flex items-center justify-end gap-2.5">
          <button
            onClick={onReject}
            disabled={isExecutingRollback}
            className="px-4 py-2 rounded-xl skeuo-btn text-[#7A756D] hover:text-[#181717] text-xs font-mono font-semibold transition-colors disabled:opacity-50 cursor-pointer active:translate-y-0.5"
          >
            Reject Action
          </button>

          <button
            onClick={onApprove}
            disabled={isExecutingRollback}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#2A2928] to-[#141414] hover:from-[#383635] hover:to-[#1F1E1E] text-white text-xs font-mono font-bold shadow-md border border-[#45423E] transition-all disabled:opacity-50 cursor-pointer active:translate-y-0.5"
          >
            {isExecutingRollback ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Action...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{actionLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};



