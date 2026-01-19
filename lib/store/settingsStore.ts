import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, Difficulty } from '@/lib/types';

const DEFAULT_SETTINGS: Settings = {
  // Audio
  soundEnabled: true,
  soundVolume: 0.7,
  hapticsEnabled: true,
  
  // Visual
  theme: 'dark',
  reducedMotion: false,
  
  // Gameplay
  timerStyle: 'down',
  difficulty: 'normal',
  autoCapitalize: true,
  allowHyphens: true,
  allowSpaces: true,
  
  // Rules
  selectedRulePack: 'classic',
  noRepeatRules: true,
  noRepeatLetters: false,
  
  // Accessibility
  dyslexiaFont: false,
};

interface SettingsState extends Settings {
  // Actions
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setTheme: (theme: Settings['theme']) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleReducedMotion: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      
      updateSetting: (key, value) => {
        set({ [key]: value });
      },
      
      updateSettings: (updates) => {
        set(updates);
      },
      
      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
      
      toggleSound: () => {
        set({ soundEnabled: !get().soundEnabled });
      },
      
      toggleHaptics: () => {
        set({ hapticsEnabled: !get().hapticsEnabled });
      },
      
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark', 'light', 'high-contrast');
          if (theme !== 'dark') {
            document.documentElement.classList.add(theme);
          }
        }
      },
      
      setDifficulty: (difficulty) => {
        set({ difficulty });
      },
      
      toggleReducedMotion: () => {
        set({ reducedMotion: !get().reducedMotion });
        // Apply reduced motion class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('reduced-motion', !get().reducedMotion);
        }
      },
    }),
    {
      name: 'noggin-settings',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        hapticsEnabled: state.hapticsEnabled,
        theme: state.theme,
        reducedMotion: state.reducedMotion,
        timerStyle: state.timerStyle,
        difficulty: state.difficulty,
        autoCapitalize: state.autoCapitalize,
        allowHyphens: state.allowHyphens,
        allowSpaces: state.allowSpaces,
        selectedRulePack: state.selectedRulePack,
        noRepeatRules: state.noRepeatRules,
        noRepeatLetters: state.noRepeatLetters,
        dyslexiaFont: state.dyslexiaFont,
      }),
    }
  )
);

// Selectors
export const selectSoundEnabled = (state: SettingsState) => state.soundEnabled;
export const selectTheme = (state: SettingsState) => state.theme;
export const selectDifficulty = (state: SettingsState) => state.difficulty;
export const selectReducedMotion = (state: SettingsState) => state.reducedMotion;
