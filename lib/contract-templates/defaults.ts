import { ContractFormData } from "./types";
import { createDefaultPatternData } from "./registry";

let breakTimeIdCounter = 0;
export function createBreakTimeId(): string {
  breakTimeIdCounter += 1;
  return `break-${Date.now()}-${breakTimeIdCounter}`;
}

let allowanceIdCounter = 0;
export function createAllowanceId(): string {
  allowanceIdCounter += 1;
  return `allowance-${Date.now()}-${allowanceIdCounter}`;
}

export function createDefaultFormData(): ContractFormData {
  return {
    businessInfo: {
      businessName: "",
      representativeName: "",
      businessRegistrationNumber: "",
      businessAddress: "",
      businessPhone: "",
      fiveOrMoreEmployees: true,
      workerName: "",
      workerGender: null,
      workerBirthDate: "",
      workerAddress: "",
      workerPhone: "",
      contractStartDate: "",
      contractEndDate: null,
      workLocation: "",
      jobDescription: "",
    },
    probation: { applicable: false, months: 3, wagePercent: 90 },
    employmentPattern: createDefaultPatternData("WEEKLY_SCHEDULE"),
    breakTimes: [
      {
        id: createBreakTimeId(),
        type: "REST",
        mode: "FIXED",
        startTime: "12:00",
        endTime: "13:00",
        durationMinutes: 30,
        count: 1,
      },
    ],
    wage: {
      payType: "MONTHLY",
      isInclusiveWage: true,
      totalMonthlyPay: 0,
      hourlyRate: 0,
      dailyRate: 0,
      payDay: "매월 25일",
      payMethod: "근로자 명의 계좌로 입금",
      nonTaxableAllowances: [],
      holidayWorkAllowance: { enabled: false, hoursPerMonth: 10 },
      annualLeaveAllowance: { enabled: false, hoursPerMonth: 8 },
    },
    annualLeave: { basis: "LEGAL" },
    socialInsurance: {
      pension: true,
      health: true,
      employment: true,
      industrialAccident: true,
    },
  };
}
