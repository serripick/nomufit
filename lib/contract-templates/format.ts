import { BreakTimeEntry, Gender, WEEKDAY_LABEL, Weekday } from "./types";

/** 아직 선택되지 않았으면(서명 시 근로자가 직접 표시하도록) 양쪽을 모두 보여준다. */
export function formatGender(gender: Gender | null): string {
  if (gender === "M") return "남성";
  if (gender === "F") return "여성";
  return "남성 / 여성";
}

export function formatWeekdayList(days: Weekday[]): string {
  const order: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return order
    .filter((d) => days.includes(d))
    .map((d) => WEEKDAY_LABEL[d])
    .join(", ");
}

export function formatTimeRange(start: string, end: string): string {
  if (!start || !end) return "미입력";
  return `${start} ~ ${end}`;
}

export function formatCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

const BREAK_TYPE_LABEL: Record<BreakTimeEntry["type"], string> = {
  REST: "휴게시간",
  BREAK: "브레이크타임",
};

export function formatBreakTime(bt: BreakTimeEntry): string {
  const label = BREAK_TYPE_LABEL[bt.type];
  if (bt.mode === "FLEXIBLE") {
    return `${label}: ${bt.durationMinutes}분씩 ${bt.count}회 (정해진 시각 없이 근무시간 중 자율적으로 사용)`;
  }
  return `${label}: ${bt.startTime} ~ ${bt.endTime}`;
}

export function addMonthsToDateString(dateStr: string, months: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0 && m <= 0) return "0분";
  if (m === 0) return `${h}시간`;
  if (h === 0) return `${m}분`;
  return `${h}시간 ${m}분`;
}
