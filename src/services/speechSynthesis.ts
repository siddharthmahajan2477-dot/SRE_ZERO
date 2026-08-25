/**
 * Real-time Speech Synthesizer for SRE-Zero demo using Web Speech API
 * Features a sequential FIFO speech queue ensuring every speaker completes their sentence.
 */

interface SpeechQueueItem {
  id: string;
  text: string;
  speakerRole: 'agent' | 'lead' | 'devops';
  onStart?: () => void;
  onEnd?: () => void;
  resolvePromise?: () => void;
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private isEnabled: boolean = true;
  private isCurrentlySpeaking: boolean = false;
  private queue: SpeechQueueItem[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingStateChange: ((isSpeaking: boolean, speaker: string) => void) | null = null;
  private speechRate: number = 1.0;
  private speechPitch: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Pre-load voices
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          if (this.synth) this.synth.getVoices();
        };
      }
    }
  }

  public setRate(rate: number) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.speechRate;
  }

  public setPitch(pitch: number) {
    this.speechPitch = Math.max(0.5, Math.min(1.5, pitch));
  }

  public getPitch(): number {
    return this.speechPitch;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setSpeakingListener(listener: (isSpeaking: boolean, speaker: string) => void) {
    this.onSpeakingStateChange = listener;
  }

  /**
   * Enqueues an utterance. Does NOT cancel ongoing speech unless isInterrupt is true.
   */
  public speak(
    text: string,
    speakerRole: 'agent' | 'lead' | 'devops',
    onEnd?: () => void,
    onStart?: () => void
  ): string {
    const id = `speech-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Clean text of emojis and special markdown characters for smoother TTS pronunciation
    const cleanText = text
      .replace(/[🚨✅🔍📊🚀🛡️⚡👩‍💻👨‍💻🤖›•*#_~`]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'API endpoint')
      .replace(/api\.production\.acme\.corp/gi, 'api production acme corp')
      .replace(/p99/gi, 'p 99')
      .replace(/502/g, '5 0 2')
      .replace(/200 OK/gi, '200 O K')
      .replace(/\s+/g, ' ')
      .trim();

    this.queue.push({
      id,
      text: cleanText || text,
      speakerRole,
      onStart,
      onEnd,
    });

    if (!this.isCurrentlySpeaking) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Promisified speak that resolves ONLY when the utterance has fully finished speaking.
   */
  public speakAsync(
    text: string,
    speakerRole: 'agent' | 'lead' | 'devops',
    onStart?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const id = `speech-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      const cleanText = text
        .replace(/[🚨✅🔍📊🚀🛡️⚡👩‍💻👨‍💻🤖›•*#_~`]/g, ' ')
        .replace(/https?:\/\/\S+/g, 'API endpoint')
        .replace(/api\.production\.acme\.corp/gi, 'api production acme corp')
        .replace(/p99/gi, 'p 99')
        .replace(/502/g, '5 0 2')
        .replace(/200 OK/gi, '200 O K')
        .replace(/\s+/g, ' ')
        .trim();

      this.queue.push({
        id,
        text: cleanText || text,
        speakerRole,
        onStart,
        resolvePromise: resolve,
      });

      if (!this.isCurrentlySpeaking) {
        this.processQueue();
      }
    });
  }

  /**
   * Interruption / Barge-in: clears pending queue and speaks immediately.
   */
  public interrupt(
    text: string,
    speakerRole: 'agent' | 'lead' | 'devops',
    onEnd?: () => void
  ) {
    this.stop();
    return this.speak(text, speakerRole, onEnd);
  }

  private processQueue() {
    if (this.queue.length === 0) {
      this.isCurrentlySpeaking = false;
      if (this.onSpeakingStateChange) {
        this.onSpeakingStateChange(false, 'none');
      }
      return;
    }

    const currentItem = this.queue.shift();
    if (!currentItem) return;

    this.isCurrentlySpeaking = true;

    // Fallback if browser doesn't support Web Speech or it's disabled
    if (!this.synth || !this.isEnabled) {
      if (currentItem.onStart) currentItem.onStart();
      if (this.onSpeakingStateChange) {
        this.onSpeakingStateChange(true, currentItem.speakerRole);
      }

      const simulatedDuration = Math.min(Math.max(currentItem.text.length * 55, 1800), 5500);
      setTimeout(() => {
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false, currentItem.speakerRole);
        }
        if (currentItem.onEnd) currentItem.onEnd();
        if (currentItem.resolvePromise) currentItem.resolvePromise();
        // Delay slightly before next sentence for conversational natural cadence
        setTimeout(() => this.processQueue(), 300);
      }, simulatedDuration);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(currentItem.text);
      this.activeUtterance = utterance;

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        if (currentItem.speakerRole === 'agent') {
          // AI Agent: crisp, slightly higher pitch
          const agentVoice = voices.find(
            (v) =>
              (v.name.includes('Google') ||
                v.name.includes('Natural') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.lang.startsWith('en')) &&
              !v.name.includes('Male') &&
              !v.name.includes('David')
          );
          if (agentVoice) utterance.voice = agentVoice;
          utterance.pitch = 1.05 * this.speechPitch;
          utterance.rate = 1.02 * this.speechRate;
        } else if (currentItem.speakerRole === 'lead') {
          // Alex Rivera: Lead SRE (deeper/authoritative)
          const leadVoice = voices.find(
            (v) =>
              v.name.includes('David') ||
              v.name.includes('Daniel') ||
              v.name.includes('Male') ||
              v.name.includes('Alex') ||
              v.name.includes('en-US')
          );
          if (leadVoice) utterance.voice = leadVoice;
          utterance.pitch = 0.95 * this.speechPitch;
          utterance.rate = 1.0 * this.speechRate;
        } else {
          // Sarah Chen: DevOps
          const devopsVoice = voices.find(
            (v) =>
              v.name.includes('Zira') ||
              v.name.includes('Karen') ||
              v.name.includes('en-GB') ||
              v.name.includes('en-US')
          );
          if (devopsVoice) utterance.voice = devopsVoice;
          utterance.pitch = 1.08 * this.speechPitch;
          utterance.rate = 1.05 * this.speechRate;
        }
      }

      utterance.onstart = () => {
        if (currentItem.onStart) currentItem.onStart();
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(true, currentItem.speakerRole);
        }
      };

      const handleFinished = () => {
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false, currentItem.speakerRole);
        }
        this.activeUtterance = null;
        if (currentItem.onEnd) currentItem.onEnd();
        if (currentItem.resolvePromise) currentItem.resolvePromise();
        // Give 350ms natural breathing space between consecutive speakers
        setTimeout(() => this.processQueue(), 350);
      };

      utterance.onend = handleFinished;
      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        handleFinished();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis exception:', e);
      if (currentItem.onEnd) currentItem.onEnd();
      if (currentItem.resolvePromise) currentItem.resolvePromise();
      setTimeout(() => this.processQueue(), 200);
    }
  }

  public stop() {
    this.queue = [];
    if (this.synth) {
      this.synth.cancel();
    }
    this.activeUtterance = null;
    this.isCurrentlySpeaking = false;
    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(false, 'none');
    }
  }
}

export const voiceService = new VoiceService();

