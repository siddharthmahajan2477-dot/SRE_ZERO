# SRE-Zero

> Voice-native AI SRE teammate that joins live incident calls, investigates production issues through tool calls, and helps engineers safely execute remediation actions — built for the EchoSphere Agora Conversational AI Hackathon.

## What It Does

SRE-Zero joins your incident voice call as a participant. Engineers speak naturally to ask for metrics, check recent commits, inspect deployments, and request rollbacks — all through voice. The agent calls real tools, speaks back the results, and gates destructive actions behind explicit human approval.

**Golden Path:** RED website → voice investigation → real tool calls → human approval → rollback → GREEN website

## Architecture (simplified)

```
Engineer speaks → Agora STT → Your /llm endpoint (tool loop) → Agora TTS → Engineer hears response
                         ↑                                          ↓
                    Agora cloud                          SDRTN (low-latency transport)
```

- **Agora handles:** real-time audio, STT (Deepgram), TTS (MiniMax), barge-in / turn detection
- **Your backend handles:** LLM reasoning, tool calling, approval gate, audit trail, mock infrastructure
- **Agora never sees:** tool calls, tool results, approval logic — all internal to your Python code

## Quick Start

### 1. Prerequisites

- Python 3.10+
- An Agora account with Conversational AI enabled
- A Groq API key (free tier: https://console.groq.com) — or any OpenAI-compatible LLM
- ngrok (to expose your backend publicly so Agora cloud can call `/llm`)

### 2. Set up Agora credentials

```bash
# Install Agora CLI
npm install -g agoraio-cli
agora login

# Create a project with RTC + Conversational AI
agora project create sre-zero --feature rtc --feature convoai
agora project use sre-zero
agora project env --shell   # prints AGORA_APP_ID and AGORA_APP_CERTIFICATE
```

### 3. Backend setup

```bash
cd server
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env.local
# Edit .env.local: fill in AGORA_APP_ID, AGORA_APP_CERTIFICATE, LLM_API_KEY

# Seed mock infrastructure
python ../scripts/seed_mock_infra.py

# Expose backend publicly (Agora cloud calls /llm/chat/completions)
ngrok http 8000
# Copy the ngrok URL to CUSTOM_LLM_URL in .env.local
# Example: CUSTOM_LLM_URL=https://abc123.ngrok-free.dev/llm/chat/completions

# Start the backend
uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend setup

Use the Agora Conversational AI quickstart frontend (Next.js):

```bash
# Clone the official Python quickstart (includes the web client)
git clone https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python
cd agent-quickstart-python/web-client
pnpm install

# Configure
echo "NEXT_PUBLIC_AGORA_APP_ID=your_app_id" > .env.local
echo "AGENT_BACKEND_URL=http://localhost:8000" >> .env.local

pnpm dev
# Open http://localhost:3000
```

### 5. Run the demo

1. Open `http://localhost:3000` and click **Start Conversation**
2. In a separate terminal, trigger the incident:
   ```bash
   python -c "from src.mock_infra import trigger_incident; trigger_incident()"
   ```
3. Speak to SRE-Zero:
   - "What's the CPU load?"
   - "Check the recent commits"
   - "Check the deployment"
   - "Prepare a rollback"
   - "Approve"

## Project Structure

```
sre-zero/
├── server/
│   ├── src/
│   │   ├── server.py          # FastAPI: token gen, agent lifecycle endpoints
│   │   ├── agent.py           # Agora agent config: CustomLLM, barge-in, turn detection
│   │   ├── llm.py             # OpenAI-compatible /chat/completions (tool-calling loop)
│   │   ├── tools.py           # Four SRE tools + approval gate
│   │   ├── mock_infra.py     # Mock monitoring API, git API, deploy system
│   │   ├── db.py              # SQLite audit trail + incident state
│   │   └── prompts.py        # System prompt defining SRE-Zero behavior
│   ├── .env.example
│   └── requirements.txt
├── scripts/
│   └── seed_mock_infra.py     # Initialize mock infrastructure
├── docs/
│   └── SRE-Zero_Technical_Blueprint.md
└── README.md
```

## The Four Tools

| Tool | Type | Approval | What It Does |
|---|---|---|---|
| `get_metrics(service)` | Read-only | Automatic | Returns CPU, memory, error rate, response time, HTTP status |
| `get_recent_commits(repo, count)` | Read-only | Automatic | Returns recent git commits with hash, author, message |
| `check_deployment(service)` | Read-only | Automatic | Returns current version, deploy info, health status |
| `rollback_deployment(service, target_version, approved)` | Destructive | **Required** | First call → `approval_required`; second call with `approved=True` → executes |

## Approval Gate Flow

```
Engineer: "Prepare a rollback"
  ↓
LLM calls rollback_deployment(approved=False)
  ↓
Tool returns: { status: "approval_required", ... }
  ↓
LLM speaks: "I have prepared a rollback to v2.4.0. Approval is required."
  ↓
Engineer: "Approve"
  ↓
LLM calls rollback_deployment(approved=True)
  ↓
Tool executes → website recovers
  ↓
LLM speaks: "Rollback complete. The frontend is now healthy."
```

## Key Design Decisions

1. **CustomLLM (not managed LLM):** Agora handles STT and TTS, but the LLM brain runs in our FastAPI backend. This gives us full control over tool calling and the approval gate.

2. **Tool loop is invisible to Agora:** The OpenAI-compatible endpoint runs the LLM, executes tools internally, and streams back only the final spoken text. Agora never sees `tool_call` objects.

3. **Barge-in is configured, not built:** Agora's built-in turn detection handles interruption. We configure `interrupt_duration_ms: 160` so the agent yields quickly when an engineer speaks.

4. **Mock infrastructure:** Everything is simulated. No real production systems are touched. The mock website goes from 502 (red) to 200 (green) after an approved rollback.

5. **SQLite audit trail:** Every conversation message and tool call is logged, enabling the post-incident report.

## Tech Stack

| Component | Technology |
|---|---|
| Voice / RTC | Agora Conversational AI Engine |
| STT | Deepgram nova-3 (Agora-managed) |
| TTS | MiniMax speech-2.6-turbo (Agora-managed) |
| LLM | Groq-hosted Llama 3.3 70B |
| Backend | Python 3.12 + FastAPI |
| Database | SQLite |
| Frontend | Next.js + Agora RTC/RTM SDK |

## License

MIT
