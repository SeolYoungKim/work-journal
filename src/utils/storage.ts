import AsyncStorage from "@react-native-async-storage/async-storage";
import { Achievement } from "../types";

const STORAGE_KEY = "@work_journal_achievements";

// 뮤텍스: 동시 읽기-수정-쓰기 경쟁 조건 방지
let mutex = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = mutex.then(fn);
  mutex = result.then(
    () => {},
    () => {}
  );
  return result;
}

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as Achievement[];
  } catch {
    return [];
  }
}

export function saveAchievement(achievement: Achievement): Promise<void> {
  return withLock(async () => {
    const list = await getAchievements();
    list.unshift(achievement);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  });
}

export function deleteAchievement(id: string): Promise<void> {
  return withLock(async () => {
    const list = await getAchievements();
    const filtered = list.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  });
}
