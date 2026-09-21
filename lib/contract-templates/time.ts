import { BreakTimeEntry } from "./types";

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function rangeEnd(start: number, end: number): number {
  return end <= start ? end + 24 * 60 : end;
}

export function breakDurationMinutes(bt: BreakTimeEntry): number {
  if (bt.mode === "FLEXIBLE") return bt.durationMinutes * bt.count;
  if (!bt.startTime || !bt.endTime) return 0;
  return rangeEnd(toMinutes(bt.startTime), toMinutes(bt.endTime)) - toMinutes(bt.startTime);
}

/** Net minutes of a work block, after subtracting break time that overlaps it. */
export function netWorkMinutes(
  startTime: string,
  endTime: string,
  breakTimes: BreakTimeEntry[]
): number {
  if (!startTime || !endTime) return 0;
  const workStart = toMinutes(startTime);
  const workEnd = rangeEnd(workStart, toMinutes(endTime));

  let breakMinutes = 0;
  for (const bt of breakTimes) {
    if (bt.mode === "FLEXIBLE") {
      // 자율시간은 근무시간 내 사용을 전제로 총 시간만 차감한다.
      breakMinutes += breakDurationMinutes(bt);
      continue;
    }
    if (!bt.startTime || !bt.endTime) continue;
    const bStart = toMinutes(bt.startTime);
    const bEnd = rangeEnd(bStart, toMinutes(bt.endTime));
    const overlap = Math.min(workEnd, bEnd) - Math.max(workStart, bStart);
    if (overlap > 0) breakMinutes += overlap;
  }

  return Math.max(0, workEnd - workStart - breakMinutes);
}

const NIGHT_START_MINUTES = 22 * 60; // 22:00
const NIGHT_SPAN_MINUTES = 8 * 60; // 22:00~다음날 06:00 = 480분

/** 근무시간 중 22:00~다음날 06:00에 해당하는, 휴게시간을 제외한 순수 야간근로 분(分)을 계산한다. */
export function nightWorkMinutes(
  startTime: string,
  endTime: string,
  breakTimes: BreakTimeEntry[]
): number {
  if (!startTime || !endTime) return 0;
  const workStart = toMinutes(startTime);
  const workEnd = rangeEnd(workStart, toMinutes(endTime));

  let nightMinutes = 0;
  // 근무가 최대 이틀을 넘지 않는다고 보고, 앞뒤로 넉넉히 야간시간대 후보를 검사한다.
  for (let dayOffset = -1; dayOffset <= 2; dayOffset++) {
    const nightStart = NIGHT_START_MINUTES + dayOffset * 24 * 60;
    const nightEnd = nightStart + NIGHT_SPAN_MINUTES;
    const segStart = Math.max(workStart, nightStart);
    const segEnd = Math.min(workEnd, nightEnd);
    if (segEnd <= segStart) continue;

    let breakOverlap = 0;
    for (const bt of breakTimes) {
      if (bt.mode === "FLEXIBLE") continue;
      if (!bt.startTime || !bt.endTime) continue;
      const bStart = toMinutes(bt.startTime);
      const bEnd = rangeEnd(bStart, toMinutes(bt.endTime));
      const overlap = Math.min(segEnd, bEnd) - Math.max(segStart, bStart);
      if (overlap > 0) breakOverlap += overlap;
    }
    nightMinutes += Math.max(0, segEnd - segStart - breakOverlap);
  }
  return nightMinutes;
}
