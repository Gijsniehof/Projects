import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';

/**
 * Android back button mid-game: ask before leaving, so an accidental press
 * while passing the phone doesn't drop the round (or expose a card).
 * iOS swipe-back is disabled per screen in each game's layout.
 *
 * @param exitTo where "Stoppen" goes, usually the game's setup screen
 * @param message optional explanation shown in the dialog
 */
export function useLeaveGuard(exitTo: Href, message = 'Je gaat terug naar de instellingen.') {
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        Alert.alert('Ronde stoppen?', message, [
          { text: 'Doorspelen', style: 'cancel' },
          { text: 'Stoppen', style: 'destructive', onPress: () => router.dismissTo(exitTo) },
        ]);
        return true;
      });
      return () => sub.remove();
    }, [exitTo, message]),
  );
}
