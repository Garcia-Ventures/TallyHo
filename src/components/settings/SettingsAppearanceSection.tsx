import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch, Text } from '@gv-tech/ui-native';
import { Moon, Smartphone, Sun, Vibrate, Volume2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { PALETTE } from '../../constants/colors';
import { nativeSound } from '../../services/audio';
import { useSettingsStore } from '../../stores/useSettingsStore';

export function SettingsAppearanceSection() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    nativeSound.playPresetSelect();
    updateSettings({ themeMode: mode });
  };

  return (
    <>
      <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <CardHeader className="mb-4 gap-1 p-0">
          <View className="flex-row items-center gap-2">
            <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
              <Sun size={18} color={PALETTE.chip.sage} />
            </View>
            <CardTitle className="text-foreground text-lg font-black">Appearance</CardTitle>
          </View>
          <CardDescription className="text-muted-foreground text-xs font-medium">
            Choose your visual presentation theme.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3 p-0">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleThemeChange('system')}
              className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                settings.themeMode === 'system' ? 'border-chip-sage bg-chip-sage/15' : ''
              }`}
            >
              <Smartphone size={16} color={settings.themeMode === 'system' ? PALETTE.chip.sage : PALETTE.ink.muted} />
              <Text
                className={`text-xs font-bold ${
                  settings.themeMode === 'system' ? 'text-chip-sage' : 'text-foreground'
                }`}
              >
                System
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleThemeChange('light')}
              className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                settings.themeMode === 'light' ? 'border-chip-sage bg-chip-sage/15' : ''
              }`}
            >
              <Sun size={16} color={settings.themeMode === 'light' ? PALETTE.chip.sage : PALETTE.ink.muted} />
              <Text
                className={`text-xs font-bold ${settings.themeMode === 'light' ? 'text-chip-sage' : 'text-foreground'}`}
              >
                Light
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleThemeChange('dark')}
              className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                settings.themeMode === 'dark' ? 'border-chip-sage bg-chip-sage/15' : ''
              }`}
            >
              <Moon size={16} color={settings.themeMode === 'dark' ? PALETTE.chip.sage : PALETTE.ink.muted} />
              <Text
                className={`text-xs font-bold ${settings.themeMode === 'dark' ? 'text-chip-sage' : 'text-foreground'}`}
              >
                Dark
              </Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>

      <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <CardHeader className="mb-4 gap-1 p-0">
          <View className="flex-row items-center gap-2">
            <View className="bg-chip-mustard/15 h-8 w-8 items-center justify-center rounded-full">
              <Volume2 size={18} color={PALETTE.chip.mustard} />
            </View>
            <CardTitle className="text-foreground text-lg font-black">Sensory Feedback</CardTitle>
          </View>
          <CardDescription className="text-muted-foreground text-xs font-medium">
            Configure app sound effects and tactile vibrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4 p-0">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
              <Volume2 size={16} color={PALETTE.ink.muted} className="shrink-0" />
              <View className="min-w-0 flex-1">
                <Text className="text-foreground text-xs font-bold">Sound Effects</Text>
                <Text className="text-muted-foreground text-[10px] leading-tight font-medium">
                  Play audio feedback during gameplay and taps
                </Text>
              </View>
            </View>
            <Switch
              className="shrink-0"
              checked={settings.soundEnabled}
              onCheckedChange={(val: boolean) => {
                updateSettings({ soundEnabled: val });
                if (val) {
                  nativeSound.playPresetSelect();
                }
              }}
            />
          </View>

          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
              <Vibrate size={16} color={PALETTE.ink.muted} className="shrink-0" />
              <View className="min-w-0 flex-1">
                <Text className="text-foreground text-xs font-bold">Haptic Feedback</Text>
                <Text className="text-muted-foreground text-[10px] leading-tight font-medium">
                  Tactile vibrations for keypad and score taps
                </Text>
              </View>
            </View>
            <Switch
              className="shrink-0"
              checked={settings.hapticsEnabled}
              onCheckedChange={(val: boolean) => updateSettings({ hapticsEnabled: val })}
            />
          </View>
        </CardContent>
      </Card>
    </>
  );
}
