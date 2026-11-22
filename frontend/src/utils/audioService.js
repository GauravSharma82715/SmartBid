// SmartBid Web Audio Synthesizer
// Uses the native Web Audio API for 100% offline, zero-latency, realistic auction sounds and meme hype tunes!

class AudioService {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('smartbid_sound_muted') === 'true';
    this.bidSoundMode = localStorage.getItem('smartbid_bid_sound_mode') || 'damnBro'; // 'damnBro' | 'gavel'
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('smartbid_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  getBidSoundMode() {
    return this.bidSoundMode;
  }

  setBidSoundMode(mode) {
    this.bidSoundMode = mode;
    localStorage.setItem('smartbid_bid_sound_mode', mode);
    return this.bidSoundMode;
  }

  // Default bid sound: plays the deep funeral bell on every placed bid
  playBidSound() {
    this.playUndertakerBell();
  }

  // Realistic wooden gavel impact sound
  playGavelStrike() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playStrike = delayTime => {
      const startTime = ctx.currentTime + delayTime;

      // 1. Low-end wooden body thud (triangle drop from 200Hz to 45Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, startTime);
      osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.12);

      oscGain.gain.setValueAtTime(0.7, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);

      // 2. High transient wood impact (filtered white noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.05); // 50ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, startTime);
      filter.Q.setValueAtTime(3.0, startTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.04);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + 0.05);
    };

    // Authentic double gavel strike ("knock... KNOCK!")
    playStrike(0);
    playStrike(0.18);
  }

  // 🔥 THE LEGENDARY "DAMN BRO YOU ARE SO SICK MY BRO" MEME TUNE 🔥
  // Combines Web Speech API voice + 808 sub bass drop + MLG / Trap Brass horn melody + rapid hi-hat rolls + gavel impact!
  playDamnBroYouAreSoSick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // 1. Voice Announcement using Web Speech API
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Damn bro! You are so sick my bro!');
        utterance.rate = 1.15;
        utterance.pitch = 1.15;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(
          v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Guy'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }

    // 2. Initial impact gavel strike
    this.playGavelStrike();

    const now = ctx.currentTime;

    // 3. Deep 808 Sub-Bass Drop (Booming slide from 145Hz down to 38Hz)
    try {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();

      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(145, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.7);

      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(280, now);
      subFilter.frequency.exponentialRampToValueAtTime(75, now + 0.7);

      subGain.gain.setValueAtTime(0.75, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.9);
    } catch (e) {
      console.warn('Sub bass error', e);
    }

    // 4. MLG Air Horn / Trap Brass Riff ("Da-da-DAAA! Da-da-DA-DA-DAAAAA!")
    const trapNotes = [
      { f: 587.33, t: 0.08, d: 0.10 }, // D5
      { f: 587.33, t: 0.20, d: 0.10 }, // D5
      { f: 587.33, t: 0.32, d: 0.28 }, // D5 (accent)
      { f: 659.25, t: 0.65, d: 0.12 }, // E5
      { f: 587.33, t: 0.80, d: 0.14 }, // D5
      { f: 783.99, t: 0.98, d: 0.16 }, // G5
      { f: 880.00, t: 1.18, d: 0.40 }, // A5 (Epic climax!)
      { f: 1174.66, t: 1.62, d: 0.55 }, // D6 (Super high hype finisher!)
    ];

    trapNotes.forEach(note => {
      const startTime = now + note.t;
      // Dual detuned oscillators for authentic hype horn chorus
      [-6, 6].forEach(detuneCents => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, startTime);
        osc.detune.setValueAtTime(detuneCents, startTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(note.f * 1.6, startTime);
        filter.Q.setValueAtTime(2.2, startTime);

        gain.gain.setValueAtTime(0.26, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.d + 0.05);
      });
    });

    // 5. Rapid Trap Hi-Hat rolls (Sizzle triplets)
    const hiHatTimes = [0.12, 0.18, 0.24, 0.36, 0.42, 0.48, 0.60, 0.72, 0.84, 0.96, 1.02, 1.08, 1.20, 1.35, 1.50];
    hiHatTimes.forEach(t => {
      const startTime = now + t;
      const bufSize = Math.floor(ctx.sampleRate * 0.02);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(7500, startTime);

      const hatGain = ctx.createGain();
      hatGain.gain.setValueAtTime(0.18, startTime);
      hatGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);

      src.connect(hpFilter);
      hpFilter.connect(hatGain);
      hatGain.connect(ctx.destination);

      src.start(startTime);
      src.stop(startTime + 0.025);
    });
  }

  // Alert chime when user gets outbid (Descending warning chord)
  playOutbidChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [659.25, 523.25, 440.0]; // E5 -> C5 -> A4
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  // Celebratory victory sound when user wins an auction
  playAuctionWonChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const fanfare = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major arpeggio)
    fanfare.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  // ⚰️ THE UNDERTAKER FUNERAL BELL (BONGGGGG)
  playUndertakerBell() {
    if (this.isMuted) return;

    try {
      const audio = new Audio('/sounds/undertaker-bell.mp3');
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.synthesizeUndertakerBell();
        });
      }
    } catch (e) {
      this.synthesizeUndertakerBell();
    }
  }

  // Fallback acoustic bell synthesis (Deep tolling funeral bell)
  synthesizeUndertakerBell() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = [
      { freq: 110, gain: 0.65, decay: 4.8 },
      { freq: 220, gain: 0.50, decay: 4.0 },
      { freq: 277.18, gain: 0.38, decay: 3.2 },
      { freq: 330, gain: 0.32, decay: 2.6 },
      { freq: 440, gain: 0.25, decay: 2.1 },
      { freq: 554.37, gain: 0.20, decay: 1.7 },
      { freq: 659.25, gain: 0.15, decay: 1.2 }
    ];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);

      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });

    // Metallic chime strike transient
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(880, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    strikeGain.gain.setValueAtTime(0.4, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    strikeOsc.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.16);
  }

  // Ceremonial closing gavel strike ("Sold!")
  playAuctionClosedSound() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playStrike = delayTime => {
      const startTime = ctx.currentTime + delayTime;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, startTime);
      osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.18);

      oscGain.gain.setValueAtTime(0.85, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    };

    // Three solid gavel blows: "Going once... going twice... SOLD!"
    playStrike(0);
    playStrike(0.24);
    playStrike(0.5);

    // Toll the Undertaker Bell at the final strike for dramatic finish!
    setTimeout(() => {
      this.playUndertakerBell();
    }, 600);
  }
}

export const audioService = new AudioService();
export default audioService;
