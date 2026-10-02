// Web Speech API Voice Service for BHODT AI
// Provides modular speech recognition (Voice Input) and speech synthesis (Voice Output)

export interface VoiceRecognitionHandlers {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  // Check if speech recognition is supported in browser
  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  // Check if speech synthesis is supported
  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // 1. Voice Input (Speech to Text)
  public startVoiceInput(handlers: VoiceRecognitionHandlers, language: 'en' | 'si' = 'en'): void {
    if (!this.recognition) {
      handlers.onError('Voice input is not supported by this browser. Please use text chat.');
      return;
    }

    if (this.isListening) {
      this.stopVoiceInput();
      return;
    }

    try {
      this.recognition.lang = language === 'si' ? 'si-LK' : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        handlers.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          handlers.onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let errMsg = 'Voice recognition error occurred.';
        if (event.error === 'not-allowed') {
          errMsg = 'Microphone permission was denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          errMsg = 'No speech was detected. Please try speaking again.';
        }
        handlers.onError(errMsg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd?.();
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      handlers.onError(err?.message || 'Failed to start voice input.');
    }
  }

  public stopVoiceInput(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  // 2. Voice Output (Text to Speech)
  public speakAIResponse(
    text: string,
    language: 'en' | 'si' = 'en',
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isSpeechSynthesisSupported()) {
      onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    // Strip markdown formatting symbols for natural speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[#•\-]/g, ' ')
      .trim();

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'si' ? 'si-LK' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pauseSpeaking(): void {
    if (this.isSpeechSynthesisSupported() && this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  public resumeSpeaking(): void {
    if (this.isSpeechSynthesisSupported() && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const voiceService = new VoiceService();
