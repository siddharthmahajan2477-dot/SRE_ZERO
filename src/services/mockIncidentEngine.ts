import {
  Commit,
  DemoStep,
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
} from '../types';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'agent-1',
    name: 'SRE-Zero',
    role: 'Autonomous AI Incident Commander (Agora RTC)',
    avatar: '🤖',
    isAgent: true,
    isSpeaking: false,
    isMuted: false,
    pingMs: 14,
  },
  {
    id: 'user-1',
    name: 'Alex Rivera',
    role: 'Lead SRE / Incident Commander',
    avatar: '👨‍💻',
    isSpeaking: false,
    isMuted: false,
    pingMs: 28,
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    role: 'Staff DevOps Engineer',
    avatar: '👩‍💻',
    isSpeaking: false,
    isMuted: false,
    pingMs: 32,
  },
];

// ==========================================
// SCENARIO 1: BAD DEPLOYMENT / 502 INGRESS
// ==========================================
export const SCENARIO_1_BAD_DEPLOY: IncidentScenario = {
  id: 'scenario-1-bad-deploy',
  name: 'Scenario 1 — Bad Deployment / HTTP 502 (Golden Path)',
  shortName: '1. Bad Deploy (502 Outage)',
  badge: 'P0 DEPLOY',
  badgeColor: '#C53030',
  category: 'Production Deploy',
  description: 'Regression in Redis connection pool limit in v2.14.3 causing 502 Bad Gateway storm. Staged rollback to v2.14.2.',
  targetService: 'api.production.acme.corp',
  initialMetrics: {
    cpuUsage: 14.8,
    errorRate: 0.04,
    p99Latency: 42,
    healthyPods: 32,
    totalPods: 32,
    rps: 4850,
    memoryUsage: 38.2,
    httpStatus: 200,
  },
  incidentMetrics: {
    cpuUsage: 94.6,
    errorRate: 48.7,
    p99Latency: 3420,
    healthyPods: 8,
    totalPods: 32,
    rps: 2100,
    memoryUsage: 91.4,
    httpStatus: 502,
  },
  recoveredMetrics: {
    cpuUsage: 16.2,
    errorRate: 0.02,
    p99Latency: 45,
    healthyPods: 32,
    totalPods: 32,
    rps: 4920,
    memoryUsage: 39.5,
    httpStatus: 200,
  },
  commits: [
    {
      hash: 'd8f3a19b88e147f9e802b1897d2e09b1894a7e21',
      shortHash: 'd8f3a19',
      author: 'sam-dev (Samir K.)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
      message: 'fix(auth): update session cache redis ttl config and connection pool limit',
      timestamp: '2026-08-25T13:14:02Z',
      relativeTime: '4 minutes ago',
      diffStat: { additions: 18, deletions: 6 },
      isCulprit: true,
      branch: 'main',
      tag: 'v2.14.3',
    },
    {
      hash: '9b21f04a621c1075be8c0678d10b77b1029c1983',
      shortHash: '9b21f04',
      author: 'elena-m (Elena Rostova)',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces',
      message: 'perf(api): optimize json serialization on /v1/checkout payload',
      timestamp: '2026-08-25T11:42:19Z',
      relativeTime: '1.5 hours ago',
      diffStat: { additions: 42, deletions: 12 },
      isCulprit: false,
      branch: 'main',
      tag: 'v2.14.2 (STABLE)',
    },
    {
      hash: '7c40e11893c52a0a20e2e9206b12a8019b817812',
      shortHash: '7c40e11',
      author: 'alex-sre (Alex Rivera)',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
      message: 'chore(deps): bump opentelemetry-sdk to 1.28.0',
      timestamp: '2026-08-25T08:15:30Z',
      relativeTime: '5 hours ago',
      diffStat: { additions: 5, deletions: 5 },
      isCulprit: false,
      branch: 'main',
    },
  ],
  deploymentInfo: {
    currentVersion: 'v2.14.3',
    currentCommit: 'd8f3a19',
    previousStableVersion: 'v2.14.2',
    previousStableCommit: '9b21f04',
    lastDeployedAt: '4 minutes ago (13:14:02 UTC)',
    deployedBy: 'GitHub Actions / CD pipeline #8942',
    environment: 'production',
    status: 'degraded',
    region: 'us-east-1 (N. Virginia)',
    activePods: 8,
  },
  initialTimeline: [
    {
      id: 'evt-1',
      timestamp: '13:14:10 UTC',
      title: 'Deployment v2.14.3 Completed',
      description: 'Automated CD rollout deployed commit d8f3a19 to production cluster.',
      stage: 'HEALTHY',
      type: 'info',
    },
    {
      id: 'evt-2',
      timestamp: '13:16:05 UTC',
      title: 'P0 Alert: 502 Bad Gateway Spike',
      description: 'Datadog & PagerDuty triggered: api.production.acme.corp error rate reached 48.7%.',
      stage: 'INCIDENT',
      type: 'alert',
    },
  ],
  initialTranscript: [
    {
      id: 'tr-1',
      timestamp: '13:16:08',
      speakerId: 'agent-1',
      speakerName: 'SRE-Zero',
      role: 'agent',
      avatar: '🤖',
      text: '🚨 Critical alert detected on api.production.acme.corp. Service error rate spiked to 48.7% with 502 Bad Gateway responses. Web container CPU is at 94.6%. I have joined the Agora war room.',
      isSpeaking: false,
    },
  ],
  demoSteps: [
    {
      stepIndex: 0,
      name: '1. Baseline Health',
      stage: 'HEALTHY',
      description: 'System operating normally with 200 OK responses, 42ms p99 latency, and all 32 pods healthy.',
    },
    {
      stepIndex: 1,
      name: '2. Incident Alert (502 Outage)',
      stage: 'INCIDENT',
      description: 'Critical alert triggers: HTTP 502 Bad Gateway errors spike to 48.7%, CPU surges to 94.6%.',
    },
    {
      stepIndex: 2,
      name: '3. SRE-Zero Joins Agora Call',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero initiates Agora voice connection and summarizes the alarm to the incident team.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Critical alert. The frontend is returning 502 errors. Web container CPU is at 94.6% and 24 pods are in CrashLoopBackOff.',
      },
    },
    {
      stepIndex: 3,
      name: '4. Voice Inquiry: Inspect Metrics',
      stage: 'INVESTIGATING',
      description: 'Alex asks for system telemetry; SRE-Zero calls get_metrics() and narrates findings.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'SRE-Zero, query the latest cluster metrics and error logs.',
      },
      toolCallToTrigger: 'get_metrics',
    },
    {
      stepIndex: 4,
      name: '5. Interruption / Barge-in: Check Commits',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero starts explaining metrics logs, but Sarah interrupts ("Stop. Just check recent commits."). SRE-Zero handles barge-in and calls get_recent_commits().',
      speaker: {
        name: 'Sarah Chen',
        role: 'devops',
        text: 'Stop. Just check what changed in recent commits.',
        isInterrupted: true,
      },
      toolCallToTrigger: 'get_recent_commits',
    },
    {
      stepIndex: 5,
      name: '6. Check Deployment & Stage Rollback',
      stage: 'MITIGATING',
      description: 'SRE-Zero verifies deployment v2.14.3 was deployed 4m ago and stages rollback to v2.14.2.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Identified culprit commit d8f3a19 in deployment v2.14.3. I have prepared a rollback to stable release v2.14.2. Approval is required before execution.',
      },
      toolCallToTrigger: 'check_deployment',
      requiresHumanApproval: true,
    },
    {
      stepIndex: 6,
      name: '7. Human Approval Gate',
      stage: 'MITIGATING',
      description: 'Lead SRE approves the staged rollback via voice or UI button.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'Rollback approved. Execute rollback to v2.14.2 immediately.',
      },
      toolCallToTrigger: 'rollback_deployment',
    },
    {
      stepIndex: 7,
      name: '8. Recovery & Post-Mortem',
      stage: 'RESOLVED',
      description: 'Rollback completes, pods recover, website flips to 200 OK, and structured post-mortem is generated.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Rollback to v2.14.2 successful. All 32 pods healthy, error rate dropped to 0.02%, and website status is 200 OK. Incident resolved.',
      },
    },
  ],
  remediationType: 'rollback',
  remediationTitle: 'Authorize Kubernetes Rollback (v2.14.2)',
  remediationDescription: 'SRE-Zero has staged an automated infrastructure rollback action. Operator authorization is required:',
  remediationDetails: {
    current: 'v2.14.3 (d8f3a19)',
    target: 'v2.14.2 (9b21f04)',
    actionLabel: 'Authorize & Rollback (v2.14.2)',
    safetyChecks: [
      'Stateless change: 0 DB schema migrations required',
      'Container image api-gateway:v2.14.2 pre-cached across nodes',
      'Zero-downtime rolling drain window estimated: 14-18 seconds',
    ],
    executingMessage: 'Executing Kubernetes Rollback & Pod Drain...',
  },
  generatePostMortem: (durationMinutes: string = '4m 18s') => ({
    incidentId: 'INC-2026-8942',
    serviceName: 'api.production.acme.corp (Auth & Checkout Gateway)',
    severity: 'P0 - CRITICAL',
    startedAt: '13:16:05 UTC',
    resolvedAt: '13:20:23 UTC',
    mttrMinutes: durationMinutes,
    summary:
      'Production API gateway experienced a 48.7% failure rate with 502 Bad Gateway responses following automated deployment v2.14.3. SRE-Zero autonomous AI joined the Agora war room, retrieved live telemetry and source commits, identified Redis pool starvation in commit d8f3a19, and staged a human-approved rollback to v2.14.2, restoring full system health.',
    detectedSymptoms: [
      'HTTP 502 Bad Gateway spike affecting 48.7% of public inbound requests.',
      'Web container CPU surged to 94.6% due to thread starvation and blocking connection retries.',
      '24 out of 32 Kubernetes gateway pods entered CrashLoopBackOff state.',
    ],
    investigationsPerformed: [
      'get_metrics(): Verified pod status and isolated RedisConnectionPoolTimeout exceptions.',
      'get_recent_commits(): Discovered commit d8f3a19 modifying connection pool max limits.',
      'check_deployment(): Correlated deployment CD-8942 timing (13:14:02 UTC) with outage onset (13:16:05 UTC).',
    ],
    rootCause:
      'Commit d8f3a19 inadvertently reduced the Redis connection pool max_connections parameter from 500 to 20 while decreasing TTL, causing immediate socket exhaustion under normal peak production traffic (4,850 RPS).',
    toolCallsExecuted: [
      { tool: 'get_metrics', result: '94.6% CPU, 48.7% Error Rate, Redis timeout identified' },
      { tool: 'get_recent_commits', result: 'Flagged culprit commit d8f3a19 (sam-dev)' },
      { tool: 'check_deployment', result: 'Verified v2.14.3 deployment and staged v2.14.2 target' },
      { tool: 'rollback_deployment', result: 'Rolled back to v2.14.2 with human approval in 14.8s' },
    ],
    actionsTaken: [
      'Staged rollback to previous stable release v2.14.2 (commit 9b21f04).',
      'Presented explicit Human Approval Gate to Lead SRE Alex Rivera.',
      'Executed Kubernetes rollback via safe mock webhook.',
      'Confirmed synthetic traffic and live health probes returned HTTP 200 OK (0.02% error rate).',
    ],
    followUpTasks: [
      { task: 'Add integration test in CI to validate Redis connection pool sizing under load', assignee: 'Sarah Chen (DevOps)', priority: 'P0' },
      { task: 'Add configuration linting rule preventing max_connections < 100 in production', assignee: 'Samir K. (Backend)', priority: 'P1' },
      { task: 'Tune Prometheus alert thresholds for Redis client pool saturation', assignee: 'Alex Rivera (Lead SRE)', priority: 'P2' },
    ],
  }),
};

// ===================================================
// SCENARIO 2: CPU SPIKE / MEMORY LEAK (NO BAD DEPLOY)
// ===================================================
export const SCENARIO_2_MEMORY_LEAK: IncidentScenario = {
  id: 'scenario-2-memory-leak',
  name: 'Scenario 2 — CPU Spike / Memory Leak (No Bad Deploy)',
  shortName: '2. Memory Leak (Pod Restart)',
  badge: 'MEM LEAK',
  badgeColor: '#D97706',
  category: 'Resource Exhaustion',
  description: 'Gradual heap fragmentation & buffer memory leak in long-running checkout worker (40m climb). Remediation: rolling restart.',
  targetService: 'checkout-worker.acme.corp',
  initialMetrics: {
    cpuUsage: 18.2,
    errorRate: 0.01,
    p99Latency: 52,
    healthyPods: 32,
    totalPods: 32,
    rps: 3800,
    memoryUsage: 42.0,
    httpStatus: 200,
    extraInfo: 'Heap: 412 MB / Uptime: 4d 18h',
  },
  incidentMetrics: {
    cpuUsage: 94.2,
    errorRate: 36.4,
    p99Latency: 4850,
    healthyPods: 6,
    totalPods: 32,
    rps: 1950,
    memoryUsage: 96.8,
    httpStatus: 500,
    extraInfo: 'Heap: 3.92 GB / OOMKill Pending',
  },
  recoveredMetrics: {
    cpuUsage: 14.5,
    errorRate: 0.01,
    p99Latency: 48,
    healthyPods: 32,
    totalPods: 32,
    rps: 4100,
    memoryUsage: 36.2,
    httpStatus: 200,
    extraInfo: 'Heap: 340 MB / Clean Restart',
  },
  commits: [
    {
      hash: 'a10b48f918471e9821a719c8172901b712398412',
      shortHash: 'a10b48f',
      author: 'ci-bot',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=faces',
      message: 'chore: automated weekly dependency security scan',
      timestamp: '2026-08-21T02:00:00Z',
      relativeTime: '4 days ago (No recent deploy)',
      diffStat: { additions: 0, deletions: 0 },
      isCulprit: false,
      branch: 'main',
      tag: 'v2.12.0',
    },
    {
      hash: 'f93c812a01928374829102938471829384712938',
      shortHash: 'f93c812',
      author: 'elena-m (Elena Rostova)',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces',
      message: 'feat(checkout): streaming order receipts payload buffering',
      timestamp: '2026-08-20T16:20:11Z',
      relativeTime: '5 days ago',
      diffStat: { additions: 64, deletions: 8 },
      isCulprit: true,
      branch: 'main',
      tag: 'v2.12.0',
    },
  ],
  deploymentInfo: {
    currentVersion: 'v2.12.0',
    currentCommit: 'a10b48f',
    previousStableVersion: 'v2.12.0',
    previousStableCommit: 'a10b48f',
    lastDeployedAt: '4 days ago (No recent release)',
    deployedBy: 'Release Manager (Stable cadence)',
    environment: 'production',
    status: 'degraded',
    region: 'us-east-1 (Worker Pool A)',
    activePods: 6,
  },
  initialTimeline: [
    {
      id: 'evt-m1',
      timestamp: '12:40:00 UTC',
      title: 'Memory Utilization Warning (75%)',
      description: 'Checkout-worker node heap allocations steadily growing over 40 minutes.',
      stage: 'HEALTHY',
      type: 'info',
    },
    {
      id: 'evt-m2',
      timestamp: '13:20:10 UTC',
      title: 'P0 Alert: High CPU & Memory Leak Exhaustion',
      description: 'CPU at 94.2%, memory at 96.8%. 26 worker pods terminated with OOMKilled status.',
      stage: 'INCIDENT',
      type: 'alert',
    },
  ],
  initialTranscript: [
    {
      id: 'tr-m1',
      timestamp: '13:20:15',
      speakerId: 'agent-1',
      speakerName: 'SRE-Zero',
      role: 'agent',
      avatar: '🤖',
      text: '🚨 Critical resource alarm on checkout-worker. CPU load is at 94.2% and memory reached 96.8%. No recent deployments detected in the last 4 days — this is progressive resource exhaustion.',
      isSpeaking: false,
    },
  ],
  demoSteps: [
    {
      stepIndex: 0,
      name: '1. Baseline Health',
      stage: 'HEALTHY',
      description: 'Worker service running normally before heap memory accumulation.',
    },
    {
      stepIndex: 1,
      name: '2. Memory Leak Alert',
      stage: 'INCIDENT',
      description: 'Prometheus fires: Memory hit 96.8%, 26 pods OOMKilled, p99 latency spiked to 4,850ms.',
    },
    {
      stepIndex: 2,
      name: '3. SRE-Zero Identifies Non-Deploy Issue',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero joins Agora and explains that no recent deploy occurred.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'CPU load is critically high on the checkout service. No recent deployment detected — this looks like resource exhaustion from a memory leak, not a bad release.',
      },
    },
    {
      stepIndex: 3,
      name: '4. Engineer Inquires on Process Memory',
      stage: 'INVESTIGATING',
      description: 'Alex asks what process is consuming memory; SRE-Zero calls get_process_metrics().',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'SRE-Zero, what is consuming the memory and heap inside those pods?',
      },
      toolCallToTrigger: 'get_process_metrics',
    },
    {
      stepIndex: 4,
      name: '5. SRE-Zero Identifies Buffer Leak',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero analyzes process telemetry: streaming order receipt buffer pool is retaining uncollected chunks.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Process checkout-worker.js is holding 3.8GB in Buffer objects from streaming receipt chunks. Garbage collection is unable to reclaim memory.',
      },
    },
    {
      stepIndex: 5,
      name: '6. Stage Rolling Pod Restart',
      stage: 'MITIGATING',
      description: 'Sarah asks to restart the service; SRE-Zero stages restart_service() with approval gate.',
      speaker: {
        name: 'Sarah Chen',
        role: 'devops',
        text: 'Restart the checkout worker service with a rolling restart.',
      },
      toolCallToTrigger: 'restart_service',
      requiresHumanApproval: true,
    },
    {
      stepIndex: 6,
      name: '7. Operator Approves Restart',
      stage: 'MITIGATING',
      description: 'Alex approves the rolling pod restart gate.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'Rolling restart approved. Restart all 32 checkout worker pods gracefully.',
      },
    },
    {
      stepIndex: 7,
      name: '8. Memory Normalized & Recovered',
      stage: 'RESOLVED',
      description: 'All 32 pods restart with clean heap state (340MB), CPU returns to 14.5%, incident resolved.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Rolling restart completed. All 32 checkout-worker pods healthy. Memory dropped to 36.2% and CPU normalized to 14.5%. Incident resolved.',
      },
    },
  ],
  remediationType: 'restart',
  remediationTitle: 'Authorize Rolling Pod Restart (checkout-worker)',
  remediationDescription: 'SRE-Zero has staged a graceful rolling pod restart to reclaim exhausted buffer memory. Operator authorization required:',
  remediationDetails: {
    current: 'Degraded Pods (6/32 Healthy - 96.8% Mem)',
    target: 'Fresh Pod Replicas (32/32 Healthy - 36% Mem)',
    actionLabel: 'Authorize Graceful Pod Restart',
    safetyChecks: [
      'Rolling update strategy: maxUnavailable: 25%, maxSurge: 25%',
      'Active Kafka consumer offsets will be rebalanced without message loss',
      'Readiness probes guaranteed before traffic ingestion',
    ],
    executingMessage: 'Executing Rolling Pod Restart & Heap Flush...',
  },
  generatePostMortem: (durationMinutes: string = '5m 12s') => ({
    incidentId: 'INC-2026-9104',
    serviceName: 'checkout-worker.acme.corp (Order Stream Workers)',
    severity: 'P1 - HIGH',
    startedAt: '13:20:10 UTC',
    resolvedAt: '13:25:22 UTC',
    mttrMinutes: durationMinutes,
    summary:
      'Checkout background worker pool experienced severe memory exhaustion and OOMKill cascade due to progressive buffer retention in long-running streaming order tasks. SRE-Zero verified no new deployments had occurred, executed get_process_metrics() to pinpoint 3.8GB uncollected Buffer allocations in checkout-worker.js, and staged a human-approved rolling pod restart, restoring 100% capacity.',
    detectedSymptoms: [
      'Node container memory reached 96.8% (3.92 GB heap ceiling).',
      '26 of 32 pods suffered OOMKilled pod restarts, causing backlog queue lag.',
      'Order processing p99 latency surged from 52ms to 4,850ms.',
    ],
    investigationsPerformed: [
      'Confirmed zero recent deployments in the last 96 hours.',
      'get_process_metrics(): Profiled Node.js V8 heap and isolated Buffer object leaks in streaming receipt emitter.',
    ],
    rootCause:
      'Streaming receipt generator retained un-flushed event listener buffers on high-throughput orders, accumulating ~95MB memory per hour until heap limits triggered kernel OOM termination.',
    toolCallsExecuted: [
      { tool: 'get_metrics', result: '94.2% CPU, 96.8% Memory, 26 pods OOMKilled' },
      { tool: 'get_process_metrics', result: 'Pinpointed 3.8GB buffer leak in checkout-worker.js' },
      { tool: 'restart_service', result: 'Executed rolling restart of 32 worker pods in 16.2s' },
    ],
    actionsTaken: [
      'Staged rolling restart of checkout-worker deployment.',
      'Obtained Human Sign-Off from Lead SRE Alex Rivera.',
      'Verified zero consumer lag and clean memory profile post-restart.',
    ],
    followUpTasks: [
      { task: 'Fix unclosed event stream listener in receipt generator module', assignee: 'Elena Rostova (Backend)', priority: 'P0' },
      { task: 'Configure Node --max-old-space-size and Prometheus memory rate-of-change alert', assignee: 'Sarah Chen (DevOps)', priority: 'P1' },
    ],
  }),
};

// ========================================================
// SCENARIO 3: CLOUD DATABASE CONNECTION POOL & REPLICA LAG
// ========================================================
export const SCENARIO_3_DB_CONNECTION: IncidentScenario = {
  id: 'scenario-3-db-connection',
  name: 'Scenario 3 — Cloud Database / Connection Pool & Replica Lag',
  shortName: '3. DB Pool & Replica Lag',
  badge: 'CLOUD DB',
  badgeColor: '#2563EB',
  category: 'Cloud Database',
  description: 'PostgreSQL connection pool maxed out (100/100) with 14.8s read replica lag. Remediation: scale pool & promote replica.',
  targetService: 'postgres-primary.cluster.internal',
  initialMetrics: {
    cpuUsage: 22.4,
    errorRate: 0.02,
    p99Latency: 38,
    healthyPods: 32,
    totalPods: 32,
    rps: 4600,
    memoryUsage: 45.0,
    httpStatus: 200,
    extraInfo: 'DB Pool: 24/100 | Lag: 0.8ms',
  },
  incidentMetrics: {
    cpuUsage: 88.6,
    errorRate: 42.1,
    p99Latency: 3950,
    healthyPods: 32,
    totalPods: 32,
    rps: 2400,
    memoryUsage: 78.4,
    httpStatus: 500,
    extraInfo: 'DB Pool: 100/100 (EXHAUSTED) | Lag: 14.8s',
  },
  recoveredMetrics: {
    cpuUsage: 18.0,
    errorRate: 0.01,
    p99Latency: 35,
    healthyPods: 32,
    totalPods: 32,
    rps: 4750,
    memoryUsage: 44.2,
    httpStatus: 200,
    extraInfo: 'DB Pool: 32/500 | Lag: 1.1ms (Standby Active)',
  },
  commits: [
    {
      hash: 'e8192a0182748192038471928374918273948192',
      shortHash: 'e8192a0',
      author: 'alex-sre',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
      message: 'infra: update db replica health check probe interval',
      timestamp: '2026-08-24T18:00:00Z',
      relativeTime: '18 hours ago',
      diffStat: { additions: 4, deletions: 4 },
      isCulprit: false,
      branch: 'main',
    },
  ],
  deploymentInfo: {
    currentVersion: 'v2.14.0',
    currentCommit: 'e8192a0',
    previousStableVersion: 'v2.14.0',
    previousStableCommit: 'e8192a0',
    lastDeployedAt: '18 hours ago',
    deployedBy: 'Infra Automation',
    environment: 'production',
    status: 'degraded',
    region: 'us-east-1 (Aurora / Cloud SQL Pool)',
    activePods: 32,
  },
  initialTimeline: [
    {
      id: 'evt-db1',
      timestamp: '13:05:00 UTC',
      title: 'Database Read Replica Lag Alert (5s)',
      description: 'Replication lag between primary and replica-02 breached 5,000ms threshold.',
      stage: 'HEALTHY',
      type: 'info',
    },
    {
      id: 'evt-db2',
      timestamp: '13:10:14 UTC',
      title: 'P0 Alert: DB Connection Pool Saturated (100/100)',
      description: 'All 100 backend PostgreSQL connections exhausted. App queries throwing ConnectionTimeout.',
      stage: 'INCIDENT',
      type: 'alert',
    },
  ],
  initialTranscript: [
    {
      id: 'tr-db1',
      timestamp: '13:10:18',
      speakerId: 'agent-1',
      speakerName: 'SRE-Zero',
      role: 'agent',
      avatar: '🤖',
      text: '🚨 Database connection errors spiking. The application pods are running, but PostgreSQL connection pool is maxed at 100/100 with elevated read replica lag.',
      isSpeaking: false,
    },
  ],
  demoSteps: [
    {
      stepIndex: 0,
      name: '1. Baseline Health',
      stage: 'HEALTHY',
      description: 'Cloud SQL database cluster operating normally with pool at 24% capacity.',
    },
    {
      stepIndex: 1,
      name: '2. DB Connection Alarm',
      stage: 'INCIDENT',
      description: 'Connection pool hits 100/100, read queries timeout, error rate surges to 42.1%.',
    },
    {
      stepIndex: 2,
      name: '3. SRE-Zero Identifies Database Layer',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero joins Agora and clarifies that the app pods are healthy but the DB pool is exhausted.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'The application layer looks healthy, but the database is rejecting new connections. This looks like a connection pool saturation and read replica lag issue, not the app itself.',
      },
    },
    {
      stepIndex: 3,
      name: '4. Engineer Inquires on Replica Status',
      stage: 'INVESTIGATING',
      description: 'Sarah asks SRE-Zero to check the database and replica status; SRE-Zero calls check_database_status().',
      speaker: {
        name: 'Sarah Chen',
        role: 'devops',
        text: 'Check the database replica lag and active connection pool status.',
      },
      toolCallToTrigger: 'check_database_status',
    },
    {
      stepIndex: 4,
      name: '5. SRE-Zero Reports Lock Contention',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero details that primary is suffering from client socket exhaustion and replica lag reached 14.8s.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Database metrics confirmed: active connections are 100 of 100 max limit. Read replica-02 has 14.8 seconds replication lag due to a long-running unindexed analytics transaction.',
      },
    },
    {
      stepIndex: 5,
      name: '6. Stage DB Failover & Pool Scale',
      stage: 'MITIGATING',
      description: 'Alex asks to scale the pool and failover to standby replica; SRE-Zero stages scale_or_failover_db().',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'Scale the connection pool to 500 and promote the healthy standby replica immediately.',
      },
      toolCallToTrigger: 'scale_or_failover_db',
      requiresHumanApproval: true,
    },
    {
      stepIndex: 6,
      name: '7. Operator Approves DB Mitigation Gate',
      stage: 'MITIGATING',
      description: 'Alex approves the database failover and PgBouncer pool scaling.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'Database failover and pool scaling approved. Execute action.',
      },
    },
    {
      stepIndex: 7,
      name: '8. Database Recovered & Connections Normal',
      stage: 'RESOLVED',
      description: 'PgBouncer connection pool scaled to 500, standby replica promoted, error rate drops to 0.01%.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Database mitigation completed. Connection pool scaled to 500, standby promoted to primary. Replica lag dropped to 1.1ms and error rate is 0.01%. System restored.',
      },
    },
  ],
  remediationType: 'db_failover',
  remediationTitle: 'Authorize Database Pool Scaling (500) & Replica Promotion',
  remediationDescription: 'SRE-Zero has staged an automated database scaling and standby replica failover. Operator authorization required:',
  remediationDetails: {
    current: 'Pool Exhausted (100/100) • Lag: 14.8s',
    target: 'Scaled Pool (500 max) • Standby Primary Active',
    actionLabel: 'Authorize DB Scaling & Failover',
    safetyChecks: [
      'PgBouncer connection pool dynamic resize to 500 without restarting DB instance',
      'Standby replica-01 wal_replay verified zero data loss (0 byte delta)',
      'DNS alias failover automated TTL: 2 seconds',
    ],
    executingMessage: 'Promoting Standby Replica & Resizing PgBouncer Pool...',
  },
  generatePostMortem: (durationMinutes: string = '4m 30s') => ({
    incidentId: 'INC-2026-9420',
    serviceName: 'postgres-primary.cluster.internal (Cloud SQL Cluster)',
    severity: 'P0 - CRITICAL',
    startedAt: '13:10:14 UTC',
    resolvedAt: '13:14:44 UTC',
    mttrMinutes: durationMinutes,
    summary:
      'Production PostgreSQL cluster connection pool hit 100% saturation (100/100) causing cascading application connection timeouts (42.1% error rate). SRE-Zero autonomous AI verified app pods were healthy, executed check_database_status() to diagnose replica lag and socket starvation, and staged a human-approved PgBouncer pool scale to 500 plus standby promotion, restoring full read/write throughput.',
    detectedSymptoms: [
      'PostgreSQL connection pool exhausted at 100 max connections.',
      '42.1% of API calls timed out awaiting database socket acquisition.',
      'Replica replication lag degraded to 14.8 seconds.',
    ],
    investigationsPerformed: [
      'check_database_status(): Queried pg_stat_activity and isolated blocking analytics query on orders table.',
      'Verified zero app container crashes, confirming pure infra/data layer issue.',
    ],
    rootCause:
      'An un-sandboxed BI report query acquired shared table locks while connection pooling configuration on PgBouncer was constrained to 100 total client connections under 4,600 RPS load.',
    toolCallsExecuted: [
      { tool: 'get_metrics', result: '88.6% CPU, 42.1% Error Rate, DB timeouts' },
      { tool: 'check_database_status', result: '100/100 connections maxed, 14.8s replica lag' },
      { tool: 'scale_or_failover_db', result: 'Scaled pool to 500, promoted standby replica in 8.4s' },
    ],
    actionsTaken: [
      'Scaled PgBouncer client pool size to 500 connections.',
      'Promoted synchronized standby replica-01 to primary.',
      'Terminated blocking long-running query PID 49201.',
    ],
    followUpTasks: [
      { task: 'Route all analytics queries to read-only dedicated replica with statement_timeout = 30s', assignee: 'Sarah Chen (DevOps)', priority: 'P0' },
      { task: 'Permanently increase baseline PgBouncer pool limits in Terraform infrastructure', assignee: 'Alex Rivera (Lead SRE)', priority: 'P1' },
    ],
  }),
};

// =============================================================
// SCENARIO 4: FAILING TEST SUITE / BAD MERGE BLOCKING CI (TEST)
// =============================================================
export const SCENARIO_4_CI_BROKEN_TESTS: IncidentScenario = {
  id: 'scenario-4-ci-broken-tests',
  name: 'Scenario 4 — Failing Test Suite / Bad Merge Blocking CI',
  shortName: '4. CI Broken Tests (Revert PR)',
  badge: 'CI / CD',
  badgeColor: '#7C3AED',
  category: 'CI/CD Pipeline',
  description: 'Merged PR #482 broke auth unit test suite (3 of 42 failing), blocking master release pipeline. Remediation: git revert merge.',
  targetService: 'github.com/acme-corp/api-gateway [CI Pipeline]',
  initialMetrics: {
    cpuUsage: 8.5,
    errorRate: 0.0,
    p99Latency: 28,
    healthyPods: 32,
    totalPods: 32,
    rps: 3200,
    memoryUsage: 32.0,
    httpStatus: 200,
    extraInfo: 'CI: 42/42 Tests Passing (All Green)',
  },
  incidentMetrics: {
    cpuUsage: 12.0,
    errorRate: 0.0,
    p99Latency: 30,
    healthyPods: 32,
    totalPods: 32,
    rps: 3200,
    memoryUsage: 34.0,
    httpStatus: 200,
    extraInfo: 'CI: 3/42 Tests FAILING (Pipeline Blocked)',
  },
  recoveredMetrics: {
    cpuUsage: 8.4,
    errorRate: 0.0,
    p99Latency: 28,
    healthyPods: 32,
    totalPods: 32,
    rps: 3200,
    memoryUsage: 32.0,
    httpStatus: 200,
    extraInfo: 'CI: 42/42 Tests Passing (Pipeline Unblocked)',
  },
  commits: [
    {
      hash: 'c49a172819038471928374918273948192837491',
      shortHash: 'c49a172',
      author: 'dev-jordan (Jordan Vance)',
      authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop&crop=faces',
      message: 'refactor(auth): PR #482 JWT token claims verification & custom header validation',
      timestamp: '2026-08-25T13:08:00Z',
      relativeTime: '6 minutes ago',
      diffStat: { additions: 84, deletions: 28 },
      isCulprit: true,
      branch: 'main',
      tag: 'PR #482 (MERGED)',
    },
    {
      hash: 'b192837491827394819283749182739481928374',
      shortHash: 'b192837',
      author: 'elena-m',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces',
      message: 'test: add mock fixtures for rate limiter integration tests',
      timestamp: '2026-08-25T11:00:00Z',
      relativeTime: '2 hours ago',
      diffStat: { additions: 32, deletions: 4 },
      isCulprit: false,
      branch: 'main',
    },
  ],
  deploymentInfo: {
    currentVersion: 'CI Build #10842 (Blocked)',
    currentCommit: 'c49a172',
    previousStableVersion: 'CI Build #10841 (Passed)',
    previousStableCommit: 'b192837',
    lastDeployedAt: '6 minutes ago (PR #482 merge)',
    deployedBy: 'GitHub Actions CI Matrix',
    environment: 'staging',
    status: 'degraded',
    region: 'CI Runner Fleet us-east-1',
    activePods: 32,
  },
  initialTimeline: [
    {
      id: 'evt-ci1',
      timestamp: '13:08:10 UTC',
      title: 'PR #482 Merged into Main',
      description: 'Jordan Vance merged "refactor(auth): JWT token claims verification".',
      stage: 'HEALTHY',
      type: 'info',
    },
    {
      id: 'evt-ci2',
      timestamp: '13:10:02 UTC',
      title: 'CI Build Failure Alert: 3 Unit Tests Broken',
      description: 'GitHub Actions pipeline failed on main branch. Deployments to staging & prod locked.',
      stage: 'INCIDENT',
      type: 'alert',
    },
  ],
  initialTranscript: [
    {
      id: 'tr-ci1',
      timestamp: '13:10:06',
      speakerId: 'agent-1',
      speakerName: 'SRE-Zero',
      role: 'agent',
      avatar: '🤖',
      text: '⚠️ CI pipeline failure on main branch. 3 of 42 tests are failing since the last merge of PR #482. Release queue is blocked.',
      isSpeaking: false,
    },
  ],
  demoSteps: [
    {
      stepIndex: 0,
      name: '1. Baseline CI Health',
      stage: 'HEALTHY',
      description: 'Continuous integration pipeline green with 42/42 passing tests.',
    },
    {
      stepIndex: 1,
      name: '2. CI Build Break Alert',
      stage: 'INCIDENT',
      description: 'CI workflow fails on main: 3 auth unit tests broken after PR #482 merge.',
    },
    {
      stepIndex: 2,
      name: '3. SRE-Zero Analyzes CI Pipeline',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero joins Agora call and isolates the test failures to auth module PR #482.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'The failing tests all touch the auth module. They started failing immediately after PR #482 was merged by Jordan Vance.',
      },
    },
    {
      stepIndex: 3,
      name: '4. Engineer Inquires on PR Diff',
      stage: 'INVESTIGATING',
      description: 'Alex asks what changed in PR #482; SRE-Zero calls get_recent_commits() to correlate AST diff with broken tests.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'SRE-Zero, what changed in PR #482 that broke the test suite?',
      },
      toolCallToTrigger: 'get_recent_commits',
    },
    {
      stepIndex: 4,
      name: '5. SRE-Zero Identifies Breaking Signature',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero explains that PR #482 altered TokenValidator.Verify() signature without updating test mocks.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Commit c49a172 modified TokenValidator.Verify() to require a non-nil ClaimsContext argument, causing TestJWTExpiry, TestClaimsAudience, and TestTokenRevocation to panic with null pointer errors.',
      },
    },
    {
      stepIndex: 5,
      name: '6. Stage Revert of PR #482',
      stage: 'MITIGATING',
      description: 'Sarah asks to revert the merge PR; SRE-Zero stages revert_commit() with approval gate.',
      speaker: {
        name: 'Sarah Chen',
        role: 'devops',
        text: 'Revert that merge PR immediately so we can unblock the release pipeline.',
      },
      toolCallToTrigger: 'revert_commit',
      requiresHumanApproval: true,
    },
    {
      stepIndex: 6,
      name: '7. Operator Approves Git Revert',
      stage: 'MITIGATING',
      description: 'Alex approves the automated git revert PR.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'Revert approved. Revert PR #482 and trigger CI pipeline re-run.',
      },
    },
    {
      stepIndex: 7,
      name: '8. CI Pipeline Green & Unblocked',
      stage: 'RESOLVED',
      description: 'Git revert merged, test suite passes 42/42, staging deployment pipeline resumed.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Revert commit merged to main. CI build #10843 completed successfully with 42 of 42 tests passing. Pipeline unblocked.',
      },
    },
  ],
  remediationType: 'revert_commit',
  remediationTitle: 'Authorize Automated Git Revert (PR #482 / commit c49a172)',
  remediationDescription: 'SRE-Zero has staged an automated Git Revert PR to restore green CI status. Operator authorization required:',
  remediationDetails: {
    current: 'Main Branch Broken (PR #482 / c49a172)',
    target: 'Reverted Clean State (commit b192837)',
    actionLabel: 'Authorize Git Revert PR',
    safetyChecks: [
      'Clean 3-way merge revert with zero conflict markers',
      'Automated branch protection override with audit trace',
      'Instant trigger of CI matrix re-validation upon push',
    ],
    executingMessage: 'Creating Revert Commit & Triggering CI Pipeline...',
  },
  generatePostMortem: (durationMinutes: string = '3m 45s') => ({
    incidentId: 'INC-2026-9630',
    serviceName: 'github.com/acme-corp/api-gateway (CI Pipeline Test Suite)',
    severity: 'P2 - MEDIUM',
    startedAt: '13:10:02 UTC',
    resolvedAt: '13:13:47 UTC',
    mttrMinutes: durationMinutes,
    summary:
      'Continuous Integration pipeline on main branch was blocked following the merge of PR #482, resulting in 3 failing unit tests in the auth verification suite. SRE-Zero autonomous AI joined the Agora war room, correlated the commit AST diff with failing tests via get_recent_commits(), and staged a human-approved Git revert commit, unblocking the deployment queue in under 4 minutes.',
    detectedSymptoms: [
      'GitHub Actions workflow failed on main branch.',
      '3 of 42 unit tests failed with NullPointerException in TokenValidator.',
      'All automated deployments to staging and production blocked.',
    ],
    investigationsPerformed: [
      'get_recent_commits(): Extracted PR #482 diff and correlated breaking function signature with test mock fixtures.',
    ],
    rootCause:
      'PR #482 changed TokenValidator.Verify() parameter requirements without updating existing test fixtures, which slipped through due to a loose pre-merge lint filter.',
    toolCallsExecuted: [
      { tool: 'get_metrics', result: 'CI Build Failed: 3/42 tests failing' },
      { tool: 'get_recent_commits', result: 'Identified culprit PR #482 (Jordan Vance)' },
      { tool: 'revert_commit', result: 'Created & merged revert commit in 6.8s' },
    ],
    actionsTaken: [
      'Staged automated Git revert commit for PR #482.',
      'Obtained Human Sign-Off from Lead SRE Alex Rivera.',
      'Pushed revert commit and verified CI pipeline passed 42/42 tests.',
    ],
    followUpTasks: [
      { task: 'Enforce required PR status checks on test mock compatibility', assignee: 'Jordan Vance (Backend)', priority: 'P1' },
      { task: 'Add pre-commit hook running full auth test suite locally', assignee: 'Sarah Chen (DevOps)', priority: 'P2' },
    ],
  }),
};

// ========================================================
// SCENARIO 5: DISTRIBUTED L7 DDOS / ANOMALOUS BOT FLOOD
// ========================================================
export const SCENARIO_5_DDOS_FLOOD: IncidentScenario = {
  id: 'scenario-5-ddos-flood',
  name: 'Scenario 5 — Distributed L7 DDoS / Bot Flood (WAF Rule)',
  shortName: '5. DDoS Bot Flood (WAF Rule)',
  badge: 'WAF / DDOS',
  badgeColor: '#EC4899',
  category: 'Network / Security',
  description: '18,500 RPS scraper burst on /api/v1/auth/token exhausting rate limiters. Remediation: Edge WAF rule on ASN 14061.',
  targetService: 'cloudflare-edge.acme.corp (WAF Layer)',
  initialMetrics: {
    cpuUsage: 16.0,
    errorRate: 0.01,
    p99Latency: 40,
    healthyPods: 32,
    totalPods: 32,
    rps: 4200,
    memoryUsage: 38.0,
    httpStatus: 200,
    extraInfo: 'Inbound: 4.2k RPS | Edge WAF: Clear',
  },
  incidentMetrics: {
    cpuUsage: 91.5,
    errorRate: 54.2,
    p99Latency: 4200,
    healthyPods: 14,
    totalPods: 32,
    rps: 18500,
    memoryUsage: 89.0,
    httpStatus: 502,
    extraInfo: 'Inbound: 18.5k RPS (FLOOD) | ASN 14061',
  },
  recoveredMetrics: {
    cpuUsage: 15.8,
    errorRate: 0.01,
    p99Latency: 42,
    healthyPods: 32,
    totalPods: 32,
    rps: 4350,
    memoryUsage: 37.5,
    httpStatus: 200,
    extraInfo: 'Inbound: 4.3k RPS | Edge WAF: Dropping 14.2k RPS',
  },
  commits: [
    {
      hash: 'f182739481928374918273948192837491827394',
      shortHash: 'f182739',
      author: 'sec-ops',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
      message: 'sec: update edge TLS 1.3 cipher suites',
      timestamp: '2026-08-23T10:00:00Z',
      relativeTime: '2 days ago',
      diffStat: { additions: 2, deletions: 2 },
      isCulprit: false,
      branch: 'main',
    },
  ],
  deploymentInfo: {
    currentVersion: 'v2.14.0',
    currentCommit: 'f182739',
    previousStableVersion: 'v2.14.0',
    previousStableCommit: 'f182739',
    lastDeployedAt: '2 days ago',
    deployedBy: 'Security Team',
    environment: 'production',
    status: 'degraded',
    region: 'Global Anycast CDN',
    activePods: 14,
  },
  initialTimeline: [
    {
      id: 'evt-wf1',
      timestamp: '13:12:00 UTC',
      title: 'Traffic Ingress Spike (10k RPS)',
      description: 'Anomalous traffic surge observed across North American edge points of presence.',
      stage: 'HEALTHY',
      type: 'info',
    },
    {
      id: 'evt-wf2',
      timestamp: '13:14:15 UTC',
      title: 'P0 Alert: Rate Limiter Breach & 502 Outage (18.5k RPS)',
      description: 'L7 bot flood targeting /api/v1/auth/token exhausted edge workers. Legitimate traffic failing.',
      stage: 'INCIDENT',
      type: 'alert',
    },
  ],
  initialTranscript: [
    {
      id: 'tr-wf1',
      timestamp: '13:14:20',
      speakerId: 'agent-1',
      speakerName: 'SRE-Zero',
      role: 'agent',
      avatar: '🤖',
      text: '🚨 Critical traffic surge detected. Inbound request rate spiked to 18,500 RPS with 54.2% error rate. Ingress rate limiters are saturated by an anomalous bot flood.',
      isSpeaking: false,
    },
  ],
  demoSteps: [
    {
      stepIndex: 0,
      name: '1. Baseline Health',
      stage: 'HEALTHY',
      description: 'Normal traffic profile with 4,200 RPS and nominal latency.',
    },
    {
      stepIndex: 1,
      name: '2. DDoS Attack Alarm',
      stage: 'INCIDENT',
      description: 'Inbound requests surge to 18,500 RPS, error rate reaches 54.2%.',
    },
    {
      stepIndex: 2,
      name: '3. SRE-Zero Analyzes Traffic Pattern',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero joins Agora and explains that 84% of requests originate from a distributed botnet ASN.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Anomalous traffic spike detected. Inbound RPS reached 18,500 with 84% traffic originating from ASN 14061 scrapers targeting /api/v1/auth/token.',
      },
    },
    {
      stepIndex: 3,
      name: '4. Engineer Inquires on Bot Signature',
      stage: 'INVESTIGATING',
      description: 'Alex asks for detailed IP & ASN traffic profiling; SRE-Zero calls get_metrics().',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'SRE-Zero, isolate the source ASN and endpoint target of the flood.',
      },
      toolCallToTrigger: 'get_metrics',
    },
    {
      stepIndex: 4,
      name: '5. SRE-Zero Proposes Edge WAF Rule',
      stage: 'INVESTIGATING',
      description: 'SRE-Zero reports ASN 14061 is generating 14,200 malicious RPS with forged User-Agents.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'Telemetry confirms ASN 14061 is sending 14,200 invalid auth token requests per second. I can apply an immediate Edge WAF rate-limiting rule to drop this ASN.',
      },
    },
    {
      stepIndex: 5,
      name: '6. Stage WAF Rate Limiting Rule',
      stage: 'MITIGATING',
      description: 'Sarah asks to deploy the WAF rule; SRE-Zero stages apply_waf_rule().',
      speaker: {
        name: 'Sarah Chen',
        role: 'devops',
        text: 'Deploy the WAF rate limit rule to block ASN 14061 at the edge.',
      },
      toolCallToTrigger: 'apply_waf_rule',
      requiresHumanApproval: true,
    },
    {
      stepIndex: 6,
      name: '7. Operator Approves WAF Mitigation',
      stage: 'MITIGATING',
      description: 'Alex approves the Edge WAF rate-limiting rule.',
      speaker: {
        name: 'Alex Rivera',
        role: 'lead',
        text: 'WAF rule approved. Apply rate limit on ASN 14061 across all edge PoPs.',
      },
    },
    {
      stepIndex: 7,
      name: '8. Attack Mitigated & System Healthy',
      stage: 'RESOLVED',
      description: 'WAF rule active in 2.8s, 14.2k malicious requests dropped at edge, legitimate error rate drops to 0.01%.',
      speaker: {
        name: 'SRE-Zero',
        role: 'agent',
        text: 'WAF mitigation rule deployed across 280 edge locations. 14,200 RPS malicious bot requests dropped. Inbound traffic normalized to 4,350 RPS and error rate is 0.01%.',
      },
    },
  ],
  remediationType: 'waf_rule',
  remediationTitle: 'Authorize Edge WAF Rate Limiting Rule (ASN 14061)',
  remediationDescription: 'SRE-Zero has staged an automated Edge WAF rule to drop malicious bot traffic. Operator authorization required:',
  remediationDetails: {
    current: 'Flooded Edge (18,500 RPS • 54% 502s)',
    target: 'Protected Edge (ASN 14061 Dropped • 4,350 RPS)',
    actionLabel: 'Authorize Edge WAF Rule',
    safetyChecks: [
      'Edge propagation latency: < 3.0 seconds across 280 Anycast PoPs',
      'Verified zero internal corporate CIDRs or partner APIs in ASN 14061',
      'Managed challenge mode enabled for ambiguous traffic (0 legitimate drops)',
    ],
    executingMessage: 'Deploying Edge WAF Rate-Limiting Filter...',
  },
  generatePostMortem: (durationMinutes: string = '3m 20s') => ({
    incidentId: 'INC-2026-9810',
    serviceName: 'cloudflare-edge.acme.corp (Edge WAF & Ingress)',
    severity: 'P0 - CRITICAL',
    startedAt: '13:14:15 UTC',
    resolvedAt: '13:17:35 UTC',
    mttrMinutes: durationMinutes,
    summary:
      'Edge ingress gateway suffered a distributed Layer-7 bot flood of 18,500 RPS targeting /api/v1/auth/token, saturating rate limiters and causing 54.2% failure rate for legitimate users. SRE-Zero autonomous AI joined the Agora war room, identified ASN 14061 as the source of 14,200 malicious RPS, and staged a human-approved Edge WAF rule, mitigating the attack in 3 minutes 20 seconds.',
    detectedSymptoms: [
      'Inbound RPS jumped from 4,200 to 18,500 RPS in under 90 seconds.',
      'Edge worker CPU reached 91.5% and rate limit queues overflowed.',
      '54.2% of legitimate API requests encountered HTTP 502/504 timeouts.',
    ],
    investigationsPerformed: [
      'get_metrics(): Analyzed Cloudflare CDN analytics and isolated ASN 14061 generating 84% of unauthorized token generation payloads.',
    ],
    rootCause:
      'Distributed credential stuffing and web scraper botnet originating from compromised commercial proxies in ASN 14061 with forged user-agent headers.',
    toolCallsExecuted: [
      { tool: 'get_metrics', result: '18,500 RPS flood, ASN 14061 isolated' },
      { tool: 'apply_waf_rule', result: 'Deployed edge rate limiter rule dropping 14.2k RPS' },
    ],
    actionsTaken: [
      'Staged Edge WAF rule to block/challenge ASN 14061 on /api/v1/auth/token.',
      'Obtained Human Sign-Off from Lead SRE Alex Rivera.',
      'Propagated rule globally in 2.8 seconds and verified recovery.',
    ],
    followUpTasks: [
      { task: 'Enable Cloudflare Bot Management ML Turnstile on all auth endpoints', assignee: 'Sarah Chen (DevOps)', priority: 'P0' },
      { task: 'Implement aggressive per-IP exponential backoff on failed token calls', assignee: 'Samir K. (Backend)', priority: 'P1' },
    ],
  }),
};

// ==========================================
// SCENARIOS REGISTRY
// ==========================================
export const ALL_INCIDENT_SCENARIOS: IncidentScenario[] = [
  SCENARIO_1_BAD_DEPLOY,
  SCENARIO_2_MEMORY_LEAK,
  SCENARIO_3_DB_CONNECTION,
  SCENARIO_4_CI_BROKEN_TESTS,
  SCENARIO_5_DDOS_FLOOD,
];

// Fallback exports for existing references
export const INITIAL_HEALTHY_METRICS = SCENARIO_1_BAD_DEPLOY.initialMetrics;
export const INCIDENT_FAILED_METRICS = SCENARIO_1_BAD_DEPLOY.incidentMetrics;
export const RECOVERED_METRICS = SCENARIO_1_BAD_DEPLOY.recoveredMetrics;
export const MOCK_COMMITS = SCENARIO_1_BAD_DEPLOY.commits;
export const INITIAL_DEPLOYMENT_INFO = SCENARIO_1_BAD_DEPLOY.deploymentInfo;
export const INITIAL_TIMELINE = SCENARIO_1_BAD_DEPLOY.initialTimeline;
export const INITIAL_TRANSCRIPT = SCENARIO_1_BAD_DEPLOY.initialTranscript;
export const DEMO_SCRIPT_STEPS = SCENARIO_1_BAD_DEPLOY.demoSteps;

// ==========================================
// TOOL CALL EXECUTION MOCKS
// ==========================================

export async function mockGetMetrics(scenarioId: ScenarioId = 'scenario-1-bad-deploy'): Promise<ToolCall> {
  const isS2 = scenarioId === 'scenario-2-memory-leak';
  const isS3 = scenarioId === 'scenario-3-db-connection';
  const isS4 = scenarioId === 'scenario-4-ci-broken-tests';
  const isS5 = scenarioId === 'scenario-5-ddos-flood';

  return {
    id: `tool-${Date.now()}-metrics`,
    name: 'get_metrics',
    displayName: 'get_metrics()',
    type: 'read_only',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 142,
    inputParams: {
      service: isS2 ? 'checkout-worker' : isS3 ? 'postgres-cluster' : isS4 ? 'ci-test-runner' : isS5 ? 'cloudflare-edge' : 'api.production.acme.corp',
      timeframe: 'now-15m',
      metrics: ['cpu_usage', 'error_rate', 'latency_p99', 'pod_status'],
    },
    responseData: isS2
      ? {
          status: 'CRITICAL_MEMORY',
          cpu_percent: 94.2,
          memory_percent: 96.8,
          heap_used_mb: 3920,
          oom_killed_pods: '26/32',
          cluster: 'prod-worker-pool-a',
        }
      : isS3
      ? {
          status: 'CRITICAL_DB_POOL',
          active_connections: '100/100 (100% MAX)',
          replica_lag_seconds: 14.8,
          error_rate_percent: 42.1,
          p99_latency_ms: 3950,
          cluster: 'aurora-pg-primary',
        }
      : isS4
      ? {
          status: 'CI_BUILD_FAILED',
          failed_tests: ['TestJWTClaimsExpiry', 'TestClaimsAudience', 'TestTokenRevocation'],
          passed_tests: '39/42',
          target_branch: 'main',
          culprit_pr: '#482',
        }
      : isS5
      ? {
          status: 'CRITICAL_L7_FLOOD',
          inbound_rps: 18500,
          baseline_rps: 4200,
          malicious_source_asn: 'AS14061 (DigitalOcean Scraper Subnet)',
          target_path: '/api/v1/auth/token',
          error_rate_5xx_percent: 54.2,
        }
      : {
          status: 'CRITICAL',
          cpu_percent: 94.6,
          error_rate_5xx_percent: 48.7,
          p99_latency_ms: 3420,
          healthy_pods: '8/32',
          pod_crash_reason: 'RedisConnectionPoolTimeout: [Errno 110] Connection timed out',
          cluster: 'prod-us-east-1-eks',
        },
    reasoning: isS2
      ? 'Queried Prometheus. Found 26 worker pods terminated due to V8 heap exhaustion (96.8% memory).'
      : isS3
      ? 'Queried CloudWatch RDS metrics. Found 100/100 max connections exhausted and 14.8s replication lag.'
      : isS4
      ? 'Queried GitHub Actions CI API. 3 tests failed with panic in auth module.'
      : isS5
      ? 'Queried Cloudflare Edge API. Detected 18,500 RPS L7 flood from ASN 14061.'
      : 'Queried Datadog Telemetry API. Found 24 pods in CrashLoopBackOff due to Redis pool exhaustion.',
  };
}

export async function mockGetProcessMetrics(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-process`,
    name: 'get_process_metrics',
    displayName: 'get_process_metrics()',
    type: 'read_only',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 195,
    inputParams: {
      pod_selector: 'app=checkout-worker',
      profile_depth: 'heap_objects',
    },
    responseData: {
      top_process: 'node --max-old-space-size=4096 checkout-worker.js',
      pid: 14,
      rss_memory_mb: 3980,
      v8_heap_total_mb: 3920,
      v8_heap_used_mb: 3840,
      largest_allocations: [
        { type: 'Buffer (Streaming Receipt Chunks)', size_mb: 3200, count: 48920 },
        { type: 'Closure / EventListener (Unclosed socket)', size_mb: 480, count: 18200 },
      ],
      gc_pause_ms_avg: 1840,
      leak_assessment: 'CONFIRMED: Progressive buffer chunk accumulation in streaming receipt generator',
    },
    reasoning: 'Profiled V8 heap allocations inside live container. Pinpointed 3.2GB uncollected Buffer objects in receipt streaming worker.',
  };
}

export async function mockGetRecentCommits(scenarioId: ScenarioId = 'scenario-1-bad-deploy'): Promise<ToolCall> {
  const isS4 = scenarioId === 'scenario-4-ci-broken-tests';

  return {
    id: `tool-${Date.now()}-commits`,
    name: 'get_recent_commits',
    displayName: 'get_recent_commits()',
    type: 'read_only',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 184,
    inputParams: {
      repo: 'acme-corp/api-gateway',
      branch: 'main',
      limit: 5,
    },
    responseData: isS4
      ? {
          recent_commits: [
            {
              hash: 'c49a172',
              author: 'dev-jordan',
              msg: 'refactor(auth): PR #482 JWT token claims verification & custom header validation',
              time: '6m ago',
              diff_summary: 'Changed TokenValidator.Verify(token) to TokenValidator.Verify(ctx, token)',
            },
            {
              hash: 'b192837',
              author: 'elena-m',
              msg: 'test: add mock fixtures for rate limiter integration tests',
              time: '2h ago',
            },
          ],
          culprit_candidate: 'c49a172',
          correlated_failing_tests: ['TestJWTClaimsExpiry', 'TestClaimsAudience', 'TestTokenRevocation'],
          correlation_score: 0.99,
        }
      : {
          recent_commits: [
            {
              hash: 'd8f3a19',
              author: 'sam-dev',
              msg: 'fix(auth): update session cache redis ttl config and connection pool limit',
              time: '4m ago',
              diff_summary: 'Reduced redis connection pool max_connections from 500 to 20, ttl from 3600 to 30',
            },
            {
              hash: '9b21f04',
              author: 'elena-m',
              msg: 'perf(api): optimize json serialization',
              time: '1.5h ago',
            },
          ],
          culprit_candidate: 'd8f3a19',
          correlation_score: 0.98,
        },
    reasoning: isS4
      ? 'Queried GitHub API. Commit c49a172 (PR #482) modified TokenValidator signature causing 3 unit test fixtures to panic.'
      : 'Queried GitHub API. Commit d8f3a19 directly modified Redis pool configuration 4m prior to incident onset.',
    associatedCommit: isS4 ? 'c49a172' : 'd8f3a19',
  };
}

export async function mockCheckDeployment(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-deployment`,
    name: 'check_deployment',
    displayName: 'check_deployment()',
    type: 'read_only',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 120,
    inputParams: {
      service: 'api-gateway',
      environment: 'production',
    },
    responseData: {
      active_release: 'v2.14.3',
      deployed_commit: 'd8f3a19',
      deployed_at: '13:14:02 UTC',
      pipeline_id: 'CD-8942',
      previous_stable_release: 'v2.14.2',
      previous_stable_commit: '9b21f04',
      rollback_supported: true,
      estimated_rollback_time_sec: 18,
    },
    reasoning: 'Queried ArgoCD / Kubernetes Deployment Controller. Previous release v2.14.2 is cached and ready for instant rollback.',
  };
}

export async function mockRollbackDeployment(commitHash: string = '9b21f04'): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-rollback`,
    name: 'rollback_deployment',
    displayName: 'rollback_deployment()',
    type: 'action',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 410,
    inputParams: {
      target_release: 'v2.14.2',
      target_commit: commitHash,
      service: 'api-gateway',
      strategy: 'canary_drain_and_switch',
      human_approval_signature: 'APPROVED_BY_ALEX_RIVERA',
    },
    responseData: {
      status: 'ROLLBACK_SUCCESSFUL',
      active_pods: '32/32 Healthy',
      previous_image: 'acme/api-gateway:v2.14.3',
      current_image: 'acme/api-gateway:v2.14.2',
      health_check_status: '200 OK across all replicas',
      traffic_drained_sec: 4.2,
      total_duration_sec: 14.8,
    },
    reasoning: 'Executed zero-downtime rollback to v2.14.2. Kubernetes pod replicas recovered and all health probes are passing.',
  };
}

export async function mockRestartService(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-restart`,
    name: 'restart_service',
    displayName: 'restart_service()',
    type: 'action',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 380,
    inputParams: {
      service: 'checkout-worker',
      strategy: 'rolling_pod_restart',
      max_unavailable: '25%',
      human_approval_signature: 'APPROVED_BY_ALEX_RIVERA',
    },
    responseData: {
      status: 'RESTART_SUCCESSFUL',
      pods_restarted: '32/32',
      memory_pre_restart_mb: 3980,
      memory_post_restart_mb: 340,
      cpu_pre_restart: '94.2%',
      cpu_post_restart: '14.5%',
      total_duration_sec: 16.2,
    },
    reasoning: 'Completed graceful rolling restart of checkout-worker pods. Reclaimed 3.6GB heap memory per container.',
  };
}

export async function mockCheckDatabaseStatus(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-db-status`,
    name: 'check_database_status',
    displayName: 'check_database_status()',
    type: 'read_only',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 160,
    inputParams: {
      cluster_id: 'prod-aurora-pg-01',
    },
    responseData: {
      primary_instance: 'pg-primary-us-east-1a (Active)',
      active_connections: 100,
      max_connections: 100,
      pool_saturation_pct: 100,
      replica_01_status: 'HEALTHY (In Sync, Lag: 0.2ms)',
      replica_02_status: 'DEGRADED (Replication Lag: 14.8s)',
      blocking_queries_count: 1,
      recommendation: 'Scale PgBouncer pool to 500 and promote standby replica-01 to primary',
    },
    reasoning: 'Queried Aurora PostgreSQL cluster. Diagnosed primary connection exhaustion and replica-02 lag.',
  };
}

export async function mockScaleOrFailoverDb(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-db-mitigate`,
    name: 'scale_or_failover_db',
    displayName: 'scale_or_failover_db()',
    type: 'action',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 440,
    inputParams: {
      action: 'scale_pool_and_promote_standby',
      target_pool_size: 500,
      promoted_replica: 'replica-01',
      human_approval_signature: 'APPROVED_BY_ALEX_RIVERA',
    },
    responseData: {
      status: 'MITIGATION_SUCCESSFUL',
      new_pool_size: 500,
      active_connections: '32/500 (Healthy)',
      promoted_primary: 'replica-01 (In Sync)',
      replica_lag_ms: 1.1,
      total_duration_sec: 8.4,
    },
    reasoning: 'Scaled PgBouncer pool limits to 500 and promoted synchronized replica-01. Database connection latency normalized to 35ms.',
  };
}

export async function mockRevertCommit(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-revert`,
    name: 'revert_commit',
    displayName: 'revert_commit()',
    type: 'action',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 320,
    inputParams: {
      target_commit: 'c49a172',
      pr_number: 482,
      branch: 'main',
      human_approval_signature: 'APPROVED_BY_ALEX_RIVERA',
    },
    responseData: {
      status: 'REVERT_MERGED_SUCCESSFULLY',
      revert_commit_hash: 'e92810a',
      ci_pipeline_run_id: 'CI-10843',
      test_suite_status: '42/42 Tests Passed (ALL GREEN)',
      total_duration_sec: 6.8,
    },
    reasoning: 'Generated git revert commit for PR #482 and merged to main. CI test runner re-evaluated with 42/42 tests passing.',
  };
}

export async function mockApplyWafRule(): Promise<ToolCall> {
  return {
    id: `tool-${Date.now()}-waf`,
    name: 'apply_waf_rule',
    displayName: 'apply_waf_rule()',
    type: 'action',
    status: 'completed',
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    latencyMs: 290,
    inputParams: {
      action: 'rate_limit_and_challenge_asn',
      target_asn: 'AS14061',
      rate_limit_threshold: '20 rps per ip',
      target_path: '/api/v1/auth/token',
      human_approval_signature: 'APPROVED_BY_ALEX_RIVERA',
    },
    responseData: {
      status: 'WAF_RULE_DEPLOYED_GLOBALLY',
      edge_pops_updated: 280,
      blocked_requests_per_sec: 14200,
      legitimate_inbound_rps: 4350,
      propagation_time_sec: 2.8,
    },
    reasoning: 'Deployed Cloudflare Edge WAF rate limit filter against ASN 14061. Dropped 14,200 RPS of bot flood traffic.',
  };
}

export function generatePostMortem(durationMinutes: string = '4m 18s'): PostIncidentReport {
  return SCENARIO_1_BAD_DEPLOY.generatePostMortem(durationMinutes);
}
