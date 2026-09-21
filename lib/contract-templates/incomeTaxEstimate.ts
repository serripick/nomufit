import {
  EMPLOYMENT_INSURANCE_RATE,
  HEALTH_INSURANCE_RATE,
  LONG_TERM_CARE_RATE_OF_HEALTH,
  NATIONAL_PENSION_RATE,
} from "./payslipCalc";

// 근로소득세(원천징수세액) 1차 추정치 계산.
// 국세청이 간이세액표를 만들 때 쓰는 계산방법(근로소득공제 → 인적공제 → 연금보험료·특별소득공제
// (4대보험료 전액) → 종합소득세율 → 근로소득세액공제 → 표준세액공제)을 적용한 근사치이며,
// 실제 간이세액표 조견표와 차이가 날 수 있다. 매월 급여 지급 시 이 추정치를 1차로 적용하고,
// 상담사가 실제 급여명세서/홈택스 간이세액표를 확인해 직접 값을 수정하는 것을 전제로 한다.

interface Bracket {
  upTo: number; // Infinity 가능
  base: number;
  rate: number;
  over: number;
}

const EARNED_INCOME_DEDUCTION_BRACKETS: Bracket[] = [
  { upTo: 5_000_000, base: 0, rate: 0.7, over: 0 },
  { upTo: 15_000_000, base: 3_500_000, rate: 0.4, over: 5_000_000 },
  { upTo: 45_000_000, base: 7_500_000, rate: 0.15, over: 15_000_000 },
  { upTo: 100_000_000, base: 12_000_000, rate: 0.05, over: 45_000_000 },
  { upTo: Infinity, base: 14_750_000, rate: 0.02, over: 100_000_000 },
];

const TAX_RATE_BRACKETS: Bracket[] = [
  { upTo: 14_000_000, base: 0, rate: 0.06, over: 0 },
  { upTo: 50_000_000, base: 1_260_000, rate: 0.15, over: 14_000_000 },
  { upTo: 88_000_000, base: 5_760_000, rate: 0.24, over: 50_000_000 },
  { upTo: 150_000_000, base: 15_440_000, rate: 0.35, over: 88_000_000 },
  { upTo: 300_000_000, base: 19_940_000, rate: 0.38, over: 150_000_000 },
  { upTo: 500_000_000, base: 25_940_000, rate: 0.4, over: 300_000_000 },
  { upTo: 1_000_000_000, base: 35_940_000, rate: 0.42, over: 500_000_000 },
  { upTo: Infinity, base: 65_940_000, rate: 0.45, over: 1_000_000_000 },
];

const PERSONAL_DEDUCTION_PER_PERSON = 1_500_000;

function applyBrackets(amount: number, brackets: Bracket[]): number {
  const bracket = brackets.find((b) => amount <= b.upTo) ?? brackets[brackets.length - 1];
  return bracket.base + (amount - bracket.over) * bracket.rate;
}

function earnedIncomeTaxCredit(calculatedTax: number, annualWage: number): number {
  const rawCredit =
    calculatedTax <= 1_300_000 ? calculatedTax * 0.55 : 715_000 + (calculatedTax - 1_300_000) * 0.3;

  let cap: number;
  if (annualWage <= 33_000_000) {
    cap = 740_000;
  } else if (annualWage <= 70_000_000) {
    cap = Math.max(660_000, 740_000 - (annualWage - 33_000_000) * 0.008);
  } else {
    cap = Math.max(500_000, 660_000 - (annualWage - 70_000_000) * 0.5);
  }

  return Math.min(rawCredit, cap);
}

const STANDARD_TAX_CREDIT = 130_000; // 표준세액공제(특별세액공제 미신청 근로자 기본 적용분, 연)

/**
 * @param monthlyTaxableWage 비과세를 제외한 월 과세대상 급여
 * @param dependents 본인 포함 공제대상 부양가족 수 (기본 1명 = 본인만)
 */
export function estimateMonthlyIncomeTax(
  monthlyTaxableWage: number,
  dependents: number = 1
): number {
  if (monthlyTaxableWage <= 0) return 0;

  // 연금보험료공제(국민연금) + 특별소득공제(건강·장기요양·고용보험) — 4대보험 근로자
  // 부담분은 전액 소득공제된다.
  const nationalPension = monthlyTaxableWage * NATIONAL_PENSION_RATE;
  const healthInsurance = monthlyTaxableWage * HEALTH_INSURANCE_RATE;
  const longTermCare = healthInsurance * LONG_TERM_CARE_RATE_OF_HEALTH;
  const employmentInsurance = monthlyTaxableWage * EMPLOYMENT_INSURANCE_RATE;
  const monthlySocialInsurance =
    nationalPension + healthInsurance + longTermCare + employmentInsurance;

  const annualWage = monthlyTaxableWage * 12;
  const earnedIncomeDeduction = applyBrackets(annualWage, EARNED_INCOME_DEDUCTION_BRACKETS);
  const earnedIncomeAmount = Math.max(0, annualWage - earnedIncomeDeduction);
  const personalDeduction = Math.max(1, dependents) * PERSONAL_DEDUCTION_PER_PERSON;
  const taxBase = Math.max(
    0,
    earnedIncomeAmount - personalDeduction - monthlySocialInsurance * 12
  );
  const calculatedTax = taxBase > 0 ? applyBrackets(taxBase, TAX_RATE_BRACKETS) : 0;
  const credit = earnedIncomeTaxCredit(calculatedTax, annualWage);
  const annualTax = Math.max(0, calculatedTax - credit - STANDARD_TAX_CREDIT);

  return Math.round(annualTax / 12 / 10) * 10;
}
