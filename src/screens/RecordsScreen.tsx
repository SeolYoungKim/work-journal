import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAchievements, deleteAchievement } from "../utils/storage";
import { Achievement } from "../types";

function formatSectionDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (isNaN(date.getTime())) return dateStr;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
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
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderItem = useCallback(
    ({ item }: { item: Achievement }) => (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.9}
      >
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
      </TouchableOpacity>
    ),
    [handleDelete]
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
        <Text style={styles.emptyText}>
          오늘의 성과를 기록해보세요!
        </Text>
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
  taskText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
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
});
