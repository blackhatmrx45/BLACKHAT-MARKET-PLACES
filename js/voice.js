/**
 * BHODT AI - Voice Service (Standalone Vanilla JS)
 * Browser Speech Recognition (Voice Input) and Speech Synthesis (Voice Output)
 */

window.BhodtVoice = (function () {
  let recognition = null;
  let isListening = false;
  let currentUtterance = null;
  let isSpeaking = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }

  return {
    isSpeechRecognitionSupported: function () {
      return !!recognition;
    },

    isSpeechSynthesisSupported: function () {
      return 'speechSynthesis' in window;
    },

    startVoiceInput: function (onResult, onError, onStart, onEnd, lang) {
      if (!recognition) {
        if (onError) onError('Voice input is not supported by this browser. Please use text chat.');
        return;
      }

      if (isListening) {
        this.stopVoiceInput();
        return;
      }

      try {
        recognition.lang = lang === 'si' ? 'si-LK' : 'en-US';

        recognition.onstart = function () {
          isListening = true;
          if (onStart) onStart();
        };

        recognition.onresult = function (event) {
          const transcript = event.results[0]?.[0]?.transcript || '';
          if (transcript && onResult) {
            onResult(transcript);
          }
        };

        recognition.onerror = function (event) {
          isListening = false;
          let msg = 'Voice recognition error.';
          if (event.error === 'not-allowed') msg = 'Microphone permission denied.';
          if (onError) onError(msg);
        };

        recognition.onend = function () {
          isListening = false;
          if (onEnd) onEnd();
        };

        recognition.start();
      } catch (err) {
        isListening = false;
        if (onError) onError(err.message || 'Could not start voice input');
      }
    },

    stopVoiceInput: function () {
      if (recognition && isListening) {
        try {
          recognition.stop();
        } catch (e) {}
        isListening = false;
      }
    },

    speakAIResponse: function (text, lang, onEnd) {
      if (!('speechSynthesis' in window)) return;
      this.stopSpeaking();

      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[#•\-]/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'si' ? 'si-LK' : 'en-US';
      utterance.rate = 1.0;

      utterance.onstart = () => { isSpeaking = true; };
      utterance.onend = () => { isSpeaking = false; if (onEnd) onEnd(); };
      utterance.onerror = () => { isSpeaking = false; };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    },

    stopSpeaking: function () {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        currentUtterance = null;
      }
    }
  };
})();
