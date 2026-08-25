export type IncidentState = 'HEALTHY' | 'INCIDENT' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED';

export type SpeakerRole = 'lead' | 'devops' | 'agent' | 'system';

export type ScenarioId =
  | 'scenario-1-bad-deploy'
  | 'scenario-2-memory-leak'
  | 'scenario-3-db-connection'
  | 'scenario-4-ci-broken-tests'
  | 'scenario-5-ddos-flood';

export interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAgent?: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  pingMs: number;
}

export interface TranscriptTurn {
  id: string;
  timestamp: string;
  speakerId: string;
  speakerName: string;
  role: SpeakerRole;
  avatar: string;
  text: string;
  isSpeaking?: boolean;
  isInterrupted?: boolean;
  interruptedBy?: string;
  toolCallReferenceId?: string;
  audioDurationSeconds?: number;
}

export type ToolType = 'read_only' | 'action';
export type ToolStatus = 'idle' | 'running' | 'requires_approval' | 'approved' | 'rejected' | 'completed' | 'failed';

export interface ToolCall {
  id: string;
  name:
    | 'get_metrics'
    | 'get_process_metrics'
    | 'get_recent_commits'
    | 'check_deployment'
    | 'rollback_deployment'
    | 'restart_service'
    | 'check_database_status'
    | 'scale_or_failover_db'
    | 'revert_commit'
    | 'apply_waf_rule';
  displayName: string;
  type: ToolType;
  status: ToolStatus;
  timestamp: string;
  latencyMs: number;
  inputParams: Record<string, any>;
  responseData: Record<string, any>;
  reasoning: string;
  associatedCommit?: string;
}

export interface ServiceMetrics {
  cpuUsage: number; // percentage e.g. 94.2
  errorRate: number; // percentage e.g. 48.7
  p99Latency: number; // ms e.g. 3420
  healthyPods: number;
  totalPods: number;
  rps: number; // requests per sec
  memoryUsage: number; // %
  httpStatus: 200 | 502 | 500;
  extraInfo?: string;
}

export interface Commit {
  hash: string;
  shortHash: string;
  author: string;
  authorAvatar: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  diffStat: { additions: number; deletions: number };
  isCulprit: boolean;
  branch: string;
  tag?: string;
}

export interface DeploymentInfo {
  currentVersion: string;
  currentCommit: string;
  previousStableVersion: string;
  previousStableCommit: string;
  lastDeployedAt: string;
  deployedBy: string;
  environment: 'production' | 'staging';
  status: 'healthy' | 'degraded' | 'rolling_back' | 'rolled_back';
  region: string;
  activePods: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  stage: IncidentState;
  type: 'alert' | 'agent' | 'tool' | 'approval' | 'recovery' | 'info';
  iconName?: string;
}

export interface PostIncidentReport {
  incidentId: string;
  serviceName: string;
  severity: 'P0 - CRITICAL' | 'P1 - HIGH' | 'P2 - MEDIUM';
  startedAt: string;
  resolvedAt: string;
  mttrMinutes: string;
  summary: string;
  detectedSymptoms: string[];
  investigationsPerformed: string[];
  rootCause: string;
  toolCallsExecuted: { tool: string; result: string }[];
  actionsTaken: string[];
  followUpTasks: { task: string; assignee: string; priority: string }[];
}

export interface DemoStep {
  stepIndex: number;
  name: string;
  stage: IncidentState;
  description: string;
  speaker?: {
    name: string;
    role: 'agent' | 'lead' | 'devops';
    text: string;
    isInterrupted?: boolean;
  };
  toolCallToTrigger?: ToolCall['name'];
  requiresHumanApproval?: boolean;
}

export interface IncidentScenario {
  id: ScenarioId;
  name: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  category: string;
  description: string;
  targetService: string;
  initialMetrics: ServiceMetrics;
  incidentMetrics: ServiceMetrics;
  recoveredMetrics: ServiceMetrics;
  commits: Commit[];
  deploymentInfo: DeploymentInfo;
  initialTimeline: TimelineEvent[];
  initialTranscript: TranscriptTurn[];
  demoSteps: DemoStep[];
  remediationType: 'rollback' | 'restart' | 'db_failover' | 'revert_commit' | 'waf_rule';
  remediationTitle: string;
  remediationDescription: string;
  remediationDetails: {
    current: string;
    target: string;
    actionLabel: string;
    safetyChecks: string[];
    executingMessage: string;
  };
  generatePostMortem: (durationMinutes?: string) => PostIncidentReport;
}
