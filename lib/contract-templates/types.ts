export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
  SAT: "토",
  SUN: "일",
};

export const WORK_PATTERN_TYPES = [
  "WEEKLY_SCHEDULE",
  "MONTHLY_OFF",
  "ALTERNATING_DAY",
  "ALTERNATING_WEEK",
] as const;
export type WorkPatternType = (typeof WORK_PATTERN_TYPES)[number];

export const WORK_PATTERN_LABEL: Record<WorkPatternType, string> = {
  WEEKLY_SCHEDULE: "요일별 근무시간표 (매주 동일 반복)",
  MONTHLY_OFF: "교대 근무 (월 단위 휴무일수, 근무표에 따름)",
  ALTERNATING_DAY: "격일 근무",
  ALTERNATING_WEEK: "격주 근무 (1주차/2주차 교대)",
};

export interface DaySchedule {
  startTime: string;
  endTime: string;
}

export type WeekSchedule = Partial<Record<Weekday, DaySchedule>>;

export interface WeeklyScheduleData {
  type: "WEEKLY_SCHEDULE";
  schedule: WeekSchedule;
}

export interface MonthlyOffData {
  type: "MONTHLY_OFF";
  shiftStartTime: string;
  shiftEndTime: string;
  restDaysPerMonth: number;
  schedulingMethod: string;
}

export interface AlternatingDayData {
  type: "ALTERNATING_DAY";
  workStartTime: string;
  workEndTime: string;
  crossesMidnight: boolean;
  cycleReferenceDate: string;
}

export interface AlternatingWeekData {
  type: "ALTERNATING_WEEK";
  weekASchedule: WeekSchedule;
  weekBSchedule: WeekSchedule;
  referenceWeekStartDate: string;
}

export type EmploymentPatternData =
  | WeeklyScheduleData
  | MonthlyOffData
  | AlternatingDayData
  | AlternatingWeekData;

export type BreakTimeType = "REST" | "BREAK";
export type BreakTimeMode = "FIXED" | "FLEXIBLE";

export interface BreakTimeEntry {
  id: string;
  type: BreakTimeType;
  mode: BreakTimeMode;
  /** FIXED 모드에서 사용 */
  startTime: string;
  endTime: string;
  /** FLEXIBLE 모드에서 사용 (예: 30분씩 2회, 근로자가 자율적으로 사용) */
  durationMinutes: number;
  count: number;
}

export interface ProbationInfo {
  applicable: boolean;
  months: number;
  wagePercent: number;
}

export interface NonTaxableAllowance {
  id: string;
  name: string;
  amount: number;
}

export interface PrepaidAllowance {
  enabled: boolean;
  hoursPerMonth: number;
}

export type PayType = "MONTHLY" | "HOURLY" | "DAILY";

export interface WageInfo {
  payType: PayType;
  /**
   * MONTHLY/DAILY에서만 의미 있음. true(포괄임금)면 입력한 금액에 연장·휴일·연차수당이 이미
   * 포함된 것으로 보아 기본급을 역산한다. false(수당 별도지급)면 입력한 금액을 고정 기본급으로
   * 보고 연장·휴일·연차수당을 별도로 계산해 추가 지급한다. HOURLY는 항상 순방향 합산이라
   * 이 값과 무관하다.
   */
  isInclusiveWage: boolean;
  /** MONTHLY일 때 사용: 세전 월 임금총액 (기본급+비과세+수당 합계). 기본급은 이 값에서 역산한다. */
  totalMonthlyPay: number;
  /** HOURLY일 때 사용: 시급 (통상시급 그 자체) */
  hourlyRate: number;
  /** DAILY일 때 사용: 일당. 통상시급은 일당 ÷ 1일 소정근로시간으로 환산한다. */
  dailyRate: number;
  payDay: string;
  payMethod: string;
  nonTaxableAllowances: NonTaxableAllowance[];
  holidayWorkAllowance: PrepaidAllowance;
  annualLeaveAllowance: PrepaidAllowance;
}

export interface AnnualLeaveInfo {
  basis: "LEGAL" | "CUSTOM";
  customDetail?: string;
}

export interface SocialInsuranceInfo {
  pension: boolean;
  health: boolean;
  employment: boolean;
  industrialAccident: boolean;
}

export type Gender = "M" | "F";

export interface BusinessInfo {
  businessName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  businessPhone: string;
  /** 상시근로자 5인 이상 여부. 연장/야간/휴일 가산수당(1.5배)·연차휴가 의무·공휴일 유급화 등이 이 값에 따라 달라진다. */
  fiveOrMoreEmployees: boolean;
  workerName: string;
  /** 새 직원을 입력받기 시작할 때는 null — 라디오 버튼 어느 쪽도 선택되지 않은 채로 두어,
   * 서명 시 근로자가 직접 표시하도록 서식에 "남성 / 여성"을 그대로 출력할 수 있게 한다. */
  workerGender: Gender | null;
  workerBirthDate: string;
  workerAddress: string;
  workerPhone: string;
  contractStartDate: string;
  contractEndDate: string | null;
  workLocation: string;
  jobDescription: string;
}

export interface ContractFormData {
  businessInfo: BusinessInfo;
  probation: ProbationInfo;
  employmentPattern: EmploymentPatternData;
  breakTimes: BreakTimeEntry[];
  wage: WageInfo;
  annualLeave: AnnualLeaveInfo;
  socialInsurance: SocialInsuranceInfo;
}

export interface TableSpec {
  headers: string[];
  rows: string[][];
}

export interface ContractPatternModule<T extends EmploymentPatternData = EmploymentPatternData> {
  label: string;
  createDefault: () => T;
  renderClauseText: (data: T) => string;
  renderScheduleTable: (data: T) => TableSpec | null;
}
