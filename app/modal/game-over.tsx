import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { ConfettiCelebration } from '../../src/components/ConfettiCelebration';
import { GameOverModal } from '../../src/components/GameOverModal';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useGameStore } from '../../src/stores/useGameStore';

export default function GameOverModalRoute() {
  const router = useRouter();
  const { activeGame, matchHistory, createGame, clearActiveGame } = useGameStore();

  const gameToDisplay = activeGame || matchHistory[0];

  if (!gameToDisplay) {
    return (
      <View className="will-change-variable bg-background flex-1">
        <ScreenContainer scrollable={true} className="w-full flex-1">
          <View className="w-full items-center justify-center gap-4 py-12">
            <Card className="border-border bg-card w-full items-center justify-center p-8 shadow-sm">
              <CardContent className="items-center justify-center gap-3 p-0 text-center">
                <Text className="text-4xl">🎲</Text>
                <Text className="text-foreground text-lg font-black">No Active Match Results</Text>
                <Text className="text-muted-foreground text-center text-xs leading-5 font-semibold">
                  Start a new game or select an active match to view the victory podium and score highlights.
                </Text>
                <Button onPress={() => router.dismissTo('/')} className="bg-primary mt-3 rounded-xl px-6 py-3">
                  <Text className="text-primary-foreground text-xs font-bold">Return to Main Menu</Text>
                </Button>
              </CardContent>
            </Card>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View className="will-change-variable bg-background flex-1">
      <GameOverModal
        isOpen={true}
        isRouteModal={true}
        onClose={() => {
          clearActiveGame();
          router.dismissTo('/');
        }}
        game={gameToDisplay}
        onRematch={() => {
          const setup = {
            name: gameToDisplay.name,
            presetId: gameToDisplay.presetId,
            scoringMode: gameToDisplay.scoringMode,
            roundScoringType: gameToDisplay.roundScoringType,
            targetScore: gameToDisplay.targetScore,
            targetRounds: gameToDisplay.targetRounds,
            players: gameToDisplay.players,
          };
          clearActiveGame();
          createGame(setup);
          const newGame = useGameStore.getState().activeGame;
          if (newGame) {
            router.dismissTo(`/match/${newGame.id}`);
          }
        }}
      />
      <ConfettiCelebration />
    </View>
  );
}
