// Web Audio API Sound Synthesizer for Phone Call simulator

class PhoneAudioEngine {
  private ctx: AudioContext | null = null;
  private ringtoneInterval: any = null;
  private dialtoneInterval: any = null;
  private currentActiveNodes: AudioNode[] = [];
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // DTMF Frequencies mapping
  // Columns: 1209 Hz, 1336 Hz, 1477 Hz
  // Rows:
  // 697 Hz -> 1, 2, 3
  // 770 Hz -> 4, 5, 6
  // 852 Hz -> 7, 8, 9
  // 941 Hz -> *, 0, #
  private dtmfFreqs: Record<string, [number, number]> = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
  };

  public playDTMF(key: string, durationMs: number = 200) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const freqs = this.dtmfFreqs[key];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    // DTMF uses sine waves
    osc1.type = 'sine';
    osc2.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime + (durationMs / 1000) - 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + (durationMs / 1000));
    osc2.stop(ctx.currentTime + (durationMs / 1000));
  }

  // Play continuous dial tone (when user is waiting for outgoing call)
  public startDialingTone() {
    this.stopAll();
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const playTone = () => {
      if (this.isMuted) return;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Standard US ringback tone: 440Hz + 480Hz
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      osc1.type = 'sine';
      osc2.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      // Ring for 2 seconds
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime + 1.8);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);

      this.currentActiveNodes.push(osc1, osc2, gainNode);
    };

    // Tone plays: 2s on, 4s off
    playTone();
    this.dialtoneInterval = setInterval(playTone, 6000);
  }

  public stopDialingTone() {
    if (this.dialtoneInterval) {
      clearInterval(this.dialtoneInterval);
      this.dialtoneInterval = null;
    }
    this.stopAll();
  }

  // Play telephone ringtone (pleasant digitized synth)
  public startRingtone() {
    this.stopAll();
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const playRing = () => {
      if (this.isMuted) return;

      const now = ctx.currentTime;
      
      // We will create an upbeat Marimba-like modern ringtone pattern
      // Pattern: C5 - E5 - G5 - C6 in quick succession, repeated twice
      const notes = [523.25, 659.25, 783.99, 1046.50, 523.25, 659.25, 783.99, 1046.50];
      const timing = [0.0, 0.15, 0.3, 0.45, 0.7, 0.85, 1.0, 1.15];
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle'; // softer than saw/square
        osc.frequency.value = freq;
        
        const noteStart = now + timing[idx];
        const noteDuration = 0.25;
        
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
        
        this.currentActiveNodes.push(osc, gain);
      });
    };

    playRing();
    // Repeat every 3 seconds
    this.ringtoneInterval = setInterval(playRing, 3000);
  }

  public stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    this.stopAll();
  }

  // Short connect chirp
  public playConnectChirp() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Sliding pitch upwards
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // Three sad beeps for hanging up
  public playDisconnectBeeps() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const playBeep = (timeOffset: number, pitch: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = pitch;

      gain.gain.setValueAtTime(0.1, ctx.currentTime + timeOffset);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + timeOffset + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.1);
    };

    playBeep(0.0, 400);
    playBeep(0.15, 350);
    playBeep(0.3, 300);
  }

  private stopAll() {
    // Cancel any scheduled audio node plays
    this.currentActiveNodes.forEach(node => {
      try {
        (node as any).stop();
      } catch (e) {}
    });
    this.currentActiveNodes = [];
  }

  // Web Speech API text-to-speech for interactive caller voices
  public speakText(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) setTimeout(onEnd, text.length * 50 + 500); // mock timing
      return;
    }
    
    // Stop any existing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Let's pick a nice voice if available
      const voices = window.speechSynthesis.getVoices();
      // Try to find an English voice, ideally a natural-sounding one
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en')) || 
                           voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback
      if (onEnd) setTimeout(onEnd, text.length * 50 + 500);
    }
  }

  public stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audio = new PhoneAudioEngine();
