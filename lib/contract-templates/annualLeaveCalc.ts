function monthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * 근로기준법 제60조에 따른 발생 연차일수를 산출한다.
 * 1년 미만은 만근 개월수만큼 1일씩(최대 11일), 1년 이상은 15일 + 최초 1년 초과 매 2년마다
 * 1일 가산(최대 25일)으로 계산한다. 80% 이상 출근을 전제로 한 단순 계산이며, 결근 등으로
 * 인한 감산은 반영하지 않는다.
 */
export function computeAccruedLeaveDays(hireDate: string, asOfDate: string): number {
  const start = new Date(hireDate);
  const end = new Date(asOfDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;

  const totalMonths = monthsBetween(start, end);
  const fullYears = Math.floor(totalMonths / 12);

  if (fullYears < 1) {
    return Math.min(11, totalMonths);
  }
  const bonus = Math.floor((fullYears - 1) / 2);
  return Math.min(25, 15 + bonus);
}

export interface AnnualLeaveSettlement {
  totalMonths: number;
  fullYears: number;
  entitledDays: number;
  /** 발생일수 − 사용일수 (선지급 반영 전) */
  remainingDays: number;
  /** 재직기간 동안 매월 선지급된 연차수당을 일수로 환산한 값 (포괄임금+선지급 적용 시에만 0보다 큼) */
  prepaidDays: number;
  /** 잔여일수에서 선지급 일수를 뺀, 실제로 정산해야 하는 최종 잔여일수 */
  netRemainingDays: number;
  dailyOrdinaryWage: number;
  /** 재직기간 동안 매월 선지급된 연차수당의 누적 추정액 (포괄임금+선지급 적용 시에만 0보다 큼) */
  prepaidTotal: number;
  /** 선지급분 차감 전 총 정산액 (잔여일수 × 1일 통상임금) */
  grossPayoutAmount: number;
  /** 선지급 일수를 차감한 최종 지급액 */
  payoutAmount: number;
}

/**
 * @param prepaidMonthlyAmount 포괄임금 + 연차수당 선지급이 적용 중일 때, 매월 급여에 이미
 *   포함되어 지급된 연차수당 금액. 재직 전 기간 동일하게 지급되어 왔다고 가정하고
 *   재직개월수만큼 누적하여 최종 정산액에서 차감한다. 해당 없으면 0을 전달한다.
 */
export function computeAnnualLeaveSettlement(
  hireDate: string,
  asOfDate: string,
  usedDays: number,
  hourlyWage: number,
  dailyStandardHours: number,
  prepaidMonthlyAmount: number
): AnnualLeaveSettlement {
  const start = new Date(hireDate);
  const end = new Date(asOfDate);
  const valid = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start;
  const totalMonths = valid ? monthsBetween(start, end) : 0;
  const fullYears = Math.floor(totalMonths / 12);
  const entitledDays = computeAccruedLeaveDays(hireDate, asOfDate);
  const remainingDays = Math.max(0, entitledDays - Math.max(0, usedDays));
  const dailyOrdinaryWage = Math.round(hourlyWage * dailyStandardHours);
  const prepaidTotal = Math.round(Math.max(0, prepaidMonthlyAmount) * totalMonths);
  // 선지급된 금액을 "일수"로 환산해 잔여일수에서 먼저 차감한다. 입사일부터 정산 기준일까지
  // 매월 선지급되어 온 연차수당이 이미 며칠 분에 해당하는지를 반영하기 위함이다.
  const prepaidDays = dailyOrdinaryWage > 0 ? prepaidTotal / dailyOrdinaryWage : 0;
  const netRemainingDays = Math.max(0, remainingDays - prepaidDays);
  const grossPayoutAmount = Math.round(remainingDays * dailyOrdinaryWage);
  const payoutAmount = Math.round(netRemainingDays * dailyOrdinaryWage);

  return {
    totalMonths,
    fullYears,
    entitledDays,
    remainingDays,
    prepaidDays,
    netRemainingDays,
    dailyOrdinaryWage,
    prepaidTotal,
    grossPayoutAmount,
    payoutAmount,
  };
}
