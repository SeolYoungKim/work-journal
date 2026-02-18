export interface Achievement {
  id: string;
  date: string; // YYYY-MM-DD
  task: string; // 오늘 한 일
  metric: string; // 수치
  impact: string; // 임팩트
  createdAt: string; // ISO timestamp
}
