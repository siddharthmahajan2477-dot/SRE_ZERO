# SRE-Zero — Technical Blueprint

**Track:** Incident Commander  
**Hackathon:** EchoSphere — Agora Conversational AI Hackathon  
**Status:** Ready for implementation  
**Version:** 1.0

---

## 1. Final MVP Scope

One incident scenario, executed end-to-end with polish:

**Golden Path:** RED website → voice investigation → real tool calls → human approval → rollback → GREEN website → post-incident report

### In scope
- Real-time Agora voice interaction (STT + LLM + TTS)
- One incident scenario (502 errors from a bad deployment)
- Single-speaker voice interaction (engineer speaks to agent)
- Four tool calls: `get_metrics`, `get_recent_commits`, `check_deployment`, `rollback_deployment`
- Mock monitoring API and mock deployment system
- Human approval gate for rollback
- Barge-in / interruption handling
- Simple web dashboard (incident timeline)
- Post-incident summary generation

### Out of scope
- Real AWS/GCP/Kubernetes integrations
- Multiple simultaneous speakers the agent listens to at once
- Enterprise auth, RBAC, voice authentication
- Incident prediction, auto-remediation, historical learning

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Next.js)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ RTC SDK     │  │ RTM SDK      │  │ Incident Dashboard      │  │
│  │ (mic, audio)│  │ (transcript) │  │ (timeline, status)      │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         │   /api/get_config  /api/startAgent  /api/stopAgent     │
└─────────┼────────────────┼──────────────────────┼────────────────┘
          │                │                      │
          │           HTTP (Next.js rewrites to FastAPI :8000)
          │                │                      │
┌─────────┼────────────────┼──────────────────────┼────────────────┐
│         ▼                ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              FastAPI Backend (Python, :8000)                │ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────────────────────┐  │ │
│  │  │ Token    │  │ Agent     │  │ Custom LLM Endpoint      │  │ │
│  │  │ Builder  │  │ Lifecycle │  │ /llm/chat/completions     │  │ │
│  │  │ (RTC+RTM)│  │ (start/   │  │                          │  │ │
│  │  │          │  │  stop)    │  │  ┌────────────────────┐  │  │ │
│  │  └──────────┘  └───────────┘  │  │ Tool-Calling Loop   │  │  │ │
│  │                               │  │ (OpenAI compat)     │  │  │ │
│  │                               │  └─────────┬──────────┘  │  │ │
│  │                               └────────────┼──────────────┘  │ │
│  └────────────────────────────────────────────┼─────────────────┘ │
│                                               │                   │
│                          ┌────────────────────┼───────────────┐   │
│                          │   SRE Tools (Python)               │   │
│                          │   get_metrics()                    │   │
│                          │   get_recent_commits()              │   │
│                          │   check_deployment()                │   │
│                          │   rollback_deployment()  ←approval  │   │
│                          └────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐  │
│  │ Mock Infra       │    │ Audit Trail (SQLite)                 │  │
│  │ - fake website   │    │ - conversation log                   │  │
│  │ - mock monitor   │    │ - tool call results                  │  │
│  │ - mock git API   │    │ - approval records                   │  │
│  │ - mock deploy    │    │ - incident timeline                  │  │
│  └─────────────────┘    └──────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
          │
          │  Agora SDRTN (real-time audio transport)
          │
┌─────────┼─────────────────────────────────────────────────────────┐
│         ▼     Agora Conversational AI Engine (Cloud)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │ STT          │  │ TTS          │  │ Turn Detection       │     │
│  │ (Deepgram    │  │ (MiniMax     │  │ (VAD + barge-in)     │     │
│  │  nova-3)     │  │  speech-2.6) │  │                      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘     │
│         │                 │                                        │
│         │    Transcript → your /llm endpoint                       │
│         │    ← streamed reply (SSE) → TTS → channel                │
│         │                 │                                        │
│         ▼                 ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │     RTC Channel (multi-participant, low-latency)         │      │
│  │     Agent joins as participant (agent_rtc_uid)          │      │
│  │     Subscribes to engineer audio (remote_rtc_uids)      │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data flow (single turn)

1. Browser calls `/api/get_config` → backend mints RTC+RTM token, returns channel/UID config
2. Browser joins RTC channel, calls `/api/startAgent` → backend starts Agora agent with `CustomLLM`
3. Engineer speaks → Agora runs STT (Deepgram nova-3)
4. Agora sends transcript to your `/llm/chat/completions` endpoint as OpenAI request
5. Your endpoint runs LLM with tool definitions; if LLM calls a tool, your code executes it and feeds results back
6. Your endpoint streams only the final spoken reply as OpenAI SSE chunks
7. Agora runs TTS (MiniMax) on the streamed text and plays audio back in the channel
8. If engineer interrupts (barge-in), Agora stops TTS immediately via turn detection
9. Browser receives RTM events (transcript, metrics) for the dashboard
10. `/api/stopAgent` ends the session

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Voice / RTC | Agora Conversational AI Engine | Core hackathon requirement; provides STT, TTS, turn detection, barge-in, SDRTN transport |
| STT | Deepgram nova-3 (Agora-managed) | Best-in-class latency; no separate API key needed |
| TTS | MiniMax speech-2.6-turbo (Agora-managed) | Low TTFB; natural voice quality |
| LLM | Groq-hosted Llama 3.3 70B (via custom LLM endpoint) | Sub-300ms TTFB; excellent tool-calling; free tier available |
| Backend | Python 3.12 + FastAPI | Team familiarity; single language; async streaming support |
| Agent orchestration | Custom tool-calling loop in Python | Full control over tool execution, approval gating, and audit trail |
| Tools | Python functions + mock APIs | All four tools in one module; mock infrastructure for safe demo |
| Frontend | Next.js (TypeScript) + Agora RTC/RTM SDK | Standard Agora quickstart pattern; minimal UI |
| Database | SQLite (audit trail + incident state) | Zero-config; survives restarts; sufficient for hackathon |
| Deployment | Local (ngrok for Agora callback) | Fastest iteration; no cloud setup needed |

---

## 4. Agora Integration Architecture

### SDK choice: Python `agora-agents` package

```bash
pip install agora-agents agora-token-builder
```

### Agent configuration

The agent uses `CustomLLM` vendor — Agora handles STT and TTS, but the LLM brain runs in your FastAPI backend. This is the key architectural decision:

- **Agora-managed STT (Deepgram):** No API key needed; Agora handles transcription
- **CustomLLM:** Points at your `/llm/chat/completions` endpoint; your code runs the LLM + tool loop
- **Agora-managed TTS (MiniMax):** No API key needed; Agora handles voice synthesis
- **Turn detection:** Configured for voice-based barge-in (interruptible mode)

### Barge-in configuration

```python
.with_turn_detection({
    'mode': 'default',
    'config': {
        'speech_threshold': 0.5,
        'start_of_speech': {
            'mode': 'vad',
            'vad_config': {
                'interrupt_duration_ms': 160,
                'speaking_interrupt_duration_ms': 320,
                'prefix_padding_ms': 800,
            },
        },
        'end_of_speech': {
            'mode': 'semantic',
            'semantic_config': {
                'silence_duration_ms': 320,
                'max_wait_ms': 3000,
            },
        },
    },
})
```

- `interrupt_duration_ms: 160` — agent yields quickly when engineer speaks
- `end_of_speech.mode: semantic` — smarter turn-boundary detection (English only)
- Manual interrupt also available via `session.interrupt()`

### Multi-user limitation

The `remote_rtc_uids` parameter currently supports **one user ID** — the agent listens to one speaker at a time. For the hackathon demo, script one primary speaker. Multiple humans can still be in the channel (they hear the agent), but only the subscribed UID's speech is processed.

### Token generation

Use `agora-token-builder` to generate a combined RTC+RTM token:
```python
from agora_token_builder import RtcTokenBuilder, RtcRole, RtmTokenBuilder
```

### Region

Set `Area.INDIA` for lowest SDRTN latency from India (~30ms intra-region transport).

### Verified latency budget

| Component | Expected (ms) |
|---|---|
| SDRTN transport (India) | ~30 |
| Algorithm preprocessing (VAD) | ~720-940 |
| ASR (Deepgram) | ~100-400 |
| LLM TTFB (Groq) | ~200-300 |
| TTS TTFB (MiniMax) | ~60-100 |
| **Total end-to-end** | **~1.5-2.5s** |

---

## 5. Tool / API Definitions

### Tool 1: `get_metrics()`

**Type:** Read-only (automatic, no approval needed)

```json
{
  "name": "get_metrics",
  "description": "Get current server metrics including CPU, memory, error rate, and response time for a specified service.",
  "parameters": {
    "type": "object",
    "properties": {
      "service": {
        "type": "string",
        "description": "The name of the service to check (e.g., 'frontend', 'auth', 'api')",
        "default": "frontend"
      }
    }
  }
}
```

**Returns:**
```json
{
  "service": "frontend",
  "status": "unhealthy",
  "cpu_percent": 87.3,
  "memory_percent": 72.1,
  "error_rate_percent": 45.2,
  "response_time_ms": 3200,
  "http_status": "502",
  "timestamp": "2026-08-23T14:30:00Z"
}
```

### Tool 2: `get_recent_commits()`

**Type:** Read-only (automatic)

```json
{
  "name": "get_recent_commits",
  "description": "Get recent git commits from the repository, including commit hash, author, message, and timestamp.",
  "parameters": {
    "type": "object",
    "properties": {
      "repo": {
        "type": "string",
        "description": "Repository name",
        "default": "main-website"
      },
      "count": {
        "type": "integer",
        "description": "Number of recent commits to retrieve",
        "default": 5
      }
    }
  }
}
```

**Returns:**
```json
{
  "repo": "main-website",
  "commits": [
    {
      "hash": "a1b2c3d",
      "author": "dev@example.com",
      "message": "Update auth middleware - remove token validation",
      "timestamp": "2026-08-23T14:28:00Z"
    }
  ]
}
```

### Tool 3: `check_deployment()`

**Type:** Read-only (automatic)

```json
{
  "name": "check_deployment",
  "description": "Check the current deployment status, version, and recent rollout information for a service.",
  "parameters": {
    "type": "object",
    "properties": {
      "service": {
        "type": "string",
        "default": "frontend"
      }
    }
  }
}
```

**Returns:**
```json
{
  "service": "frontend",
  "current_version": "v2.4.1",
  "previous_version": "v2.4.0",
  "deployed_at": "2026-08-23T14:28:00Z",
  "deployed_by": "dev@example.com",
  "commit_hash": "a1b2c3d",
  "status": "deployed",
  "health": "unhealthy"
}
```

### Tool 4: `rollback_deployment()`

**Type:** Destructive (requires explicit human approval)

```json
{
  "name": "rollback_deployment",
  "description": "Rollback a service deployment to the previous version. REQUIRES HUMAN APPROVAL before execution.",
  "parameters": {
    "type": "object",
    "properties": {
      "service": {
        "type": "string",
        "default": "frontend"
      },
      "target_version": {
        "type": "string",
        "description": "The version to rollback to. If omitted, rolls back to previous version."
      }
    }
  }
}
```

**Returns (pre-approval):**
```json
{
  "status": "approval_required",
  "service": "frontend",
  "current_version": "v2.4.1",
  "target_version": "v2.4.0",
  "message": "Rollback prepared. Waiting for human approval."
}
```

**Returns (after approval):**
```json
{
  "status": "success",
  "service": "frontend",
  "rolled_back_to": "v2.4.0",
  "timestamp": "2026-08-23T14:35:00Z",
  "health": "healthy"
}
```

### Approval gate flow

1. LLM calls `rollback_deployment` tool
2. Tool returns `status: "approval_required"` — does NOT execute rollback
3. LLM speaks: "I have prepared a rollback to version v2.4.0. Approval is required before execution."
4. Engineer says "approve" or "yes, go ahead"
5. LLM calls `rollback_deployment` again with `approved: true` parameter
6. Tool executes the mock rollback and returns success
7. LLM speaks: "Rollback complete. The frontend service is now healthy."

---

## 6. Database Design

### SQLite schema

```sql
-- Incident conversation log
CREATE TABLE conversation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL,
    turn_id INTEGER,
    role TEXT NOT NULL,           -- 'user', 'assistant', 'tool'
    content TEXT NOT NULL,
    tool_name TEXT,
    tool_result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tool call audit trail
CREATE TABLE tool_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    parameters TEXT,              -- JSON
    result TEXT,                  -- JSON
    status TEXT NOT NULL,         -- 'success', 'failed', 'approval_required', 'approved', 'executed'
    approved_by TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Incident state
CREATE TABLE incidents (
    id TEXT PRIMARY KEY,
    channel_name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'resolved'
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    summary TEXT                  -- post-incident report JSON
);

-- Mock infrastructure state
CREATE TABLE mock_infra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL,
    version TEXT NOT NULL,
    health TEXT DEFAULT 'healthy',
    cpu_percent REAL DEFAULT 23.0,
    error_rate REAL DEFAULT 0.5,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Development Order

Built from highest-risk to lowest-risk, following the SRE-Zero Next Steps guide:

| Step | Task | Risk | Deliverable |
|---|---|---|---|
| A | Prove Agora voice loop | Highest | Human speaks → agent responds (managed LLM, no tools) |
| B | Prove agent reasoning | High | Custom LLM endpoint returns dynamic responses |
| C | Prove one tool call | High | `get_metrics()` called and result spoken back |
| D | Add multiple tools | Medium | All four tools wired; agent selects correct tool |
| E | Add barge-in | Medium | Agent stops TTS when engineer interrupts |
| F | Add approval gate | Medium | Rollback requires explicit "approve" before execution |
| G | Add mock rollback | Low | Website visibly recovers after approved rollback |
| H | Add dashboard | Low | Incident timeline shows states: INCIDENT → INVESTIGATING → MITIGATING → RESOLVED |
| I | Polish & rehearse | Lowest | Measure latency, test failures, rehearse exact demo flow |

---

## 8. Team Responsibilities

| Role | Owner | Tasks |
|---|---|---|
| Agora integration | Dev 1 | `server.py` (token + lifecycle), `agent.py` config, barge-in tuning, ngrok setup |
| LLM + tool calling | Dev 2 | `llm.py` (OpenAI-compatible endpoint, tool loop), `tools.py` (four tools), approval gate logic |
| Mock infra + audit | Dev 3 | `mock_infra.py` (fake website, monitoring API, git API, deploy system), `db.py` (SQLite audit trail) |
| Frontend dashboard | Dev 4 | Next.js app, RTC/RTM integration, incident timeline UI, demo state visualization |
| Demo & pitch | All | Demo script, rehearsal, pitch deck, Q&A prep |

*(Assign names in your next planning session.)*

---

## 9. Repository Structure

```
sre-zero/
├── server/
│   ├── src/
│   │   ├── server.py          # FastAPI app: token, startAgent, stopAgent endpoints
│   │   ├── agent.py           # Agora agent config: CustomLLM, turn detection, barge-in
│   │   ├── llm.py             # OpenAI-compatible /chat/completions endpoint with tool loop
│   │   ├── tools.py           # Four SRE tools: get_metrics, get_recent_commits, check_deployment, rollback_deployment
│   │   ├── mock_infra.py     # Mock monitoring API, mock git API, mock deploy system
│   │   ├── db.py              # SQLite: audit trail, conversation log, incident state
│   │   └── prompts.py        # System prompt, greeting, failure message
│   ├── .env.example
│   └── requirements.txt
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx       # Main conversation page
│   │   ├── components/
│   │   │   ├── ConversationComponent.tsx   # RTC join, mic, audio
│   │   │   ├── TranscriptPanel.tsx         # Live transcript from RTM
│   │   │   ├── IncidentTimeline.tsx        # Dashboard: INCIDENT → INVESTIGATING → MITIGATING → RESOLVED
│   │   │   └── MetricsPanel.tsx            # Real-time metrics display
│   │   ├── lib/
│   │   │   └── conversation.ts             # RTC/RTM lifecycle helpers
│   │   └── services/
│   │       └── api.ts                      # /api/get_config, /api/startAgent, /api/stopAgent
│   ├── next.config.ts                      # Rewrites /api/* to FastAPI :8000
│   └── package.json
├── docs/
│   └── SRE-Zero_Technical_Blueprint.md
├── scripts/
│   └── seed_mock_infra.py                  # Seed SQLite with initial mock data
└── README.md
```

---

## 10. Deployment Plan

### Local development (hackathon)

```bash
# 1. Backend
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env.local
# Fill in AGORA_APP_ID, AGORA_APP_CERTIFICATE, CUSTOM_LLM_URL, etc.

# 3. Seed mock infrastructure
python scripts/seed_mock_infra.py

# 4. Expose backend publicly (Agora cloud calls /llm)
ngrok http 8000
# Copy the ngrok URL to CUSTOM_LLM_URL in .env.local

# 5. Run backend
uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload

# 6. Frontend (separate terminal)
cd web
pnpm install
pnpm dev
# Open http://localhost:3000
```

### Production deployment (post-hackathon)

- Backend: Deploy FastAPI to Railway/Render/Fly.io
- Frontend: Deploy Next.js to Vercel
- Set `AGENT_BACKEND_URL` in frontend env to backend URL
- Set `CUSTOM_LLM_URL` to the backend's public `/llm/chat/completions` endpoint

---

## 11. Testing Plan

### Contract tests (no Agora credentials needed)

| Test | What it verifies |
|---|---|
| `/api/get_config` returns valid token + channel config | Token generation works |
| `/llm/chat/completions` accepts OpenAI-format request | LLM endpoint contract |
| `get_metrics()` returns expected JSON | Tool execution |
| `get_recent_commits()` returns mock commits | Tool execution |
| `check_deployment()` returns deployment info | Tool execution |
| `rollback_deployment()` without approval returns `approval_required` | Approval gate |
| `rollback_deployment()` with approval executes and returns success | Approval flow |
| Audit trail records all tool calls | Audit logging |

### Integration tests (requires Agora credentials)

| Test | What it verifies |
|---|---|
| Agent joins channel and speaks greeting | Agora agent lifecycle |
| Engineer speaks → agent responds | STT → LLM → TTS pipeline |
| Engineer interrupts agent mid-speech | Barge-in / turn detection |
| Agent calls `get_metrics` and speaks result | Tool-calling voice loop |
| Agent prepares rollback and requests approval | Approval gate over voice |
| Approved rollback recovers the website | End-to-end golden path |

### Demo rehearsal checklist

- [ ] Test on venue Wi-Fi in advance
- [ ] Have mobile hotspot as network fallback
- [ ] Record a backup demo video
- [ ] Test with two+ speakers (even if only one is subscribed)
- [ ] Measure end-to-end latency during rehearsal
- [ ] Test failure case: what if agent misunderstands?
- [ ] Verify mock infra resets between rehearsals

---

## 12. Final Demo Script

**Duration:** ~2-3 minutes

### Stage setup (before demo)
1. Website is healthy (green) and visible on screen
2. Dashboard shows: `INCIDENT` state ready
3. SRE-Zero agent is configured and ready to join

### Demo sequence

| Beat | Duration | Action | Expected |
|---|---|---|---|
| **1. Healthy state** | 10s | Show website running normally | Green status, 200 OK |
| **2. Failure trigger** | 5s | Introduce bad deployment (mock) | Website shows 502, dashboard → INCIDENT |
| **3. Agent joins** | 10s | Agent joins voice channel | "Critical alert. The frontend is returning 502 errors. The web container CPU is elevated." |
| **4. Investigation: metrics** | 20s | Engineer: "What's the CPU load?" | Agent calls `get_metrics`, speaks: "CPU is at 87%, error rate is 45%, response time is 3.2 seconds." |
| **5. Investigation: commits** | 20s | Engineer: "Check the recent commits" | Agent calls `get_recent_commits`, speaks: "A commit was pushed approximately two minutes ago — 'Update auth middleware, remove token validation.'" |
| **6. Investigation: deployment** | 15s | Engineer: "Check the deployment" | Agent calls `check_deployment`, speaks: "Version v2.4.1 was deployed two minutes ago, linked to commit a1b2c3d. Health is unhealthy." |
| **7. Barge-in beat** | 10s | Agent starts explaining logs → Engineer interrupts: "Stop. Just give me the error code." | Agent stops immediately, responds: "Error code is 502, Bad Gateway." |
| **8. Remediation** | 15s | Engineer: "Prepare a rollback" | Agent: "I have prepared a rollback to version v2.4.0. Approval is required before execution." |
| **9. Approval** | 10s | Engineer: "Approve" | Agent calls rollback, speaks: "Rollback complete. The frontend service is now healthy." Website recovers, dashboard → RESOLVED |
| **10. Post-incident** | 10s | Engineer: "Generate the incident report" | Agent generates and speaks a structured summary; dashboard shows full timeline |

### Pitch talking points

- Solves a real engineering problem (MTTR reduction)
- Voice has genuine purpose here — engineers' hands and eyes are occupied
- Agora is structurally load-bearing, not decorative: real-time transport, barge-in, multi-participant channel
- Tool calling is grounded in real (mock) data — no hallucination
- Human-in-the-loop safety is a first-class feature
- Visible before/after: RED website → GREEN website
- Viable B2B product concept

---

## Verification Summary

All `[VERIFY]` markers from the Master Project Document have been resolved:

1. **Agora as real-time communication layer** — ✅ Verified. SDRTN provides 30ms transport (India), full two-way audio, agent joins as channel participant.
2. **Barge-in / interruption** — ✅ Verified. Three modes: voice (default), keyword, manual. Configurable via `.with_turn_detection()`. `interrupt_duration_ms: 160` recommended.
3. **Tool calling** — ✅ Verified. CustomLLM vendor + OpenAI-compatible endpoint. Tool loop runs entirely in your Python backend. Agora never sees `tool_call` objects.
4. **Multi-participant channels** — ⚠️ Verified with limitation. Multiple humans can join the channel, but `remote_rtc_uids` supports one subscribed speaker at a time.
5. **Latency** — ✅ Verified. End-to-end ~1.5-2.5s. LLM is the dominant factor (~200-300ms TTFB with Groq). Transport is ~30ms (India region).
