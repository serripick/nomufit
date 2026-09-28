import { z } from "zod";
import { WEEKDAYS } from "./types";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "시:분 형식(예: 09:00)으로 입력해주세요.");

const weekdayEnum = z.enum(WEEKDAYS);

const daySchedule = z.object({
  startTime: timeString,
  endTime: timeString,
});

const weekScheduleSchema = z
  .partialRecord(weekdayEnum, daySchedule)
  .refine((s) => Object.keys(s).length > 0, "최소 1개 요일의 근무시간을 입력해주세요.");

export const weeklyScheduleSchema = z.object({
  type: z.literal("WEEKLY_SCHEDULE"),
  schedule: weekScheduleSchema,
});

export const monthlyOffSchema = z.object({
  type: z.literal("MONTHLY_OFF"),
  shiftStartTime: timeString,
  shiftEndTime: timeString,
  restDaysPerMonth: z.number().int().min(1).max(31),
  schedulingMethod: z.string().min(1, "근무표 작성/고지 방법을 입력해주세요."),
});

export const alternatingDaySchema = z.object({
  type: z.literal("ALTERNATING_DAY"),
  workStartTime: timeString,
  workEndTime: timeString,
  crossesMidnight: z.boolean(),
  cycleReferenceDate: z.string().min(1, "기준 근무일을 입력해주세요."),
});

export const alternatingWeekSchema = z.object({
  type: z.literal("ALTERNATING_WEEK"),
  weekASchedule: weekScheduleSchema,
  weekBSchedule: weekScheduleSchema,
  referenceWeekStartDate: z.string().min(1, "기준 주 시작일을 입력해주세요."),
});

export const employmentPatternSchema = z.discriminatedUnion("type", [
  weeklyScheduleSchema,
  monthlyOffSchema,
  alternatingDaySchema,
  alternatingWeekSchema,
]);

export const breakTimeEntrySchema = z
  .object({
    id: z.string(),
    type: z.enum(["REST", "BREAK"]),
    mode: z.enum(["FIXED", "FLEXIBLE"]),
    startTime: z.string(),
    endTime: z.string(),
    durationMinutes: z.number().min(0),
    count: z.number().min(0),
  })
  .refine(
    (v) => (v.mode === "FIXED" ? timeString.safeParse(v.startTime).success : true),
    { message: "시작 시각을 입력해주세요.", path: ["startTime"] }
  )
  .refine(
    (v) => (v.mode === "FIXED" ? timeString.safeParse(v.endTime).success : true),
    { message: "종료 시각을 입력해주세요.", path: ["endTime"] }
  )
  .refine((v) => (v.mode === "FLEXIBLE" ? v.durationMinutes > 0 && v.count > 0 : true), {
    message: "1회 시간(분)과 횟수를 입력해주세요.",
    path: ["durationMinutes"],
  });

export const nonTaxableAllowanceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "항목명을 입력해주세요."),
  amount: z.number().min(0),
});

export const prepaidAllowanceSchema = z.object({
  enabled: z.boolean(),
  hoursPerMonth: z.number().min(0),
});

export const wageInfoSchema = z
  .object({
    payType: z.enum(["MONTHLY", "HOURLY", "DAILY"]),
    isInclusiveWage: z.boolean(),
    totalMonthlyPay: z.number().min(0),
    hourlyRate: z.number().min(0),
    dailyRate: z.number().min(0),
    payDay: z.string().min(1, "지급일을 입력해주세요."),
    payMethod: z.string().min(1, "지급방법을 입력해주세요."),
    nonTaxableAllowances: z.array(nonTaxableAllowanceSchema),
    holidayWorkAllowance: prepaidAllowanceSchema,
    annualLeaveAllowance: prepaidAllowanceSchema,
  })
  .superRefine((wage, ctx) => {
    if (wage.payType === "MONTHLY" && wage.totalMonthlyPay <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["totalMonthlyPay"],
        message: "월 임금총액을 입력해주세요.",
      });
    }
    if (wage.payType === "HOURLY" && wage.hourlyRate <= 0) {
      ctx.addIssue({ code: "custom", path: ["hourlyRate"], message: "시급을 입력해주세요." });
    }
    if (wage.payType === "DAILY" && wage.dailyRate <= 0) {
      ctx.addIssue({ code: "custom", path: ["dailyRate"], message: "일당을 입력해주세요." });
    }
  });

export const annualLeaveInfoSchema = z.object({
  basis: z.enum(["LEGAL", "CUSTOM"]),
  customDetail: z.string().optional(),
});

export const socialInsuranceInfoSchema = z.object({
  pension: z.boolean(),
  health: z.boolean(),
  employment: z.boolean(),
  industrialAccident: z.boolean(),
});

export const businessInfoSchema = z.object({
  businessName: z.string().min(1, "사업장명을 입력해주세요."),
  representativeName: z.string().min(1, "대표자명을 입력해주세요."),
  businessRegistrationNumber: z.string().min(1, "사업자등록번호를 입력해주세요."),
  businessAddress: z.string().min(1, "사업장 주소를 입력해주세요."),
  businessPhone: z.string().min(1, "사업장 연락처를 입력해주세요."),
  fiveOrMoreEmployees: z.boolean(),
  workerName: z.string().min(1, "근로자 성명을 입력해주세요."),
  workerGender: z.enum(["M", "F"]).nullable(),
  workerBirthDate: z.string().min(1, "근로자 생년월일을 입력해주세요."),
  workerAddress: z.string().min(1, "근로자 주소를 입력해주세요."),
  workerPhone: z.string().min(1, "근로자 연락처를 입력해주세요."),
  contractStartDate: z.string().min(1, "근로계약 시작일을 입력해주세요."),
  contractEndDate: z.string().nullable(),
  workLocation: z.string().min(1, "근무장소를 입력해주세요."),
  jobDescription: z.string().min(1, "업무내용을 입력해주세요."),
});

export const probationInfoSchema = z.object({
  applicable: z.boolean(),
  months: z.number().min(0),
  wagePercent: z.number().min(0).max(100),
});

export const contractFormSchema = z.object({
  businessInfo: businessInfoSchema,
  probation: probationInfoSchema,
  employmentPattern: employmentPatternSchema,
  breakTimes: z.array(breakTimeEntrySchema),
  wage: wageInfoSchema,
  annualLeave: annualLeaveInfoSchema,
  socialInsurance: socialInsuranceInfoSchema,
});
