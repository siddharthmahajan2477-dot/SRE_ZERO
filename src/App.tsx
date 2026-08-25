import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Commit,
  DeploymentInfo,
  IncidentScenario,
  IncidentState,
  Participant,
  PostIncidentReport,
  ScenarioId,
  ServiceMetrics,
  TimelineEvent,
  ToolCall,
  TranscriptTurn,
} from './types';
import {
  ALL_INCIDENT_SCENARIOS,
  DEMO_SCRIPT_STEPS,
  INITIAL_PARTICIPANTS,
  generatePostMortem,
  mockApplyWafRule,
  mockCheckDatabaseStatus,
  mockCheckDeployment,
  mockGetMetrics,
  mockGetProcessMetrics,
  mockGetRecentCommits,
  mockRestartService,
  mockRevertCommit,
  mockRollbackDeployment,
  mockScaleOrFailoverDb,
} from './services/mockIncidentEngine';
import { voiceService } from './services/speechSynthesis';
import { groqService } from './services/groqService';
import { HeaderNavbar } from './components/HeaderNavbar';
import { ConversationPanel } from './components/ConversationPanel';
import { IncidentOverviewPanel } from './components/IncidentOverviewPanel';
import { AgentActivityPanel } from './components/AgentActivityPanel';
import { PostMortemModal } from './components/PostMortemModal';
import { AgoraSettingsModal } from './components/AgoraSettingsModal';
import { ApprovalGateModal } from './components/ApprovalGateModal';

export default function App() {
  // Scenario Selection State
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('scenario-1-bad-deploy');
  const activeScenario =
    ALL_INCIDENT_SCENARIOS.find((s) => s.id === selectedScenarioId) || ALL_INCIDENT_SCENARIOS[0];

  // Core Incident State (initialized to activeScenario failed state for immediate operational readiness)
  const [stage, setStage] = useState<IncidentState>('INCIDENT');
  const [metrics, setMetrics] = useState<ServiceMetrics>(activeScenario.incidentMetrics);
  const [commits, setCommits] = useState<Commit[]>(activeScenario.commits);
  const [deployment, setDeployment] = useState<DeploymentInfo>(activeScenario.deploymentInfo);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>(activeScenario.initialTranscript);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(activeScenario.initialTimeline);
  const [postMortem, setPostMortem] = useState<PostIncidentReport>(
    activeScenario.generatePostMortem()
  );
  const [agentThoughtStream, setAgentThoughtStream] = useState<string[]>([
    `Alert received: ${activeScenario.name}`,
    'Joining incident war room on Agora Voice RTC transport.',
  ]);

  // Modals & Gate States
  const [stagedRollbackCommit, setStagedRollbackCommit] = useState<string | null>(
    activeScenario.deploymentInfo.previousStableCommit
  );
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isExecutingRollback, setIsExecutingRollback] = useState(false);
  const [isPostMortemOpen, setIsPostMortemOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio / Speech State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  // Demo Sequencer State
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Voice Service speaking state with UI participant avatars
  useEffect(() => {
    voiceService.setSpeakingListener((isSpeaking, speakerRole) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (speakerRole === 'agent' && p.isAgent) {
            return { ...p, isSpeaking };
          }
          if (speakerRole === 'lead' && p.id === 'user-1') {
            return { ...p, isSpeaking };
          }
          if (speakerRole === 'devops' && p.id === 'user-2') {
            return { ...p, isSpeaking };
          }
          return { ...p, isSpeaking: false };
        })
      );

      if (isSpeaking) {
        if (speakerRole === 'agent') setActiveSpeakerId('agent-1');
        else if (speakerRole === 'lead') setActiveSpeakerId('user-1');
        else if (speakerRole === 'devops') setActiveSpeakerId('user-2');
      } else {
        setActiveSpeakerId(null);
      }
    });

    return () => {
      voiceService.stop();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, []);

  const addTranscriptTurn = async (
    speakerName: string,
    role: 'lead' | 'devops' | 'agent' | 'system',
    text: string,
    toolCallRef?: string,
    isInterrupted?: boolean
  ): Promise<void> => {
    const speakerId = role === 'agent' ? 'agent-1' : role === 'devops' ? 'user-2' : 'user-1';
    const avatar = role === 'agent' ? '🤖' : role === 'devops' ? '👩‍💻' : '👨‍💻';

    const newTurn: TranscriptTurn = {
      id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      speakerId,
      speakerName,
      role,
      avatar,
      text,
      isSpeaking: true,
      isInterrupted,
      toolCallReferenceId: toolCallRef,
    };

    setTranscript((prev) => [...prev, newTurn]);

    // Speak with Web Speech API
    if (role !== 'system') {
      await voiceService.speakAsync(text, role as 'agent' | 'lead' | 'devops');
      setTranscript((prev) =>
        prev.map((t) => (t.id === newTurn.id ? { ...t, isSpeaking: false } : t))
      );
    }
  };

  const addTimelineEvent = (
    title: string,
    description: string,
    eventStage: IncidentState,
    type: 'alert' | 'agent' | 'tool' | 'approval' | 'recovery' | 'info' = 'info'
  ) => {
    const newEv: TimelineEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title,
      description,
      stage: eventStage,
      type,
    };
    setTimeline((prev) => [...prev, newEv]);
  };

  // Scenario Selection Handler
  const handleSelectScenario = (scenarioId: ScenarioId) => {
    const nextSc = ALL_INCIDENT_SCENARIOS.find((s) => s.id === scenarioId) || ALL_INCIDENT_SCENARIOS[0];
    voiceService.stop();
    setSelectedScenarioId(scenarioId);
    setStage('INCIDENT');
    setMetrics(nextSc.incidentMetrics);
    setCommits(nextSc.commits);
    setDeployment(nextSc.deploymentInfo);
    setToolCalls([]);
    setTranscript(nextSc.initialTranscript);
    setTimeline(nextSc.initialTimeline);
    setStagedRollbackCommit(nextSc.deploymentInfo.previousStableCommit);
    setPostMortem(nextSc.generatePostMortem());
    setIsApprovalModalOpen(false);
    setIsExecutingRollback(false);
    setCurrentStepIndex(1);
    setIsAutoPlaying(false);
    setAgentThoughtStream([
      `Scenario switched to [${nextSc.name}].`,
      `Alert active: ${nextSc.name}.`,
      'Ready for operator diagnosis and voice instruction.',
    ]);
  };

  // Reset entire scenario to baseline
  const handleResetScenario = () => {
    voiceService.stop();
    setStage('HEALTHY');
    setMetrics(activeScenario.initialMetrics);
    setCommits(activeScenario.commits);
    setDeployment(activeScenario.deploymentInfo);
    setToolCalls([]);
    setTranscript([]);
    setTimeline(activeScenario.initialTimeline);
    setStagedRollbackCommit(null);
    setIsApprovalModalOpen(false);
    setIsExecutingRollback(false);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    setAgentThoughtStream([
      'Standing by on Agora audio war room.',
      'Prometheus, CloudWatch, and Datadog monitoring synthetic probes nominal.',
    ]);
  };

  // Trigger Outage for currently active scenario
  const handleSimulateOutage = async () => {
    setStage('INCIDENT');
    setMetrics(activeScenario.incidentMetrics);
    addTimelineEvent(
      `${activeScenario.badge} Alert: ${activeScenario.name}`,
      activeScenario.description,
      'INCIDENT',
      'alert'
    );
    setAgentThoughtStream((prev) => [
      ...prev,
      `Outage onset detected: ${activeScenario.name}. Investigating root cause telemetry.`,
    ]);
    setCurrentStepIndex(1);
    await addTranscriptTurn(
      'SRE-Zero',
      'agent',
      `🚨 Critical alert detected on ${activeScenario.targetService}. Error rate is ${activeScenario.incidentMetrics.errorRate}%, CPU load is ${activeScenario.incidentMetrics.cpuUsage}%. I have joined the Agora war room.`
    );
  };

  // Force Instant Recovery for currently active scenario
  const handleSimulateRecovery = () => {
    setStage('RESOLVED');
    setMetrics(activeScenario.recoveredMetrics);
    setDeployment((prev) => ({
      ...prev,
      currentVersion: prev.previousStableVersion,
      currentCommit: prev.previousStableCommit,
      status: 'rolled_back',
      lastDeployedAt: 'Just now',
    }));
    addTimelineEvent(
      `Mitigation Applied: ${activeScenario.remediationTitle}`,
      `Remediation complete. Error rate returned to ${activeScenario.recoveredMetrics.errorRate}%, all systems nominal.`,
      'RESOLVED',
      'recovery'
    );
    setAgentThoughtStream((prev) => [
      ...prev,
      `Recovery verified: Error rate is ${activeScenario.recoveredMetrics.errorRate}%, p99 latency is ${activeScenario.recoveredMetrics.p99Latency}ms. Post-mortem report ready.`,
    ]);
    setPostMortem(activeScenario.generatePostMortem());
    addTranscriptTurn(
      'SRE-Zero',
      'agent',
      `🎉 Mitigation verified! All telemetry nominal. p99 latency returned to ${activeScenario.recoveredMetrics.p99Latency}ms. I have compiled the automated incident post-mortem report.`
    );

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9B4D73', '#F5E9EF', '#2E7D32', '#181717'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  // Tool Call Actions (Dynamic per scenario)
  const executeGetMetrics = async () => {
    setStage('INVESTIGATING');
    const call = await mockGetMetrics();
    setToolCalls((prev) => [call, ...prev]);

    let agentMsg = `Telemetry shows CPU at ${activeScenario.incidentMetrics.cpuUsage}%, error rate at ${activeScenario.incidentMetrics.errorRate}%, p99 latency at ${activeScenario.incidentMetrics.p99Latency}ms.`;
    if (activeScenario.id === 'scenario-2-memory-leak') {
      agentMsg = `Queried Datadog: Node.js worker heaps at 96.8% (3.92GB/4GB limit). Long-running event-emitter memory leak detected.`;
    } else if (activeScenario.id === 'scenario-3-db-connection') {
      agentMsg = `Telemetry shows PostgreSQL connection pool saturated (100/100 connections) and read-replica replication lag at 14.8s.`;
    } else if (activeScenario.id === 'scenario-4-ci-broken-tests') {
      agentMsg = `CI Test Pipeline failed across 18 worker nodes. Vitest suite exited with code 1 on unit tests.`;
    } else if (activeScenario.id === 'scenario-5-ddos-flood') {
      agentMsg = `Edge Telemetry: 18,500 req/sec incoming flood from ASN AS14061 (91.4% rate limit violations on /api/v1/auth/token).`;
    }

    setAgentThoughtStream((prev) => [
      ...prev,
      `Queried telemetry tool for ${activeScenario.name}. Isolated bottleneck metrics.`,
    ]);
    addTimelineEvent(
      'Tool Executed: get_metrics()',
      agentMsg,
      'INVESTIGATING',
      'tool'
    );
    await addTranscriptTurn('SRE-Zero', 'agent', agentMsg, 'get_metrics()');
  };

  const executeGetCommits = async (isInterrupted = false) => {
    setStage('INVESTIGATING');
    const call = await mockGetRecentCommits();
    setToolCalls((prev) => [call, ...prev]);

    let agentMsg = `GitHub API: Checked recent commits. Culprit identified: ${activeScenario.commits[0]?.hash} by ${activeScenario.commits[0]?.author}.`;
    if (activeScenario.id === 'scenario-2-memory-leak') {
      agentMsg = `GitHub API check: No deployments in the last 96 hours. This is resource exhaustion from a long-running process leak, not a bad release.`;
    } else if (activeScenario.id === 'scenario-5-ddos-flood') {
      agentMsg = `GitHub API check: Codebase nominal. Zero recent code deployments. This is an external distributed traffic anomaly.`;
    }

    setAgentThoughtStream((prev) => [
      ...prev,
      `GitHub API audit complete for ${activeScenario.name}.`,
    ]);
    addTimelineEvent(
      'Tool Executed: get_recent_commits()',
      agentMsg,
      'INVESTIGATING',
      'tool'
    );
    await addTranscriptTurn('SRE-Zero', 'agent', agentMsg, 'get_recent_commits()');
  };

  const executeCheckDeployment = async () => {
    setStage('MITIGATING');

    let call: ToolCall;
    if (activeScenario.id === 'scenario-2-memory-leak') {
      call = await mockGetProcessMetrics();
    } else if (activeScenario.id === 'scenario-3-db-connection') {
      call = await mockCheckDatabaseStatus();
    } else {
      call = await mockCheckDeployment();
    }

    setToolCalls((prev) => [call, ...prev]);
    setStagedRollbackCommit(activeScenario.deploymentInfo.previousStableCommit);
    setAgentThoughtStream((prev) => [
      ...prev,
      `Staged automated remediation: ${activeScenario.remediationTitle}. Opening human approval gate.`,
    ]);
    addTimelineEvent(
      `Remediation Staged: ${activeScenario.remediationTitle}`,
      activeScenario.remediationDescription,
      'MITIGATING',
      'approval'
    );
    await addTranscriptTurn(
      'SRE-Zero',
      'agent',
      `I have prepared: ${activeScenario.remediationTitle}. Human authorization is required before execution.`,
      call.name
    );
    setIsApprovalModalOpen(true);
  };

  // User-Initiated Rollback / Mitigation Approval Handler
  const handleUserApproveRollback = async () => {
    setIsExecutingRollback(true);

    // 1. Lead SRE speaks approval
    await addTranscriptTurn(
      'Alex Rivera',
      'lead',
      `Request approved. SRE-Zero, proceed with ${activeScenario.remediationTitle}.`
    );

    // 2. SRE-Zero acknowledges
    await addTranscriptTurn(
      'SRE-Zero',
      'agent',
      `Acknowledged. Executing ${activeScenario.remediationTitle} now.`
    );

    setAgentThoughtStream((prev) => [
      ...prev,
      `Human approval verified from Alex Rivera. Executing ${activeScenario.remediationType}...`,
    ]);

    // 3. Execute appropriate mitigation tool call
    let call: ToolCall;
    if (activeScenario.id === 'scenario-2-memory-leak') {
      call = await mockRestartService();
    } else if (activeScenario.id === 'scenario-3-db-connection') {
      call = await mockScaleOrFailoverDb();
    } else if (activeScenario.id === 'scenario-4-ci-broken-tests') {
      call = await mockRevertCommit();
    } else if (activeScenario.id === 'scenario-5-ddos-flood') {
      call = await mockApplyWafRule();
    } else {
      call = await mockRollbackDeployment(activeScenario.deploymentInfo.previousStableCommit);
    }

    setToolCalls((prev) => [call, ...prev]);

    setIsExecutingRollback(false);
    setIsApprovalModalOpen(false);
    setCurrentStepIndex(7);

    // 4. Trigger recovery state and metrics
    handleSimulateRecovery();
  };

  const handleRejectApproval = async () => {
    setIsApprovalModalOpen(false);
    await addTranscriptTurn(
      'Alex Rivera',
      'lead',
      'Hold action. Keep monitoring telemetry before applying cluster changes.'
    );
    await addTranscriptTurn(
      'SRE-Zero',
      'agent',
      'Understood. Action held on standby. Continuous telemetry monitoring remains active.'
    );
  };

  // Dispatch Natural Language Inquiries from Presenter or Voice Feed
  const handleSendVoicePrompt = async (
    text: string,
    role: 'lead' | 'devops' | 'agent',
    isInterrupt?: boolean
  ) => {
    const speakerName = role === 'agent' ? 'SRE-Zero' : role === 'devops' ? 'Sarah Chen' : 'Alex Rivera';

    if (isInterrupt) {
      voiceService.stop();
    }

    await addTranscriptTurn(speakerName, role, text, undefined, isInterrupt);

    // Contextual intent routing
    const lower = text.toLowerCase();
    if (
      lower.includes('metric') ||
      lower.includes('cpu') ||
      lower.includes('load') ||
      lower.includes('memory') ||
      lower.includes('what’s using') ||
      lower.includes('whats using') ||
      lower.includes('database') ||
      lower.includes('connections')
    ) {
      await executeGetMetrics();
    } else if (
      lower.includes('commit') ||
      lower.includes('recent') ||
      lower.includes('change') ||
      lower.includes('deploy') ||
      lower.includes('who pushed') ||
      isInterrupt
    ) {
      await executeGetCommits(isInterrupt);
    } else if (
      lower.includes('remediat') ||
      lower.includes('prepare') ||
      lower.includes('stage') ||
      lower.includes('fix') ||
      lower.includes('restart') ||
      lower.includes('failover') ||
      lower.includes('rate limit') ||
      lower.includes('waf') ||
      lower.includes('revert')
    ) {
      await executeCheckDeployment();
    } else if (lower.includes('approve') || lower.includes('proceed') || lower.includes('execute') || lower.includes('yes')) {
      await handleUserApproveRollback();
    } else {
      let dynamicReply: string | null = null;
      if (groqService.hasApiKey()) {
        dynamicReply = await groqService.queryGroq(text, {
          scenarioName: activeScenario.name,
          metrics: metrics,
          culpritCommit: activeScenario.commits[0]?.hash,
        });
      }

      await addTranscriptTurn(
        'SRE-Zero',
        'agent',
        dynamicReply || `Understood. Analyzing "${text}" against connected SRE telemetry tools for ${activeScenario.name}.`
      );
    }
  };

  // Step-by-step Drill Runner
  const handleStepNext = async () => {
    const nextIdx = (currentStepIndex + 1) % DEMO_SCRIPT_STEPS.length;
    setCurrentStepIndex(nextIdx);

    switch (nextIdx) {
      case 0:
        handleResetScenario();
        break;
      case 1:
        await handleSimulateOutage();
        break;
      case 2:
        await addTranscriptTurn(
          'Alex Rivera',
          'lead',
          `SRE-Zero, what is causing this ${activeScenario.shortName} issue? Check telemetry.`
        );
        break;
      case 3:
        await executeGetMetrics();
        break;
      case 4:
        await addTranscriptTurn(
          'Sarah Chen',
          'devops',
          'Let me check the recent activity or commits.',
          undefined,
          true
        );
        await executeGetCommits(true);
        break;
      case 5:
        await addTranscriptTurn('Alex Rivera', 'lead', `Stage the remediation action: ${activeScenario.remediationTitle}.`);
        await executeCheckDeployment();
        break;
      case 6:
        setIsApprovalModalOpen(true);
        break;
      case 7:
        await handleUserApproveRollback();
        break;
    }
  };

  // Automated Full Walkthrough
  const handleRunDemoScenario = async () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);
    handleResetScenario();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 1. Trigger Outage
    await handleSimulateOutage();

    await new Promise((resolve) => setTimeout(resolve, 500));
    setCurrentStepIndex(2);

    // 2. Alex Rivera asks SRE-Zero to investigate metrics
    await addTranscriptTurn(
      'Alex Rivera',
      'lead',
      `SRE-Zero, what's causing this alert? Check telemetry and error logs.`
    );

    await new Promise((resolve) => setTimeout(resolve, 400));
    setCurrentStepIndex(3);

    // 3. Query Metrics tool
    await executeGetMetrics();

    await new Promise((resolve) => setTimeout(resolve, 500));
    setCurrentStepIndex(4);

    // 4. Sarah Chen intervenes
    await addTranscriptTurn(
      'Sarah Chen',
      'devops',
      'Stop. Check recent commits and change history.',
      undefined,
      true
    );

    await new Promise((resolve) => setTimeout(resolve, 400));
    await executeGetCommits(true);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setCurrentStepIndex(5);

    // 5. Alex Rivera asks to prepare mitigation
    await addTranscriptTurn(
      'Alex Rivera',
      'lead',
      `Let’s stage the mitigation: ${activeScenario.remediationTitle}.`
    );

    await new Promise((resolve) => setTimeout(resolve, 400));
    await executeCheckDeployment();

    // 6. Stop and open approval modal for user to approve!
    setCurrentStepIndex(6);
    setIsApprovalModalOpen(true);
    setIsAutoPlaying(false);
  };

  const handleToggleAudioMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    voiceService.setEnabled(!nextMuted);
  };

  const isDegraded = metrics.errorRate > 10 || metrics.httpStatus === 502 || metrics.cpuPercent > 80;
  const isResolved = stage === 'RESOLVED' || (metrics.errorRate === 0 && metrics.cpuPercent < 40);

  return (
    <div id="sre-zero-app" className="min-h-screen bg-[#F7F6F4] text-[#181717] flex flex-col font-sans">
      {/* Block 1: Sticky Top Navigation Bar */}
      <HeaderNavbar
        stage={stage}
        isDegraded={isDegraded}
        isResolved={isResolved}
        isMuted={isAudioMuted}
        onToggleMute={handleToggleAudioMute}
        currentStepIndex={currentStepIndex}
        onStepNext={handleStepNext}
        onRunDemoScenario={handleRunDemoScenario}
        onResetScenario={handleResetScenario}
        isAutoPlaying={isAutoPlaying}
        onOpenPostMortem={() => setIsPostMortemOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        scenarios={ALL_INCIDENT_SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
      />

      {/* Main 3-Column SRE Incident Command Center */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Block 2: Left Column — Conversation & Voice Stream (col-span-4 / ~33.3%) */}
        <div className="lg:col-span-4 h-[calc(100vh-5.5rem)] overflow-y-auto">
          <ConversationPanel
            participants={participants}
            transcript={transcript}
            activeSpeakerId={activeSpeakerId}
            onSendVoicePrompt={handleSendVoicePrompt}
            isMuted={isAudioMuted}
            onToggleMute={handleToggleAudioMute}
          />
        </div>

        {/* Block 3: Center Column — Incident Status & Telemetry (col-span-5 / ~41.7%) */}
        <div className="lg:col-span-5 h-[calc(100vh-5.5rem)] overflow-y-auto">
          <IncidentOverviewPanel
            stage={stage}
            metrics={metrics}
            commits={commits}
            deployment={deployment}
            scenarios={ALL_INCIDENT_SCENARIOS}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={handleSelectScenario}
            onSimulateOutage={handleSimulateOutage}
            onSimulateRecovery={handleSimulateRecovery}
            stagedRollbackCommit={stagedRollbackCommit}
            onApproveRollback={handleUserApproveRollback}
            onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
            onRejectApproval={handleRejectApproval}
            isExecutingRollback={isExecutingRollback}
          />
        </div>

        {/* Block 4: Right Column — Agent Activity & Approval Gate (col-span-3 / ~25%) */}
        <div className="lg:col-span-3 h-[calc(100vh-5.5rem)] overflow-y-auto">
          <AgentActivityPanel
            toolCalls={toolCalls}
            timeline={timeline}
            stage={stage}
            deployment={deployment}
            scenario={activeScenario}
            isApprovalModalOpen={isApprovalModalOpen}
            onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
            onApproveRollback={handleUserApproveRollback}
            onRejectApproval={handleRejectApproval}
            isExecutingRollback={isExecutingRollback}
            thoughtStream={agentThoughtStream}
          />
        </div>
      </main>

      {/* Block 5: Modal Overlays */}
      {/* 1. Post-Mortem Incident Report Modal */}
      <PostMortemModal
        isOpen={isPostMortemOpen}
        onClose={() => setIsPostMortemOpen(false)}
        report={postMortem}
      />

      {/* 2. Agora Voice RTC Settings Modal */}
      <AgoraSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={isAudioMuted}
        onToggleMute={handleToggleAudioMute}
      />

      {/* 3. Human Approval Gate Modal */}
      <ApprovalGateModal
        isOpen={isApprovalModalOpen}
        scenario={activeScenario}
        targetVersion={deployment.previousStableVersion}
        targetCommit={deployment.previousStableCommit}
        currentCommit={deployment.currentCommit}
        onApprove={handleUserApproveRollback}
        onReject={handleRejectApproval}
        isExecutingRollback={isExecutingRollback}
      />
    </div>
  );
}
