function monthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface YearlyLeaveEntry {
  /** 몇 년차 근속연도인지 (1년차, 2년차, ...) */
  yearIndex: number;
  startDate: string;
  /** 이 근속연도가 끝나는 날짜(다음 anniversary), 진행 중이면 정산 기준일 */
  endDate: string;
  /** 이 구간에 포함된 개월수 (진행 중인 마지막 연도는 실제 경과분만) */
  monthsInYear: number;
  /** 이 근속연도에 확정 발생한 총 연차일수 */
  entitledDays: number;
  /** 정산 기준일 현재 아직 끝나지 않고 진행 중인 연도인지 */
  isOngoing: boolean;
}

/**
 * 근로기준법 제60조에 따른 근속연도별 연차 발생 내역을 산출한다.
 * - 1년차: 매월 개근 시 1일씩 일할 발생(최대 11일) — 조기 퇴직 시 완료된 개월수만큼만 발생.
 * - 2년차부터: 매 anniversary(만 1년, 2년, ...)를 채우는 순간 그 해 몫이 한 번에 확정
 *   부여되며, 그 뒤 조기 퇴직해도 일할로 깎이지 않는다. 최초 1년을 초과하는 계속근로연수
 *   매 2년마다 1일씩 가산(최대 25일)된다.
 * 80% 이상 출근을 전제로 한 단순 계산이며, 결근 등으로 인한 감산은 반영하지 않는다.
 */
export function computeYearlyLeaveEntitlements(hireDate: string, asOfDate: string): YearlyLeaveEntry[] {
  const start = new Date(hireDate);
  const end = new Date(asOfDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];

  const entries: YearlyLeaveEntry[] = [];
  const year1End = addMonths(start, 12);
  const year1ActualEnd = end < year1End ? end : year1End;
  entries.push({
    yearIndex: 1,
    startDate: toISODate(start),
    endDate: toISODate(year1ActualEnd),
    monthsInYear: monthsBetween(start, year1ActualEnd),
    entitledDays: Math.min(11, monthsBetween(start, year1ActualEnd)),
    isOngoing: end < year1End,
  });
  if (end < year1End) return entries;

  const totalMonths = monthsBetween(start, end);
  const fullYears = Math.floor(totalMonths / 12);
  for (let y = 1; y <= fullYears; y++) {
    const periodStart = addMonths(start, y * 12);
    const periodEnd = addMonths(start, (y + 1) * 12);
    const periodActualEnd = end < periodEnd ? end : periodEnd;
    const bonus = Math.floor((y - 1) / 2);
    entries.push({
      yearIndex: y + 1,
      startDate: toISODate(periodStart),
      endDate: toISODate(periodActualEnd),
      monthsInYear: monthsBetween(periodStart, periodActualEnd),
      entitledDays: Math.min(25, 15 + bonus),
      isOngoing: end < periodEnd,
    });
  }
  return entries;
}

export interface YearlyLeaveSettlementRow extends YearlyLeaveEntry {
  usedDays: number;
  /** 발생일수 − 사용일수 */
  remainingDays: number;
  /** 이 연도 구간에 해당하는, 포괄임금으로 선지급되어 온 것으로 보는 일수 */
  prepaidDaysForYear: number;
  /** 잔여일수에서 선지급 일수를 뺀 최종 잔여일수 */
  netRemainingDays: number;
}

export interface AnnualLeaveMultiYearSettlement {
  rows: YearlyLeaveSettlementRow[];
  dailyOrdinaryWage: number;
  /** 정산 대상으로 고른 연도(들)의 최종 잔여일수 합 */
  selectedNetRemainingDays: number;
  /** 정산 대상 최종 지급액 */
  payoutAmount: number;
}

/**
 * @param usedDaysByYear 근속연도(yearIndex)별 실제 사용한 연차일수.
 * @param targetYearIndex "ALL"이면 전체 근속기간 미사용분을 합산(퇴직 정산용), 특정 연도
 *   번호면 그 해만 정산(재직 중 연간 정산용).
 * @param prepaidMonthlyAmount 포괄임금 + 연차수당 선지급이 적용 중일 때, 매월 급여에 이미
 *   포함되어 지급된 연차수당 금액. 해당 없으면 0을 전달한다.
 */
export function computeMultiYearLeaveSettlement(
  hireDate: string,
  asOfDate: string,
  usedDaysByYear: Record<number, number>,
  targetYearIndex: number | "ALL",
  hourlyWage: number,
  dailyStandardHours: number,
  prepaidMonthlyAmount: number
): AnnualLeaveMultiYearSettlement {
  const entries = computeYearlyLeaveEntitlements(hireDate, asOfDate);
  const dailyOrdinaryWage = Math.round(hourlyWage * dailyStandardHours);

  const rows: YearlyLeaveSettlementRow[] = entries.map((entry) => {
    const usedDays = Math.max(0, usedDaysByYear[entry.yearIndex] ?? 0);
    const remainingDays = Math.max(0, entry.entitledDays - usedDays);
    const prepaidForYear = Math.max(0, prepaidMonthlyAmount) * entry.monthsInYear;
    const prepaidDaysForYear = dailyOrdinaryWage > 0 ? prepaidForYear / dailyOrdinaryWage : 0;
    const netRemainingDays = Math.max(0, remainingDays - prepaidDaysForYear);
    return { ...entry, usedDays, remainingDays, prepaidDaysForYear, netRemainingDays };
  });

  const selectedRows =
    targetYearIndex === "ALL" ? rows : rows.filter((r) => r.yearIndex === targetYearIndex);
  const selectedNetRemainingDays = selectedRows.reduce((sum, r) => sum + r.netRemainingDays, 0);
  const payoutAmount = Math.round(selectedNetRemainingDays * dailyOrdinaryWage);

  return { rows, dailyOrdinaryWage, selectedNetRemainingDays, payoutAmount };
}
