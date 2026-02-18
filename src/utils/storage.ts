import AsyncStorage from "@react-native-async-storage/async-storage";
import { Achievement } from "../types";

const STORAGE_KEY = "@work_journal_achievements";

export async function getAchievements(): Promise<Achievement[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  return JSON.parse(json) as Achievement[];
}

export async function saveAchievement(
  achievement: Achievement
): Promise<void> {
  const list = await getAchievements();
  list.unshift(achievement);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function deleteAchievement(id: string): Promise<void> {
  const list = await getAchievements();
  const filtered = list.filter((a) => a.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
