/**
 * Groq AI Cloud Service for ultra-fast LPU inference (Llama 3.3 / Llama 3.1)
 * Uses GROQ_API_KEY for instant real-time incident reasoning and SRE responses.
 */

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqService {
  private static instance: GroqService;

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  public getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('groq_api_key');
      if (stored && stored.trim()) return stored.trim();
    }
    return (import.meta as any).env?.VITE_GROQ_API_KEY || '';
  }

  public setApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('groq_api_key', key.trim());
    }
  }

  public hasApiKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  /**
   * Query Groq Cloud for ultra-low latency SRE reasoning
   */
  public async queryGroq(
    userPrompt: string,
    contextInfo: {
      scenarioName?: string;
      metrics?: { errorRate: number; cpuPercent: number; httpStatus: number; p99LatencyMs: number };
      culpritCommit?: string;
    }
  ): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const systemPrompt = `You are SRE-Zero, an autonomous voice-first Site Reliability Engineer AI agent in an active production war room.
Active Scenario: ${contextInfo.scenarioName || 'Production Incident'}
Current Telemetry: Error Rate: ${contextInfo.metrics?.errorRate || 0}%, CPU: ${contextInfo.metrics?.cpuPercent || 0}%, HTTP Status: ${contextInfo.metrics?.httpStatus || 200}, P99 Latency: ${contextInfo.metrics?.p99LatencyMs || 25}ms.
${contextInfo.culpritCommit ? `Correlated Culprit Commit: ${contextInfo.culpritCommit}` : ''}

Respond in concise, professional, voice-synthesizer-friendly SRE spoken style (1-3 sentences maximum). Keep abbreviations clear for speech.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 250,
        }),
      });

      if (!response.ok) {
        console.warn('Groq API returned error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
      console.warn('Groq request failed:', err);
      return null;
    }
  }
}

export const groqService = GroqService.getInstance();
