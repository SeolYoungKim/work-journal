import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAchievements,
  deleteAchievement,
  updateAchievement,
} from "../utils/storage";
import { Achievement } from "../types";

function formatSectionDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (isNaN(date.getTime())) return dateStr;
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr === todayStr) {
    return `오늘 (${Number(m)}월 ${Number(d)}일)`;
  }
  return `${Number(m)}월 ${Number(d)}일 (${days[date.getDay()]})`;
}

interface Section {
  title: string;
  data: Achievement[];
}

function groupByDate(achievements: Achievement[]): Section[] {
  const map = new Map<string, Achievement[]>();
  for (const a of achievements) {
    const list = map.get(a.date) ?? [];
    list.push(a);
    map.set(a.date, list);
  }
  const dates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
  return dates.map((date) => ({
    title: formatSectionDate(date),
    data: map.get(date)!,
  }));
}

export default function RecordsScreen() {
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState("");
  const [editMetric, setEditMetric] = useState("");
  const [editImpact, setEditImpact] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAchievements();
      setSections(groupByDate(data));
    } catch {
      setSections([]);
      Alert.alert("오류", "데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      setEditingId(null);
    }, [loadData])
  );

  const handleDelete = useCallback(
    (item: Achievement) => {
      Alert.alert("삭제", "이 기록을 삭제하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAchievement(item.id);
              loadData();
            } catch {
              Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
            }
          },
        },
      ]);
    },
    [loadData]
  );

  const startEdit = useCallback((item: Achievement) => {
    setEditingId(item.id);
    setEditTask(item.task);
    setEditMetric(item.metric);
    setEditImpact(item.impact);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const saveEdit = useCallback(
    async (item: Achievement) => {
      if (!editTask.trim()) {
        Alert.alert("입력 필요", "'오늘 한 일'을 입력해주세요.");
        return;
      }
      try {
        await updateAchievement({
          ...item,
          task: editTask.trim(),
          metric: editMetric.trim(),
          impact: editImpact.trim(),
        });
        setEditingId(null);
        loadData();
      } catch {
        Alert.alert("오류", "수정 중 문제가 발생했습니다.");
      }
    },
    [editTask, editMetric, editImpact, loadData]
  );

  const showActions = useCallback(
    (item: Achievement) => {
      Alert.alert(
        item.task.length > 30 ? item.task.substring(0, 30) + "..." : item.task,
        undefined,
        [
          { text: "수정", onPress: () => startEdit(item) },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => handleDelete(item),
          },
          { text: "닫기", style: "cancel" },
        ]
      );
    },
    [startEdit, handleDelete]
  );

  const renderItem = useCallback(
    ({ item }: { item: Achievement }) => {
      if (editingId === item.id) {
        return (
          <View style={styles.editCard}>
            <TextInput
              style={[styles.editInput, styles.editMultiline]}
              value={editTask}
              onChangeText={setEditTask}
              multiline
              textAlignVertical="top"
              placeholder="오늘 한 일"
              placeholderTextColor="#aaa"
              maxLength={2000}
            />
            <TextInput
              style={styles.editInput}
              value={editMetric}
              onChangeText={setEditMetric}
              placeholder="수치 (선택)"
              placeholderTextColor="#aaa"
              maxLength={500}
            />
            <TextInput
              style={styles.editInput}
              value={editImpact}
              onChangeText={setEditImpact}
              placeholder="임팩트 (선택)"
              placeholderTextColor="#aaa"
              maxLength={500}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={cancelEdit}
              >
                <Text style={styles.editCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editSaveBtn}
                onPress={() => saveEdit(item)}
              >
                <Text style={styles.editSaveText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => showActions(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.moreIcon}>{"..."}</Text>
          </TouchableOpacity>
          <Text style={styles.taskText}>{item.task}</Text>
          {item.metric ? (
            <View style={styles.metricRow}>
              <Text style={styles.metricIcon}>📊</Text>
              <Text style={styles.metricText}>{item.metric}</Text>
            </View>
          ) : null}
          {item.impact ? (
            <View style={styles.impactRow}>
              <Text style={styles.impactIcon}>💡</Text>
              <Text style={styles.impactText}>{item.impact}</Text>
            </View>
          ) : null}
        </View>
      );
    },
    [
      editingId,
      editTask,
      editMetric,
      editImpact,
      showActions,
      cancelEdit,
      saveEdit,
    ]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <Text style={styles.sectionHeader}>{section.title}</Text>
    ),
    []
  );

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>불러오는 중...</Text>
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>기록이 없습니다</Text>
        <Text style={styles.emptyText}>첫 번째 성과를 기록해보세요!</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.emptyButtonText}>기록하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  list: {
    padding: 20,
    paddingTop: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 10,
    marginTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  moreButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 6,
    zIndex: 1,
  },
  moreIcon: {
    fontSize: 18,
    color: "#bbb",
    fontWeight: "700",
    letterSpacing: 1,
  },
  taskText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
    paddingRight: 28,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metricIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  metricText: {
    fontSize: 13,
    color: "#4A6CF7",
    fontWeight: "600",
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  impactIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  impactText: {
    fontSize: 13,
    color: "#666",
  },
  // 편집 모드
  editCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#4A6CF7",
  },
  editInput: {
    backgroundColor: "#F4F5F7",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 8,
  },
  editMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  editCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F4F5F7",
  },
  editCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  editSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#4A6CF7",
  },
  editSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  // 빈 화면
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#4A6CF7",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
