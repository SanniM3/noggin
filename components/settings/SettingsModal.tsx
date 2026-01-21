'use client';

import { useSettingsStore } from '@/lib/store/settingsStore';
import { useGameStore } from '@/lib/store/gameStore';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useSettingsStore();
  const { settings: gameSettings, setUseAIValidation } = useGameStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        {/* Audio Section */}
        <section>
          <h3 className="text-sm font-semibold text-noggin-text-muted uppercase tracking-wider mb-3">
            Audio
          </h3>
          <div className="space-y-4">
            <SettingToggle
              label="Sound Effects"
              description="Play sounds for game actions"
              checked={settings.soundEnabled}
              onChange={settings.toggleSound}
            />
            <SettingToggle
              label="Haptic Feedback"
              description="Vibration on mobile devices"
              checked={settings.hapticsEnabled}
              onChange={settings.toggleHaptics}
            />
            {settings.soundEnabled && (
              <div>
                <label className="block text-sm mb-2">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume * 100}
                  onChange={(e) =>
                    settings.updateSetting('soundVolume', parseInt(e.target.value) / 100)
                  }
                  className="w-full h-2 bg-noggin-bg rounded-lg appearance-none cursor-pointer accent-noggin-primary"
                />
              </div>
            )}
          </div>
        </section>

        {/* Visual Section */}
        <section>
          <h3 className="text-sm font-semibold text-noggin-text-muted uppercase tracking-wider mb-3">
            Visual
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Theme</label>
              <div className="flex gap-2">
                {(['dark', 'light', 'high-contrast'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => settings.setTheme(theme)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-colors',
                      settings.theme === theme
                        ? 'bg-noggin-primary text-white'
                        : 'bg-noggin-bg hover:bg-noggin-surface-hover'
                    )}
                  >
                    {theme.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <SettingToggle
              label="Reduced Motion"
              description="Minimize animations"
              checked={settings.reducedMotion}
              onChange={settings.toggleReducedMotion}
            />
          </div>
        </section>

        {/* AI Validation Section */}
        <section>
          <h3 className="text-sm font-semibold text-noggin-text-muted uppercase tracking-wider mb-3">
            🤖 AI Validation
          </h3>
          <div className="space-y-4">
            <SettingToggle
              label="AI Answer Verification"
              description="Use AI to validate words, celebrities, and associations"
              checked={gameSettings.useAIValidation}
              onChange={() => setUseAIValidation(!gameSettings.useAIValidation)}
            />
            {gameSettings.useAIValidation && (
              <div className="text-xs text-noggin-text-muted bg-noggin-bg/50 p-3 rounded-lg">
                <p className="font-medium text-noggin-accent mb-1">Requires OpenAI API Key</p>
                <p>Set <code className="bg-noggin-bg px-1 rounded">OPENAI_API_KEY</code> in your environment to enable AI validation. Without it, answers will be accepted with a warning.</p>
              </div>
            )}
          </div>
        </section>

        {/* Gameplay Section */}
        <section>
          <h3 className="text-sm font-semibold text-noggin-text-muted uppercase tracking-wider mb-3">
            Gameplay
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Default Difficulty</label>
              <div className="flex gap-2">
                {(['easy', 'normal', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => settings.setDifficulty(diff)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-colors',
                      settings.difficulty === diff
                        ? 'bg-noggin-primary text-white'
                        : 'bg-noggin-bg hover:bg-noggin-surface-hover'
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            <SettingToggle
              label="No Repeat Rules"
              description="Avoid same rule twice in a row"
              checked={settings.noRepeatRules}
              onChange={() =>
                settings.updateSetting('noRepeatRules', !settings.noRepeatRules)
              }
            />
            <SettingToggle
              label="Auto-Capitalize"
              description="Automatically capitalize input"
              checked={settings.autoCapitalize}
              onChange={() =>
                settings.updateSetting('autoCapitalize', !settings.autoCapitalize)
              }
            />
          </div>
        </section>

        {/* Accessibility Section */}
        <section>
          <h3 className="text-sm font-semibold text-noggin-text-muted uppercase tracking-wider mb-3">
            Accessibility
          </h3>
          <div className="space-y-4">
            <SettingToggle
              label="Dyslexia-Friendly Font"
              description="Use OpenDyslexic font"
              checked={settings.dyslexiaFont}
              onChange={() =>
                settings.updateSetting('dyslexiaFont', !settings.dyslexiaFont)
              }
            />
          </div>
        </section>

        {/* Reset */}
        <div className="pt-4 border-t border-noggin-border">
          <button
            onClick={settings.resetSettings}
            className="text-sm text-feedback-incorrect hover:underline"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Toggle component
function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-noggin-text-muted">{description}</div>
        )}
      </div>
      <button
        onClick={onChange}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-noggin-primary' : 'bg-noggin-border'
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}
