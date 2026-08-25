import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  ArrowRight,
  TrendingUp,
  Server,
  Activity,
  Cpu,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Flame,
  Globe,
  Layers,
  Check,
  RefreshCw,
  Gauge,
  Radio,
  Zap,
  Database,
  GitPullRequest,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  ServiceMetrics,
  Commit,
  DeploymentInfo,
  IncidentState,
  IncidentScenario,
  ScenarioId,
} from '../types';

interface IncidentOverviewPanelProps {
  metrics: ServiceMetrics;
  commits: Commit[];
  deployment: DeploymentInfo;
  stage: IncidentState;
  onSimulateOutage: () => void;
  onSimulateRecovery: () => void;
  stagedRollbackCommit: string | null;
  onApproveRollback?: () => void;
  onOpenApprovalModal?: () => void;
  onRejectApproval?: () => void;
  isExecutingRollback?: boolean;
  scenarios?: IncidentScenario[];
  selectedScenarioId?: ScenarioId;
  onSelectScenario?: (scenarioId: ScenarioId) => void;
}

interface SyntheticProbe {
  endpoint: string;
  name: string;
  status: '200 OK' | '502 BAD GATEWAY' | 'TIMEOUT';
  latency: number;
}

export const IncidentOverviewPanel: React.FC<IncidentOverviewPanelProps> = ({
  metrics,
  commits,
  deployment,
  stage,
  onSimulateOutage,
  onSimulateRecovery,
  stagedRollbackCommit,
  onApproveRollback,
  onOpenApprovalModal,
  onRejectApproval,
  isExecutingRollback,
  scenarios = [],
  selectedScenarioId,
  onSelectScenario,
}) => {
  const [selectedCommitHash, setSelectedCommitHash] = useState<string | null>(
    'd8f3a19b88e147f9e802b1897d2e09b1894a7e21'
  );
  const [isWebsiteTesting, setIsWebsiteTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(252); // ~4m 12s

  const isDegraded = metrics.errorRate > 10 || metrics.httpStatus === 502 || metrics.cpuPercent > 80;
  const isResolved = stage === 'RESOLVED' || metrics.errorRate === 0;

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

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

  // Active digital elapsed clock
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDegraded) {
        setElapsedSeconds((prev) => prev + 1);
      } else if (isResolved) {
        setElapsedSeconds((prev) => Math.max(0, prev));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isDegraded, isResolved]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Synthetic Probes Health Matrix
  const probes: SyntheticProbe[] = [
    {
      endpoint: '/api/v1/checkout',
      name: 'Checkout Gateway',
      status: isDegraded ? '502 BAD GATEWAY' : '200 OK',
      latency: isDegraded ? 3420 : 38,
    },
    {
      endpoint: '/api/v1/auth/session',
      name: 'Session Auth Cache',
      status: isDegraded ? '502 BAD GATEWAY' : '200 OK',
      latency: isDegraded ? 4180 : 24,
    },
    {
      endpoint: '/api/v1/health',
      name: 'Kubernetes Liveness',
      status: isDegraded ? '502 BAD GATEWAY' : '200 OK',
      latency: isDegraded ? 1890 : 12,
    },
  ];

  // Dynamic Runbook steps per active scenario
  const runbookSteps = [
    {
      id: 1,
      title: `Triage ${activeScenario?.shortName || 'incident'} & isolate telemetry anomaly`,
      status: stage !== 'HEALTHY' ? 'completed' : 'pending',
      desc: activeScenario?.description || 'Isolated upstream bottleneck.',
    },
    {
      id: 2,
      title: 'Inspect correlated commits & subsystem telemetry',
      status: stage === 'INVESTIGATING' || stage === 'MITIGATING' || stage === 'RESOLVED' ? 'completed' : 'pending',
      desc: activeScenario?.commits?.[0]?.isCulprit
        ? `Culprit commit identified: ${activeScenario.commits[0].hash} by ${activeScenario.commits[0].author}.`
        : 'Subsystem isolation complete. Diagnostic logs gathered.',
    },
    {
      id: 3,
      title: `Stage remediation: ${activeScenario?.remediationTitle || 'Rollback / Mitigation'}`,
      status: stagedRollbackCommit || stage === 'MITIGATING' || stage === 'RESOLVED' ? 'completed' : 'pending',
      desc: activeScenario?.remediationDescription || 'Target state verified and ready for execution.',
    },
    {
      id: 4,
      title: 'Human SRE approval gate validation',
      status: isResolved ? 'completed' : stage === 'MITIGATING' ? 'in_progress' : 'pending',
      desc: 'Explicit cryptographic authorization required by on-call SRE lead.',
    },
    {
      id: 5,
      title: 'Post-mitigation verification & telemetry settling',
      status: isResolved ? 'completed' : 'pending',
      desc: 'All pods healthy, error rate 0.0%, automated post-mortem report compiled.',
    },
  ];

  const handleTestService = () => {
    setIsWebsiteTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsWebsiteTesting(false);
      if (isDegraded) {
        setTestResult('HTTP/1.1 502 Bad Gateway (Connection pool timeout: upstream cluster unavailable)');
      } else {
        setTestResult('HTTP/2 200 OK (Latency: 38ms, Service: api-auth healthy, 32 pods responding)');
      }
    }, 450);
  };

  return (
    <div className="space-y-4 overflow-y-auto pr-1 font-sans select-none">
      {/* 0. HIGH-VISIBILITY SCENARIO SELECTOR MATRIX */}
      {scenarios.length > 0 && onSelectScenario && (
        <div className="rounded-2xl skeuo-panel p-3.5 shadow-sm border border-[#DCD7CE] bg-[#FAF8F5]">
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#E2DFDA]">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#9B4D73]/10 text-[#9B4D73]">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-mono font-bold text-[#181717] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Incident Scenarios</span>
                  <span className="text-[10px] bg-[#9B4D73] text-white px-1.5 py-0.2 rounded font-mono font-semibold">
                    5 Live Outages
                  </span>
                </h3>
                <p className="text-[11px] text-[#7A756D]">
                  Click any scenario below to immediately load its telemetry and voice drill:
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#9B4D73] font-bold hidden sm:inline">
              1-Click Switch
            </span>
          </div>

          {/* 5 Scenario Quick-Select Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {scenarios.map((sc, index) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`text-left p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'skeuo-well border-[#9B4D73] bg-[#F5E9EF]/60 shadow-xs ring-1 ring-[#9B4D73]'
                      : 'skeuo-btn hover:border-[#9B4D73]/50 text-[#5C5852]'
                  }`}
                  title={`Switch to ${sc.name}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1">
                      {getScenarioIcon(sc.id)}
                      <span className="font-mono text-[10px] font-bold text-[#7A756D]">
                        #{index + 1}
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded text-white shadow-2xs"
                      style={{ backgroundColor: sc.badgeColor }}
                    >
                      {sc.badge}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-[#181717] line-clamp-1 mb-1">
                    {sc.name}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7A756D] mt-auto pt-1 border-t border-black/5">
                    <span className="truncate max-w-[90px]">{sc.category}</span>
                    {isSelected && (
                      <span className="text-[#9B4D73] font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> LIVE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Target Service Summary Card */}
      <div className="rounded-2xl skeuo-panel p-4 shadow-sm border border-[#DCD7CE]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2DFDA]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-inner ${
                isDegraded
                  ? 'bg-gradient-to-b from-[#E02424] to-[#9B1C1C] text-white border border-[#771D1D]'
                  : 'bg-gradient-to-b from-[#16A34A] to-[#14532D] text-white border border-[#0F3F23]'
              }`}
            >
              {isDegraded ? '502' : '200'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#9B4D73] bg-[#FAF5F7] px-2 py-0.5 rounded-md border border-[#F2D6E3]">
                  frontend-service / api-auth
                </span>
                <span className="text-xs font-mono font-semibold text-[#7A756D]">INC-84920</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#181717] mt-0.5">
                {isDegraded
                  ? 'Elevated HTTP 502 Bad Gateway Spike on Production Ingress'
                  : 'Production Cluster Operational — All Traffic Routed Normally'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl skeuo-screen-dark text-xs font-mono text-gray-200 border border-[#2B2832]">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="tracking-wider">T-ELAPSED: <strong className="text-white font-bold">{isDegraded ? formatElapsed(elapsedSeconds) : '00:00'}</strong></span>
            </div>
          </div>
        </div>

        {/* 4-Metric Metadata Well */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs font-mono">
          <div className="skeuo-well p-2.5 rounded-xl border border-[#DCD7CE]">
            <span className="text-[10px] text-[#7A756D] block font-semibold uppercase">Severity Tier</span>
            <span className={`font-bold text-xs flex items-center gap-1.5 mt-0.5 ${isDegraded ? 'text-[#9B1C1C]' : 'text-[#16A34A]'}`}>
              {isDegraded ? <span className="skeuo-led-red animate-pulse" /> : <span className="skeuo-led-green" />}
              {isDegraded ? 'SEV-1 P0 CRIT' : 'NOMINAL HEALTHY'}
            </span>
          </div>

          <div className="skeuo-well p-2.5 rounded-xl border border-[#DCD7CE]">
            <span className="text-[10px] text-[#7A756D] block font-semibold uppercase">Cluster Node</span>
            <span className="font-bold text-xs text-[#181717] flex items-center gap-1 mt-0.5">
              <Globe className="w-3 h-3 text-[#7A756D]" />
              us-central1-k8s
            </span>
          </div>

          <div className="skeuo-well p-2.5 rounded-xl border border-[#DCD7CE]">
            <span className="text-[10px] text-[#7A756D] block font-semibold uppercase">Replica Matrix</span>
            <span className="font-bold text-xs text-[#181717] block mt-0.5">
              {metrics.healthyPods} / {metrics.totalPods} Pods {isDegraded ? '(CrashLoop)' : '(Healthy)'}
            </span>
          </div>

          <div className="skeuo-well p-2.5 rounded-xl border border-[#DCD7CE]">
            <span className="text-[10px] text-[#7A756D] block font-semibold uppercase">Deployed Build</span>
            <span className="font-bold text-xs text-[#181717] block mt-0.5">
              {deployment.currentVersion} ({deployment.currentCommit})
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4x Skeuomorphic CRT Telemetry Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* CRT Meter 1: CPU Load Display */}
        <div className="skeuo-screen-dark rounded-xl p-3 border border-[#2B2832] shadow-inner select-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8A94] mb-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#A8537D]" />
              CPU LOAD
            </span>
            <span className={`px-1 py-0.2 rounded font-bold ${
              metrics.cpuUsage > 80 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {metrics.cpuUsage > 80 ? 'CRITICAL' : 'NOMINAL'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.cpuUsage.toFixed(1)}%
          </div>
          {/* Segmented LED Bar */}
          <div className="flex gap-1 h-2 mt-2 bg-black/60 p-0.5 rounded border border-white/5">
            {Array.from({ length: 10 }).map((_, i) => {
              const active = i < Math.round(metrics.cpuUsage / 10);
              const isHigh = i >= 7;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-xs transition-all ${
                    active
                      ? isHigh
                        ? 'bg-red-500 shadow-[0_0_4px_#EF4444]'
                        : 'bg-emerald-500 shadow-[0_0_4px_#10B981]'
                      : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* CRT Meter 2: HTTP 502 Error Rate */}
        <div className="skeuo-screen-dark rounded-xl p-3 border border-[#2B2832] shadow-inner select-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8A94] mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-400" />
              ERROR RATE
            </span>
            <span className={`px-1 py-0.2 rounded font-bold ${
              isDegraded ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' : 'bg-emerald-950 text-emerald-400'
            }`}>
              {isDegraded ? '+48.7%' : '0.0%'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.errorRate.toFixed(1)}%
          </div>
          {/* Segmented LED Bar */}
          <div className="flex gap-1 h-2 mt-2 bg-black/60 p-0.5 rounded border border-white/5">
            {Array.from({ length: 10 }).map((_, i) => {
              const active = i < Math.round(metrics.errorRate / 10);
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-xs transition-all ${
                    active
                      ? 'bg-red-500 shadow-[0_0_4px_#EF4444]'
                      : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* CRT Meter 3: P99 Latency Gauge */}
        <div className="skeuo-screen-dark rounded-xl p-3 border border-[#2B2832] shadow-inner select-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8A94] mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              P99 LATENCY
            </span>
            <span className={`px-1 py-0.2 rounded font-bold ${
              metrics.p99Latency > 500 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
            }`}>
              {metrics.p99Latency > 500 ? 'SLA BREACH' : 'OK'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.p99Latency.toLocaleString()}
            <span className="text-xs text-gray-400 font-normal ml-1">ms</span>
          </div>
          {/* Progress gauge */}
          <div className="h-2 w-full bg-black/60 rounded overflow-hidden mt-2 border border-white/5">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.p99Latency > 500 ? 'bg-amber-500 shadow-[0_0_6px_#F59E0B]' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (metrics.p99Latency / 3500) * 100)}%` }}
            />
          </div>
        </div>

        {/* CRT Meter 4: HTTP Status Code & Throughput */}
        <div className="skeuo-screen-dark rounded-xl p-3 border border-[#2B2832] shadow-inner select-none">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8A94] mb-1">
            <span>HTTP STATUS</span>
            <span className="text-gray-400">{isDegraded ? '4,850 RPS' : '2,100 RPS'}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <span className={isDegraded ? 'text-red-400 drop-shadow-[0_0_6px_#EF4444]' : 'text-emerald-400 drop-shadow-[0_0_6px_#10B981]'}>
              {metrics.httpStatus} {isDegraded ? 'Bad Gateway' : 'OK'}
            </span>
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-2 flex items-center justify-between">
            <span>INGRESS: Envoy/1.28</span>
            <span className={isDegraded ? 'text-red-400' : 'text-emerald-400'}>
              {isDegraded ? 'TIMEOUT_502' : 'HTTP_200'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Synthetic Probe Health Matrix */}
      <div className="rounded-2xl skeuo-panel p-3.5 shadow-sm border border-[#DCD7CE]">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2DFDA]">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#9B4D73]" />
            <h3 className="font-bold text-xs text-[#181717] uppercase tracking-wider font-mono">
              Synthetic Probe Health Matrix (2s Intervals)
            </h3>
          </div>
          <button
            onClick={handleTestService}
            disabled={isWebsiteTesting}
            className="flex items-center gap-1 px-2 py-1 rounded-lg skeuo-btn text-[11px] font-mono font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-[#9B4D73] ${isWebsiteTesting ? 'animate-spin' : ''}`} />
            <span>Manual Probe</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2.5 font-mono text-xs">
          {probes.map((probe, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                probe.status.includes('502')
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#181717]">{probe.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    probe.status.includes('502')
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {probe.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-[#6B6866]">
                <code className="text-[#181717]">{probe.endpoint}</code>
                <span className="font-bold">{probe.latency}ms</span>
              </div>
            </div>
          ))}
        </div>

        {testResult && (
          <div className="mt-2.5 p-2 rounded-lg bg-black text-gray-200 font-mono text-[11px] border border-white/10 flex items-center gap-2">
            <span className="text-amber-400 font-bold">&gt;</span>
            <span className={testResult.includes('502') ? 'text-red-400' : 'text-emerald-400'}>
              {testResult}
            </span>
          </div>
        )}
      </div>

      {/* 4. Git Commit Ledger & AST Diff Inspection */}
      <div className="rounded-2xl skeuo-panel p-4 shadow-sm border border-[#DCD7CE]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DFDA]">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#9B4D73]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#181717] uppercase tracking-wide font-mono">
              Git Commit Triage & AST Diff Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-[#7A756D]">Branch: <strong className="text-[#181717]">main</strong></span>
        </div>

        <div className="space-y-2 pt-3">
          {commits.map((commit) => {
            const isSelected = selectedCommitHash === commit.hash;
            return (
              <div
                key={commit.hash}
                onClick={() => setSelectedCommitHash(commit.hash)}
                className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  commit.isCulprit
                    ? 'bg-[#FDE8E8]/50 border-[#FBC5C5] shadow-xs'
                    : isSelected
                    ? 'skeuo-well border-[#CCC6BC]'
                    : 'skeuo-panel border-[#E2DFDA] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#181717]">{commit.shortHash}</span>
                    <span className="text-[#7A756D]">{commit.author}</span>
                    {commit.isCulprit && (
                      <span className="px-2 py-0.5 rounded-md bg-[#9B1C1C] text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>AST BLAME (98% REGRESSION CORRELATION)</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#7A756D]">{commit.relativeTime}</span>
                </div>

                <p className="text-xs font-sans text-[#181717] mt-1.5 leading-snug">
                  {commit.message}
                </p>

                {commit.isCulprit && isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-[#FBC5C5] space-y-1 text-xs">
                    <div className="text-[11px] font-bold text-[#9B1C1C] flex items-center gap-1 font-mono">
                      <span>Regression AST Diff (src/config/redis.ts & connection pool limit):</span>
                    </div>
                    <pre className="skeuo-screen-dark text-gray-200 p-3 rounded-lg text-[11px] overflow-x-auto leading-relaxed border border-[#2B2832]">
                      <span className="text-red-400 font-bold">- max_connections: 500  // connection pool threshold</span>{'\n'}
                      <span className="text-red-400 font-bold">- maxSockets: 50</span>{'\n'}
                      <span className="text-emerald-400 font-bold">+ max_connections: 20   // REGRESSION: starved upstream pods causing 502 cascade</span>{'\n'}
                      <span className="text-emerald-400 font-bold">+ maxSockets: 5</span>
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Automated Runbook Remediation Steps */}
      <div className="rounded-2xl skeuo-panel p-4 shadow-sm border border-[#DCD7CE]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DFDA]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#9B4D73]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#181717] uppercase tracking-wide font-mono">
              Automated Runbook Steps (RB-INGRESS-502)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#7A756D]">Execution: <strong className="text-[#181717]">Supervised</strong></span>
        </div>

        <div className="space-y-2 pt-3">
          {runbookSteps.map((step) => (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                step.status === 'completed'
                  ? 'bg-[#EDF7ED]/50 border-[#C2E7C6]'
                  : step.status === 'in_progress'
                  ? 'bg-[#FAF5F7] border-[#F2D6E3]'
                  : 'skeuo-well opacity-75 border-[#DCD7CE]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 shadow-xs ${
                  step.status === 'completed'
                    ? 'bg-[#16A34A] text-white'
                    : step.status === 'in_progress'
                    ? 'bg-[#9B4D73] text-white animate-pulse'
                    : 'bg-[#CCC6BC] text-[#5C5852]'
                }`}
              >
                {step.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : step.id}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#181717]">{step.title}</h4>
                  <span
                    className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded ${
                      step.status === 'completed'
                        ? 'bg-[#EDF7ED] text-[#1B5E20]'
                        : step.status === 'in_progress'
                        ? 'bg-[#FAF5F7] text-[#9B4D73]'
                        : 'bg-[#EFECE6] text-[#7A756D]'
                    }`}
                  >
                    {step.status === 'completed' ? 'DONE' : step.status === 'in_progress' ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-[#7A756D] mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

