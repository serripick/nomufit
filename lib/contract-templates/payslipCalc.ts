// 2026년 4대보험 근로자 부담 요율. 매년 요율이 바뀌므로 이 값만 갱신하면 된다.
export const NATIONAL_PENSION_RATE = 0.0475; // 국민연금 (전체 9.5%의 절반)
export const HEALTH_INSURANCE_RATE = 0.03595; // 건강보험 (전체 7.19%의 절반)
export const LONG_TERM_CARE_RATE_OF_HEALTH = 0.1314; // 장기요양보험료율 (건강보험료 대비 비율)
export const EMPLOYMENT_INSURANCE_RATE = 0.009; // 고용보험(실업급여) 근로자 부담

export interface InsuranceDeductions {
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
}

export interface PayslipDeductions extends InsuranceDeductions {
  taxableBase: number;
  incomeTax: number;
  localIncomeTax: number;
  /** 숙식 제공 사업장에서 숙박비를 공제하는 경우. 상한이 지방고용노동청별·반기별 고시로
   * 정해지므로 이 프로그램은 금액을 자동 계산하지 않고, 입력값이 참고용 상한을 넘는지만 경고한다. */
  dormitoryDeduction: number;
  totalDeduction: number;
}

/** 숙박비 공제 한도는 전국 공통 고정값이 아니라 지방고용노동청이 반기별·지역별·기숙사
 * 형태별로 따로 고시한다. 이 값은 "이 정도면 한도를 넘었을 가능성이 있다"고 알려주기 위한
 * 참고용 상한일 뿐, 실제 한도가 아니다. 정확한 한도는 관할 지방고용노동청 고시를 확인해야 한다. */
export const DORMITORY_DEDUCTION_REFERENCE_CAP_RATE = 0.2;

export function isDormitoryDeductionOverReferenceCap(
  dormitoryDeduction: number,
  ordinaryMonthlyWage: number
): boolean {
  if (dormitoryDeduction <= 0 || ordinaryMonthlyWage <= 0) return false;
  return dormitoryDeduction > ordinaryMonthlyWage * DORMITORY_DEDUCTION_REFERENCE_CAP_RATE;
}

/**
 * 4대보험료 1차 추정치. 과세대상 근로소득(비과세 제외)에 정률을 곱한 값으로, 실제 급여명세서의
 * 상한액·전월 정산분 등으로 인해 조금 다를 수 있다. 이 값은 기본값일 뿐이며, 상담사가 실제
 * 급여명세서를 보고 아래 각 항목을 직접 고쳐 쓸 수 있다.
 */
export function computeDefaultInsuranceDeductions(taxableBase: number): InsuranceDeductions {
  const nationalPension = Math.round(taxableBase * NATIONAL_PENSION_RATE);
  const healthInsurance = Math.round(taxableBase * HEALTH_INSURANCE_RATE);
  const longTermCare = Math.round(healthInsurance * LONG_TERM_CARE_RATE_OF_HEALTH);
  const employmentInsurance = Math.round(taxableBase * EMPLOYMENT_INSURANCE_RATE);
  return { nationalPension, healthInsurance, longTermCare, employmentInsurance };
}

/**
 * 공제 항목을 모두 합산해 최종 공제액 계를 낸다. 각 항목은 자동 추정치이거나 상담사가 실제
 * 급여명세서를 보고 직접 수정한 값일 수 있으며, 이 함수는 어느 쪽이든 그대로 합산한다.
 */
export function sumPayslipDeductions(
  taxableBase: number,
  insurance: InsuranceDeductions,
  incomeTax: number,
  localIncomeTax: number,
  dormitoryDeduction: number = 0
): PayslipDeductions {
  const safe = (v: number) => Math.max(0, v);
  const totalDeduction =
    safe(insurance.nationalPension) +
    safe(insurance.healthInsurance) +
    safe(insurance.longTermCare) +
    safe(insurance.employmentInsurance) +
    safe(incomeTax) +
    safe(localIncomeTax) +
    safe(dormitoryDeduction);

  return {
    taxableBase,
    nationalPension: safe(insurance.nationalPension),
    healthInsurance: safe(insurance.healthInsurance),
    longTermCare: safe(insurance.longTermCare),
    employmentInsurance: safe(insurance.employmentInsurance),
    incomeTax: safe(incomeTax),
    localIncomeTax: safe(localIncomeTax),
    dormitoryDeduction: safe(dormitoryDeduction),
    totalDeduction,
  };
}
