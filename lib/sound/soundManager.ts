'use client';

import { Howl, Howler } from 'howler';

// Sound effect types
type SoundEffect =
  | 'deal'
  | 'correct'
  | 'incorrect'
  | 'streak'
  | 'skip'
  | 'tick'
  | 'timeWarning'
  | 'gameOver';

// Sound definitions with inline base64 or generated tones
// For MVP, we'll use programmatic audio generation
class SoundManager {
  private sounds: Map<SoundEffect, Howl> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.7;
  private initialized: boolean = false;

  constructor() {
    // Don't initialize in SSR
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    // Create AudioContext for generating tones
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Generate simple tones as base64 audio
    this.createToneSound('deal', audioContext, 440, 0.1, 'sine');
    this.createToneSound('correct', audioContext, 880, 0.15, 'sine');
    this.createToneSound('incorrect', audioContext, 220, 0.2, 'sawtooth');
    this.createToneSound('streak', audioContext, 1320, 0.3, 'sine');
    this.createToneSound('skip', audioContext, 330, 0.1, 'triangle');
    this.createToneSound('tick', audioContext, 660, 0.05, 'sine');
    this.createToneSound('timeWarning', audioContext, 550, 0.15, 'square');
    this.createToneSound('gameOver', audioContext, 440, 0.5, 'sine');
  }

  private createToneSound(
    name: SoundEffect,
    ctx: AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType
  ) {
    // Create an offline context to render the tone
    const offlineCtx = new OfflineAudioContext(1, ctx.sampleRate * duration, ctx.sampleRate);
    
    const oscillator = offlineCtx.createOscillator();
    const gainNode = offlineCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, 0);
    
    // Envelope
    gainNode.gain.setValueAtTime(0, 0);
    gainNode.gain.linearRampToValueAtTime(0.3, 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    
    oscillator.start(0);
    oscillator.stop(duration);
    
    offlineCtx.startRendering().then((buffer) => {
      // Convert AudioBuffer to WAV blob
      const wav = this.audioBufferToWav(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const howl = new Howl({
        src: [url],
        volume: this.volume,
        preload: true,
      });
      
      this.sounds.set(name, howl);
    });
  }

  // Convert AudioBuffer to WAV format
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const data = buffer.getChannelData(0);
    const samples = data.length;
    const dataSize = samples * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write samples
    let offset = 44;
    for (let i = 0; i < samples; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  play(effect: SoundEffect) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(effect);
    if (sound) {
      sound.play();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      Howler.mute(true);
    } else {
      Howler.mute(false);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.volume);
    
    // Update individual sounds
    this.sounds.forEach((sound) => {
      sound.volume(this.volume);
    });
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }
}

// Singleton instance
let soundManager: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManager && typeof window !== 'undefined') {
    soundManager = new SoundManager();
  }
  return soundManager!;
}

// Hook for React components
export function useSound() {
  const manager = getSoundManager();
  
  return {
    play: (effect: SoundEffect) => manager?.play(effect),
    setEnabled: (enabled: boolean) => manager?.setEnabled(enabled),
    setVolume: (volume: number) => manager?.setVolume(volume),
    isEnabled: () => manager?.isEnabled() ?? true,
    getVolume: () => manager?.getVolume() ?? 0.7,
  };
}
