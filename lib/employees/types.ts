import { BreakTimeEntry, EmploymentPatternData, Gender, WageInfo } from "@/lib/contract-templates/types";

export interface EmployeeRecord {
  id: string;
  createdAt: string;
  updatedAt: string;

  workerName: string;
  workerGender: Gender;
  workerBirthDate: string;
  workerAddress: string;
  workerPhone: string;
  jobDescription: string;
  workLocation: string;
  contractStartDate: string;
  contractEndDate: string | null;

  employmentPattern: EmploymentPatternData;
  breakTimes: BreakTimeEntry[];
  wage: WageInfo;
  fiveOrMoreEmployees: boolean;

  note: string;
}

export type EmployeeRecordInput = Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">;
