import { Button, Text } from '@gv-tech/ui-native';
import { View } from 'react-native';

export { applyKeypadDigit } from './scoreKeypad';

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['CLR', '0', 'DEL'],
] as const;

export function ScoreKeypadGrid({ onKey }: { onKey: (key: string) => void }) {
  return (
    <View className="gap-2.5">
      {KEYPAD_ROWS.map((row) => (
        <View key={row.join('-')} className="flex-row gap-2.5">
          {row.map((btn) => (
            <Button
              key={btn}
              onPress={() => onKey(btn)}
              variant={btn === 'CLR' ? 'destructive' : btn === 'DEL' ? 'secondary' : 'outline'}
              className="h-14 flex-1 items-center justify-center rounded-2xl py-0"
            >
              <Text className={`text-xl leading-none font-black ${btn === 'CLR' ? 'text-white' : 'text-foreground'}`}>
                {btn === 'DEL' ? '⌫' : btn}
              </Text>
            </Button>
          ))}
        </View>
      ))}
    </View>
  );
}
