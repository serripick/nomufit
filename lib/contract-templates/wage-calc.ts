import { BreakTimeEntry, EmploymentPatternData, WageInfo, WeekSchedule } from "./types";
import { netWorkMinutes, nightWorkMinutes } from "./time";
import { MINIMUM_HOURLY_WAGE } from "./minimumWage";

const WEEKS_PER_MONTH = 365 / 7 / 12; // ≈ 4.345
const AVG_DAYS_PER_MONTH = 365 / 12; // ≈ 30.44
const STATUTORY_DAILY_CAP_MINUTES = 8 * 60;
const STATUTORY_WEEKLY_CAP_HOURS = 40; // 소정근로시간 상한 (근로기준법 제50조), 초과분은 연장근로
const WEEKLY_HOURS_THRESHOLD_FOR_HOLIDAY = 15; // 주휴수당 발생 기준 (근로기준법 제18조)

function weekScheduleTotals(schedule: WeekSchedule, breakTimes: BreakTimeEntry[]) {
  const days = Object.values(schedule).filter((d): d is NonNullable<typeof d> => !!d);
  const dayMinutes = days.map((d) => netWorkMinutes(d.startTime, d.endTime, breakTimes));
  const nightMinutes = days.map((d) => nightWorkMinutes(d.startTime, d.endTime, breakTimes));
  const totalMinutes = dayMinutes.reduce((sum, m) => sum + m, 0);
  const totalNightMinutes = nightMinutes.reduce((sum, m) => sum + m, 0);
  return { totalMinutes, totalNightMinutes, dayCount: dayMinutes.length, dayMinutes };
}

function allEqual(values: number[]): boolean {
  return values.every((v) => v === values[0]);
}

/** 주 소정근로시간(분)과 평균 1일 소정근로시간(분)을 근무패턴으로부터 산출한다. */
function getWeeklyAndDailyMinutes(
  pattern: EmploymentPatternData,
  breakTimes: BreakTimeEntry[]
): {
  weeklyMinutes: number;
  weeklyNightMinutes: number;
  dailyMinutes: number;
  weeklyWorkDays: number;
  hasUniformDailyHours: boolean;
} {
  switch (pattern.type) {
    case "WEEKLY_SCHEDULE": {
      const { totalMinutes, totalNightMinutes, dayCount, dayMinutes } = weekScheduleTotals(
        pattern.schedule,
        breakTimes
      );
      return {
        weeklyMinutes: totalMinutes,
        weeklyNightMinutes: totalNightMinutes,
        dailyMinutes: dayCount > 0 ? totalMinutes / dayCount : 0,
        weeklyWorkDays: dayCount,
        hasUniformDailyHours: allEqual(dayMinutes),
      };
    }
    case "ALTERNATING_WEEK": {
      const a = weekScheduleTotals(pattern.weekASchedule, breakTimes);
      const b = weekScheduleTotals(pattern.weekBSchedule, breakTimes);
      const weeklyMinutes = (a.totalMinutes + b.totalMinutes) / 2;
      const weeklyNightMinutes = (a.totalNightMinutes + b.totalNightMinutes) / 2;
      const dayCount = (a.dayCount + b.dayCount) / 2;
      return {
        weeklyMinutes,
        weeklyNightMinutes,
        dailyMinutes: dayCount > 0 ? weeklyMinutes / dayCount : 0,
        weeklyWorkDays: dayCount,
        hasUniformDailyHours: allEqual([...a.dayMinutes, ...b.dayMinutes]),
      };
    }
    case "ALTERNATING_DAY": {
      const dailyMinutes = netWorkMinutes(pattern.workStartTime, pattern.workEndTime, breakTimes);
      const dailyNightMinutes = nightWorkMinutes(pattern.workStartTime, pattern.workEndTime, breakTimes);
      return {
        weeklyMinutes: dailyMinutes * 3.5,
        weeklyNightMinutes: dailyNightMinutes * 3.5,
        dailyMinutes,
        weeklyWorkDays: 3.5,
        hasUniformDailyHours: true,
      };
    }
    case "MONTHLY_OFF": {
      const dailyMinutes = netWorkMinutes(pattern.shiftStartTime, pattern.shiftEndTime, breakTimes);
      const dailyNightMinutes = nightWorkMinutes(
        pattern.shiftStartTime,
        pattern.shiftEndTime,
        breakTimes
      );
      const workDaysPerMonth = Math.max(0, AVG_DAYS_PER_MONTH - pattern.restDaysPerMonth);
      const weeklyWorkDays = workDaysPerMonth / WEEKS_PER_MONTH;
      return {
        weeklyMinutes: dailyMinutes * weeklyWorkDays,
        weeklyNightMinutes: dailyNightMinutes * weeklyWorkDays,
        dailyMinutes,
        weeklyWorkDays,
        hasUniformDailyHours: true,
      };
    }
  }
}

export interface ScheduleStats {
  /** 휴게시간을 제외한 실제 1일 평균 근로시간 (법정 상한 미적용, 안내 표시용) */
  dailyRawHours: number;
  /** 휴게시간을 제외한 실제 1주 근로시간 (40시간 상한 미적용) */
  weeklyHours: number;
  /** 1주 40시간을 초과하는 연장근로시간 */
  weeklyOvertimeHours: number;
  /** 연차·주휴수당 계산에 쓰이는, 8시간 상한이 적용된 1일 소정근로시간 */
  dailyStandardHours: number;
  /** 1주 40시간 상한이 적용된, 기본급 산정의 기준이 되는 월 소정근로시간 (정상 근무 시 약 209시간) */
  monthlyStandardHours: number;
  /** 월 환산 연장근로시간 */
  monthlyOvertimeHours: number;
  /** 월 환산 야간근로시간 (22:00~다음날 06:00, 휴게시간 제외) */
  monthlyNightHours: number;
  /** 월 평균 근무일수 (일급제에서 일당을 월 환산 총액으로 바꿀 때 사용) */
  monthlyWorkDays: number;
  /** 근무일마다 근로시간이 동일한지 여부. false면 "1일 평균"이 실제 근무일 어디와도 일치하지 않을 수 있다. */
  hasUniformDailyHours: boolean;
}

/** 근무패턴·휴게시간만으로 산출되는 근로시간 통계 (기본급과 무관). */
export function computeScheduleStats(
  pattern: EmploymentPatternData,
  breakTimes: BreakTimeEntry[]
): ScheduleStats {
  const { weeklyMinutes, weeklyNightMinutes, dailyMinutes, weeklyWorkDays, hasUniformDailyHours } =
    getWeeklyAndDailyMinutes(pattern, breakTimes);
  const weeklyHours = weeklyMinutes / 60;
  const dailyRawHours = dailyMinutes / 60;
  const dailyStandardHours = Math.min(STATUTORY_DAILY_CAP_MINUTES, dailyMinutes) / 60;

  const cappedWeeklyHours = Math.min(STATUTORY_WEEKLY_CAP_HOURS, weeklyHours);
  const weeklyOvertimeHours = Math.max(0, weeklyHours - STATUTORY_WEEKLY_CAP_HOURS);
  // 주휴시간은 요일별 실제 근무시간의 평균이 아니라, (상한 적용된) 1주 소정근로시간을
  // 5일 기준으로 환산한 값이다. 그렇지 않으면 토요일에 짧게 몇 시간만 일하는 식의
  // 요일별 상이 패턴에서 평균이 끌려 내려가 209시간 기준이 어긋난다.
  const weeklyHolidayHours =
    cappedWeeklyHours >= WEEKLY_HOURS_THRESHOLD_FOR_HOLIDAY ? cappedWeeklyHours / 5 : 0;
  // 실무 관행상 월 소정근로시간은 정수로 고정해서 쓴다(주 40시간 기준 209시간).
  // 화면에 보이는 자릿수와 실제 계산에 쓰이는 값이 다르면 사용자가 직접 검산했을 때
  // 어긋나 보이므로, 반올림한 값을 그대로 통상시급 계산에도 사용한다.
  const monthlyStandardHours = Math.round((cappedWeeklyHours + weeklyHolidayHours) * WEEKS_PER_MONTH);
  const monthlyOvertimeHours = weeklyOvertimeHours * WEEKS_PER_MONTH;
  const monthlyNightHours = (weeklyNightMinutes / 60) * WEEKS_PER_MONTH;
  const monthlyWorkDays = weeklyWorkDays * WEEKS_PER_MONTH;

  return {
    dailyRawHours,
    weeklyHours,
    weeklyOvertimeHours,
    dailyStandardHours,
    monthlyStandardHours,
    monthlyOvertimeHours,
    monthlyNightHours,
    monthlyWorkDays,
    hasUniformDailyHours,
  };
}

export interface WageBreakdown extends ScheduleStats {
  nonTaxableTotal: number;
  /** 임금총액에서 비과세·수당을 역산하여 산출한 기본급 */
  baseSalary: number;
  hourlyWage: number;
  /** 연장·휴일근로 가산율 (상시근로자 5인 이상 1.5, 5인 미만 1.0) */
  premiumMultiplier: number;
  /** 1주 40시간 초과분에 대한 고정연장근로수당 (근무패턴에 초과분이 있으면 항상 산정) */
  overtimeAllowanceAmount: number;
  /** 22:00~06:00 근무분에 대한 고정야간근로수당 (근무패턴에 야간시간이 있으면 항상 산정) */
  nightAllowanceAmount: number;
  holidayAllowanceAmount: number;
  annualLeaveAllowanceAmount: number;
  totalMonthlyPay: number;
  /**
   * 최저임금 산입범위 기준 환산시급. 2024년 전면 시행된 최저임금법에 따라 기본급과 매월
   * 정기 지급되는 복리후생성 비과세 수당(식대 등)은 산입되지만, 연장·야간·휴일근로수당과
   * 연차수당(소정근로시간 외 임금)은 제외된다.
   */
  minimumWageHourlyEquivalent: number;
  isBelowMinimumWage: boolean;
  /** 최저임금 기준을 맞추기 위해 월 임금총액에 추가로 더 지급해야 하는 금액 */
  minimumWageShortfallPerMonth: number;
}

/**
 * 근로기준법 제56조에 따른 연장·야간·휴일근로 가산수당(50%)은 상시근로자 5인 이상 사업장에만
 * 적용되며, 5인 미만 사업장은 가산 없이 통상임금(1.0배)만 지급하면 된다.
 */
export function getOvertimePremiumMultiplier(fiveOrMoreEmployees: boolean): number {
  return fiveOrMoreEmployees ? 1.5 : 1.0;
}

/**
 * 월급제/일급제는 두 가지 방식을 지원한다.
 *
 * 1) 포괄임금(isInclusiveWage=true): 상담사/사업주가 아는 값은 "월 임금총액"(또는 일당)이지
 *    기본급이 아니므로, 그 총액에서 비과세 항목과 (기본급 기반으로 계산되는) 수당들을 역산하여
 *    기본급을 산출한다. 즉 연장·휴일·연차수당은 모두 월급/일당 안에 이미 포함된 것으로 본다.
 *    일급제는 "일당 × 월 평균 근무일수"로 월 환산 총액을 만든 뒤 월급제와 동일하게 역산한다.
 *
 *    base + nonTaxable + premium*hourly*(overtimeHours+holidayHours) + hourly*leaveHours = total
 *    hourly = base / monthlyStandardHours 이므로 base에 대해 정리하면:
 *    base = (total - nonTaxable) / (1 + (premium*(overtimeHours+holidayHours) + leaveHours) / monthlyStandardHours)
 *
 * 2) 수당 별도지급(isInclusiveWage=false): 입력한 금액(또는 일당 환산액)을 그대로 고정
 *    기본급+비과세로 보고, 연장·휴일·연차수당은 이와 별도로 순방향 가산하여 최종 지급액을
 *    구한다. 사업장에 따라 공휴일 근무 등에 대해 월급/일당과 별개로 수당을 추가 지급하는
 *    경우를 위한 옵션이다.
 *
 * 시급제는 항상 순방향이다. 시급은 실제 근로시간만큼만 지급하는 방식이라 포괄임금이 아니므로,
 * 시급 × 각 시간을 그대로 더해 "참고용 예상 월 급여"를 계산한다.
 */
export function computeWageBreakdown(
  pattern: EmploymentPatternData,
  breakTimes: BreakTimeEntry[],
  wage: WageInfo,
  fiveOrMoreEmployees: boolean
): WageBreakdown {
  const scheduleStats = computeScheduleStats(pattern, breakTimes);
  const { monthlyStandardHours, monthlyOvertimeHours, monthlyNightHours, monthlyWorkDays } =
    scheduleStats;
  const premiumMultiplier = getOvertimePremiumMultiplier(fiveOrMoreEmployees);

  const nonTaxableTotal = wage.nonTaxableAllowances.reduce((sum, a) => sum + a.amount, 0);
  const holidayHours = wage.holidayWorkAllowance.enabled ? wage.holidayWorkAllowance.hoursPerMonth : 0;
  const leaveHours = wage.annualLeaveAllowance.enabled ? wage.annualLeaveAllowance.hoursPerMonth : 0;
  const isInclusive = wage.payType !== "HOURLY" && wage.isInclusiveWage;

  let baseSalary: number;
  let hourlyWage: number;
  let statedTotal = 0;

  if (wage.payType === "HOURLY") {
    hourlyWage = wage.hourlyRate;
    baseSalary = Math.round(hourlyWage * monthlyStandardHours);
  } else {
    // 월급제는 입력된 임금총액을, 일급제는 "일당 × 월 평균 근무일수"로 환산한 총액을 사용한다.
    statedTotal =
      wage.payType === "DAILY" ? Math.round(wage.dailyRate * monthlyWorkDays) : wage.totalMonthlyPay;
    const remaining = Math.max(0, statedTotal - nonTaxableTotal);
    if (isInclusive) {
      const allowanceFactor =
        monthlyStandardHours > 0
          ? (premiumMultiplier * (monthlyOvertimeHours + monthlyNightHours + holidayHours) +
              leaveHours) /
            monthlyStandardHours
          : 0;
      baseSalary = Math.round(remaining / (1 + allowanceFactor));
    } else {
      baseSalary = remaining;
    }
    hourlyWage = monthlyStandardHours > 0 ? baseSalary / monthlyStandardHours : 0;
  }

  const overtimeAllowanceAmount = Math.round(hourlyWage * premiumMultiplier * monthlyOvertimeHours);
  const nightAllowanceAmount = Math.round(hourlyWage * premiumMultiplier * monthlyNightHours);
  const holidayAllowanceAmount = Math.round(hourlyWage * premiumMultiplier * holidayHours);
  const annualLeaveAllowanceAmount = Math.round(hourlyWage * leaveHours);

  const totalMonthlyPay = isInclusive
    ? statedTotal
    : baseSalary +
      nonTaxableTotal +
      overtimeAllowanceAmount +
      nightAllowanceAmount +
      holidayAllowanceAmount +
      annualLeaveAllowanceAmount;

  const minimumWageHourlyEquivalent =
    monthlyStandardHours > 0 ? (baseSalary + nonTaxableTotal) / monthlyStandardHours : 0;
  const isBelowMinimumWage = minimumWageHourlyEquivalent < MINIMUM_HOURLY_WAGE;
  const minimumWageShortfallPerMonth = isBelowMinimumWage
    ? Math.ceil((MINIMUM_HOURLY_WAGE - minimumWageHourlyEquivalent) * monthlyStandardHours)
    : 0;

  return {
    ...scheduleStats,
    nonTaxableTotal,
    baseSalary,
    hourlyWage,
    premiumMultiplier,
    overtimeAllowanceAmount,
    nightAllowanceAmount,
    holidayAllowanceAmount,
    annualLeaveAllowanceAmount,
    totalMonthlyPay,
    minimumWageHourlyEquivalent,
    isBelowMinimumWage,
    minimumWageShortfallPerMonth,
  };
}
