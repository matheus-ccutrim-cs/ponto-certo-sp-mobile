import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Vibration } from 'react-native';

const channelId = 'chegadas';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function readPosition() {
  if (!await Location.hasServicesEnabledAsync()) {
    return { message: 'Ative a localização do celular e tente de novo.', settings: true };
  }
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    return {
      message: 'Libere a localização para ordenar os pontos por distância. A busca continua disponível.',
      settings: !permission.canAskAgain
    };
  }
  const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const accuracy = coords.accuracy === null ? '' : ` · precisão de ±${Math.round(coords.accuracy)} m`;
  return { coords, message: 'GPS atualizado' + accuracy };
}

export async function enableNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(channelId, {
        name: 'Chegada de ônibus',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250]
      });
    }
    const status = await Notifications.requestPermissionsAsync();
    return status.granted;
  } catch {
    return false;
  }
}

export async function notifyArrival(title, body, notifications) {
  if (notifications) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: 'default' },
        trigger: Platform.OS === 'android' ? { channelId } : null
      });
      return;
    } catch {
      // O alerta em tela mantém o aviso disponível se o sistema rejeitar a notificação.
    }
  }
  Vibration.vibrate();
  Alert.alert(title, body);
}
