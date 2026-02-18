import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) {
    return; // 시뮬레이터에서는 동작하지 않음
  }

  const { status: existing } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminder", {
      name: "일일 성과 알림",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  // 기존 예약된 알림 취소
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "성과 기록 시간",
      body: "오늘 성과 기록할 시간이에요! 📝",
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}
