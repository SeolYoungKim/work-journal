import React, { useState } from "react";
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
import { saveAchievement } from "../utils/storage";
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

export default function HomeScreen() {
  const today = new Date();
  const [task, setTask] = useState("");
  const [metric, setMetric] = useState("");
  const [impact, setImpact] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!task.trim()) {
      Alert.alert("입력 필요", "'오늘 한 일'을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const achievement: Achievement = {
        id: Date.now().toString(),
        date: formatDate(today),
        task: task.trim(),
        metric: metric.trim(),
        impact: impact.trim(),
        createdAt: today.toISOString(),
      };
      await saveAchievement(achievement);
      setTask("");
      setMetric("");
      setImpact("");
      Alert.alert("저장 완료", "오늘의 성과가 기록되었습니다!");
    } catch {
      Alert.alert("오류", "저장 중 문제가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.date}>{formatDisplayDate(today)}</Text>
        <Text style={styles.greeting}>오늘의 성과를 기록하세요</Text>

        <View style={styles.card}>
          <Text style={styles.label}>오늘 한 일</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="어떤 일을 했나요?"
            placeholderTextColor="#aaa"
            value={task}
            onChangeText={setTask}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>수치</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 에러 로그 40% 감소"
            placeholderTextColor="#aaa"
            value={metric}
            onChangeText={setMetric}
          />

          <Text style={styles.label}>임팩트</Text>
          <TextInput
            style={styles.input}
            placeholder="왜 중요한지 한 줄로"
            placeholderTextColor="#aaa"
            value={impact}
            onChangeText={setImpact}
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
  date: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
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
