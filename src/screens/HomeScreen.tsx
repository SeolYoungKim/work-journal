import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { saveAchievement, getAchievements } from "../utils/storage";
import { Achievement } from "../types";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

function isSameDay(a: Date, b: Date): boolean {
  return formatDate(a) === formatDate(b);
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [task, setTask] = useState("");
  const [metric, setMetric] = useState("");
  const [impact, setImpact] = useState("");
  const [saving, setSaving] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  const isToday = isSameDay(selectedDate, new Date());

  const loadTodayCount = useCallback(async () => {
    const all = await getAchievements();
    const dateStr = formatDate(selectedDate);
    setTodayCount(all.filter((a) => a.date === dateStr).length);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadTodayCount();
    }, [loadTodayCount])
  );

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (d <= now) setSelectedDate(d);
  };

  const handleSave = async () => {
    if (!task.trim()) {
      Alert.alert("입력 필요", "'오늘 한 일'을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const achievement: Achievement = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        date: formatDate(selectedDate),
        task: task.trim(),
        metric: metric.trim(),
        impact: impact.trim(),
        createdAt: now.toISOString(),
      };
      await saveAchievement(achievement);
      setTask("");
      setMetric("");
      setImpact("");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTodayCount((c) => c + 1);
      Alert.alert("저장 완료", "성과가 기록되었습니다!", [
        { text: "계속 기록", style: "cancel" },
        { text: "기록 확인", onPress: () => navigation.navigate("Records") },
      ]);
    } catch {
      Alert.alert("오류", "저장 중 문제가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const canGoForward = !isSameDay(selectedDate, new Date());

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.arrow}>
            <Text style={styles.arrowText}>{"‹"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!isToday) setSelectedDate(new Date());
            }}
          >
            <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>
            {!isToday && (
              <Text style={styles.notTodayHint}>탭하여 오늘로 이동</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => shiftDate(1)}
            disabled={!canGoForward}
            style={styles.arrow}
          >
            <Text
              style={[styles.arrowText, !canGoForward && { opacity: 0.25 }]}
            >
              {"›"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>
          {todayCount === 0
            ? isToday
              ? "오늘의 성과를 기록하세요"
              : "이 날의 성과를 기록하세요"
            : `${todayCount}건 기록됨`}
        </Text>

        <View style={styles.card}>
          <Text style={[styles.label, { marginTop: 0 }]}>
            오늘 한 일 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="어떤 일을 했나요?"
            placeholderTextColor="#aaa"
            value={task}
            onChangeText={setTask}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={2000}
          />

          <Text style={styles.label}>
            수치 <Text style={styles.optional}>(선택)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="예: 에러 로그 40% 감소"
            placeholderTextColor="#aaa"
            value={metric}
            onChangeText={setMetric}
            maxLength={500}
          />

          <Text style={styles.label}>
            임팩트 <Text style={styles.optional}>(선택)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="왜 중요한지 한 줄로"
            placeholderTextColor="#aaa"
            value={impact}
            onChangeText={setImpact}
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {saving ? "저장 중..." : "저장하기"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scroll: {
    padding: 20,
    paddingTop: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  arrow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  arrowText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#4A6CF7",
  },
  date: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
  },
  notTodayHint: {
    fontSize: 11,
    color: "#4A6CF7",
    textAlign: "center",
    marginTop: 2,
  },
  greeting: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: "#EF4444",
    fontSize: 14,
  },
  optional: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "400",
  },
  input: {
    backgroundColor: "#F4F5F7",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  multiline: {
    minHeight: 80,
    paddingTop: 14,
  },
  button: {
    backgroundColor: "#4A6CF7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#4A6CF7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
