import { createDefaultFormData } from "./defaults";
import { ContractFormData } from "./types";

/** 처음 방문한 사용자에게 보여줄 가짜 예시 데이터. 사업자등록번호는 실제 사업장과 겹칠
 * 가능성이 매우 낮은 명백한 예시용 번호를 쓴다 — 사용자가 이 번호를 실제 값으로 바꾸는
 * 순간 진짜 사업장 조회/등록 흐름으로 전환된다. */
export const EXAMPLE_BUSINESS_REGISTRATION_NUMBER = "123-45-67890";

export function createExampleFormData(): ContractFormData {
  const base = createDefaultFormData();
  return {
    ...base,
    businessInfo: {
      ...base.businessInfo,
      businessName: "예시상사",
      representativeName: "홍길동",
      businessRegistrationNumber: EXAMPLE_BUSINESS_REGISTRATION_NUMBER,
      businessAddress: "서울특별시 강남구 테헤란로 123",
      businessPhone: "02-1234-5678",
      fiveOrMoreEmployees: true,
      workerName: "김철수",
      workerGender: "M",
      workerBirthDate: "1990-01-01",
      workerAddress: "서울특별시 관악구 관악로 45",
      workerPhone: "010-1234-5678",
      contractStartDate: "2026-01-01",
      contractEndDate: null,
      workLocation: "본사",
      jobDescription: "일반 사무",
    },
    wage: {
      ...base.wage,
      payType: "MONTHLY",
      isInclusiveWage: true,
      totalMonthlyPay: 3000000,
    },
  };
}
