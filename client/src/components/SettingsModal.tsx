import { useState } from 'react';
import { MacWindow } from './MacWindow';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { WindowState } from '../App';
import type { PortfolioSettings } from '../../../server/src/schema';

interface SettingsModalProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onUpdatePosition: (windowId: string, position: { x: number; y: number }) => void;
  onUpdateSize: (windowId: string, size: { width: number; height: number }) => void;
  settings: PortfolioSettings | null;
  onSettingsUpdate: (settings: Partial<PortfolioSettings>) => Promise<boolean>;
}

export function SettingsModal({
  window,
  onClose,
  onMinimize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  settings,
  onSettingsUpdate
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState({
    sound_enabled: settings?.sound_enabled ?? true,
    theme: settings?.theme ?? 'classic' as const,
    animation_speed: settings?.animation_speed ?? 'normal' as const,
    show_visitor_count: settings?.show_visitor_count ?? true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSettingsUpdate(localSettings);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      sound_enabled: true,
      theme: 'classic' as const,
      animation_speed: 'normal' as const,
      show_visitor_count: true
    };
    setLocalSettings(defaultSettings);
  };

  const themeOptions = [
    { value: 'classic', label: 'Classic Purple', preview: 'from-purple-600 to-purple-800' },
    { value: 'dark', label: 'Dark Mode', preview: 'from-gray-800 to-black' },
    { value: 'retro', label: 'Retro Green', preview: 'from-green-600 to-teal-700' }
  ];

  const speedOptions = [
    { value: 'slow', label: 'Slow & Smooth', icon: '🐌' },
    { value: 'normal', label: 'Normal Speed', icon: '🚶‍♂️' },
    { value: 'fast', label: 'Fast & Snappy', icon: '🏃‍♂️' }
  ];

  return (
    <MacWindow
      window={window}
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      onUpdatePosition={onUpdatePosition}
      onUpdateSize={onUpdateSize}
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-purple-900 mb-2">Settings</h1>
          <p className="text-purple-700">Customize your portfolio experience</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700">
              <div className="text-xl mr-3">✅</div>
              <div>Settings saved successfully!</div>
            </div>
          </div>
        )}

        {/* Audio Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 flex items-center">
              🔊 Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-purple-800">Sound Effects</div>
                <div className="text-sm text-purple-600">
                  Enable nostalgic sound effects for interactions
                </div>
              </div>
              <Switch
                checked={localSettings.sound_enabled}
                onCheckedChange={(checked: boolean) => 
                  setLocalSettings(prev => ({ ...prev, sound_enabled: checked }))
                }
              />
            </div>
            
            {localSettings.sound_enabled && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 mb-2">Sound Preview:</div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('🔊 Button click sound')}
                    className="text-xs"
                  >
                    🎵 Click
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('🔊 Success sound')}
                    className="text-xs"
                  >
                    ✨ Success
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => console.log('🔊 Window open sound')}
                    className="text-xs"
                  >
                    📱 Window
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 flex items-center">
              🎨 Theme Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-semibold text-purple-800 mb-3">Color Theme</div>
              <div className="grid grid-cols-1 gap-3">
                {themeOptions.map((theme) => (
                  <div
                    key={theme.value}
                    onClick={() => setLocalSettings(prev => ({ ...prev, theme: theme.value as any }))}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      localSettings.theme === theme.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.preview}`}></div>
                        <div>
                          <div className="font-semibold text-purple-800">{theme.label}</div>
                          <div className="text-sm text-purple-600 capitalize">{theme.value} theme</div>
                        </div>
                      </div>
                      {localSettings.theme === theme.value && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 flex items-center">
              ⚡ Animation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-semibold text-purple-800 mb-3">Animation Speed</div>
              <div className="space-y-2">
                {speedOptions.map((speed) => (
                  <div
                    key={speed.value}
                    onClick={() => setLocalSettings(prev => ({ ...prev, animation_speed: speed.value as any }))}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      localSettings.animation_speed === speed.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{speed.icon}</div>
                        <div>
                          <div className="font-semibold text-purple-800">{speed.label}</div>
                        </div>
                      </div>
                      {localSettings.animation_speed === speed.value && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900 flex items-center">
              🔒 Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-purple-800">Show Visitor Count</div>
                <div className="text-sm text-purple-600">
                  Display visitor statistics in the About section
                </div>
              </div>
              <Switch
                checked={localSettings.show_visitor_count}
                onCheckedChange={(checked: boolean) => 
                  setLocalSettings(prev => ({ ...prev, show_visitor_count: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              '💾 Save Settings'
            )}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            🔄 Reset to Defaults
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-purple-200 text-center">
          <p className="text-sm text-purple-600">
            💡 Settings are automatically saved and applied across your session
          </p>
        </div>
      </div>
    </MacWindow>
  );
}