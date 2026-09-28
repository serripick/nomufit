// 고용지원금 1차 참고용 스크리닝. 나이·계약형태 등 기본 정보만으로 대표적인 지원금의
// 해당 가능성을 가늠하는 용도이며, 정확한 자격요건·예산 소진 여부·인원 한도는 매년/수시로
// 바뀌므로 반드시 고용24(work24.go.kr) 또는 노무사 등 전문가 상담을 통해 확인해야 한다.

export type SubsidyVerdict = "가능성 있음" | "요건 불충족" | "확인 필요";

export interface SubsidyResult {
  name: string;
  verdict: SubsidyVerdict;
  reason: string;
  amountDescription: string;
  note: string;
}

function ageAt(birthDate: string, atDate: Date): number | null {
  const b = new Date(birthDate);
  if (!birthDate || Number.isNaN(b.getTime())) return null;
  let age = atDate.getFullYear() - b.getFullYear();
  const monthDiff = atDate.getMonth() - b.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < b.getDate())) age -= 1;
  return age;
}

/** hireDate로부터 atDate까지 지난 개월 수(일 단위까지 반영, 채워지지 않은 달은 내림). */
function monthsElapsed(hireDate: string, atDate: Date): number | null {
  const h = new Date(hireDate);
  if (!hireDate || Number.isNaN(h.getTime())) return null;
  let months = (atDate.getFullYear() - h.getFullYear()) * 12 + (atDate.getMonth() - h.getMonth());
  if (atDate.getDate() < h.getDate()) months -= 1;
  return Math.max(0, months);
}

/** "향후 채용예정자" 지원금(청년일자리도약장려금·정규직전환지원금·고용촉진장려금·시니어인턴십)은
 * 대부분 채용 직후에만 신청할 수 있다. 채용일로부터 3개월이 지나면 나이 등 다른 요건을
 * 충족하더라도 신청 가능 기간이 지났을 가능성이 높아 "가능성 있음"으로 두지 않는다. */
const APPLICATION_WINDOW_MONTHS = 3;

function applyApplicationWindow(
  result: SubsidyResult,
  hireDate: string,
  atDate: Date
): SubsidyResult {
  if (result.verdict !== "가능성 있음") return result;
  const elapsed = monthsElapsed(hireDate, atDate);
  if (elapsed === null || elapsed <= APPLICATION_WINDOW_MONTHS) return result;
  return {
    ...result,
    verdict: "요건 불충족",
    reason: `${result.reason} 다만 채용일로부터 ${elapsed}개월이 지나 통상적인 신청 가능 기간(약 ${APPLICATION_WINDOW_MONTHS}개월)이 지난 것으로 보입니다. 실제 신청기한은 고용24에서 꼭 확인하세요.`,
  };
}

export interface SubsidyReviewInput {
  birthDate: string;
  hireDate: string;
  /** 근로계약 종료일이 있으면(기간제) true */
  isFixedTerm: boolean;
  /** 장애인·여성가장 등 취업취약계층 해당 여부 (상담사가 별도로 확인하여 체크) */
  isVulnerableGroup: boolean;
  /** 수도권 외 우대지역 사업장 여부 */
  isPreferentialRegion: boolean;
  /** 현재 재직자가 유연근무제(시차출퇴근제 등)를 활용 중인지 */
  usesFlexibleWork: boolean;
  /** 현재 재직자가 소정근로시간을 단축하여 근무 중인지 */
  hasReducedWorkingHours: boolean;
}

export function reviewEmploymentSubsidies(input: SubsidyReviewInput): SubsidyResult[] {
  const today = new Date();
  const age = ageAt(input.birthDate, today);
  const results: SubsidyResult[] = [];

  const youthAmount =
    "월 60만원 × 최대 1년 = 연 720만원" +
    (input.isPreferentialRegion
      ? " + 청년장기근속인센티브(일반 비수도권) 6개월마다 120만원 × 최대 2년 = 총 480만원"
      : "");
  const youthNote =
    "최대 9명, 6개월 이상 고용 유지 시 지급. 인위적 감원 금지(채용 전 3개월~청년고용 후 1년간). 24~25년 매출액에 따라 최대 인원이 변경될 수 있음.";
  let youthResult: SubsidyResult;
  if (age === null) {
    youthResult = {
      name: "청년일자리도약장려금",
      verdict: "확인 필요",
      reason: "생년월일 또는 채용일 정보가 없어 나이를 계산할 수 없습니다.",
      amountDescription: youthAmount,
      note: youthNote,
    };
  } else if (age >= 15 && age <= 34) {
    youthResult = {
      name: "청년일자리도약장려금",
      verdict: "가능성 있음",
      reason: `채용일 기준 만 ${age}세로 만 15~34세 청년 채용 요건을 충족합니다.`,
      amountDescription: youthAmount,
      note: youthNote,
    };
  } else {
    youthResult = {
      name: "청년일자리도약장려금",
      verdict: "요건 불충족",
      reason: `채용일 기준 만 ${age}세로 만 15~34세 요건에 해당하지 않습니다.`,
      amountDescription: youthAmount,
      note: youthNote,
    };
  }
  results.push(applyApplicationWindow(youthResult, input.hireDate, today));

  const conversionAmount = "월 60만원 × 최대 1년 = 총 720만원";
  const conversionNote = "최대 3명. 인위적 감원 금지. 재직자 중 기간제근로자가 있어야 참여 가능.";
  const conversionResult: SubsidyResult = input.isFixedTerm
    ? {
        name: "정규직 전환 지원금",
        verdict: "가능성 있음",
        reason:
          "현재 기간제(계약기간이 정해진) 근로자로 등록되어 있어, 정규직으로 전환하면 지원 대상이 될 수 있습니다.",
        amountDescription: conversionAmount,
        note: conversionNote,
      }
    : {
        name: "정규직 전환 지원금",
        verdict: "요건 불충족",
        reason: "근로계약기간의 정함이 없는(정규직) 근로자로 등록되어 있어 전환 대상이 아닙니다.",
        amountDescription: conversionAmount,
        note: conversionNote,
      };
  results.push(applyApplicationWindow(conversionResult, input.hireDate, today));

  const promotionAmount = "월 60만원 × 최대 2년 = 총 1,440만원";
  const promotionNote =
    "최대 3명, 6개월 이상 고용 유지 시. 인위적 감원 금지(채용 전 3개월~채용 후 1년).";
  const promotionResult: SubsidyResult = input.isVulnerableGroup
    ? {
        name: "고용촉진장려금",
        verdict: "가능성 있음",
        reason: "장애인·여성가장 등 취업취약계층에 해당하는 것으로 표시하셨습니다.",
        amountDescription: promotionAmount,
        note: promotionNote,
      }
    : {
        name: "고용촉진장려금",
        verdict: "확인 필요",
        reason: "장애인·여성가장 등 취업취약계층 해당 여부를 아직 표시하지 않았습니다.",
        amountDescription: promotionAmount,
        note: promotionNote,
      };
  results.push(applyApplicationWindow(promotionResult, input.hireDate, today));

  const seniorAmount = "인턴·채용지원금(270만원) + 장기취업유지지원금(280만원) = 총 550만원";
  const seniorNote =
    "한도없음(배정인원 마감 시 신청 불가). 60세 이상 채용, 6개월 이상 유지 시. 부당해고 방지 조건(약정기간 만료 전, 계속고용 후).";
  let seniorResult: SubsidyResult;
  if (age === null) {
    seniorResult = {
      name: "시니어인턴십",
      verdict: "확인 필요",
      reason: "생년월일 또는 채용일 정보가 없어 나이를 계산할 수 없습니다.",
      amountDescription: seniorAmount,
      note: seniorNote,
    };
  } else if (age >= 60) {
    seniorResult = {
      name: "시니어인턴십",
      verdict: "가능성 있음",
      reason: `채용일 기준 만 ${age}세로 60세 이상 요건을 충족합니다.`,
      amountDescription: seniorAmount,
      note: seniorNote,
    };
  } else {
    seniorResult = {
      name: "시니어인턴십",
      verdict: "요건 불충족",
      reason: `채용일 기준 만 ${age}세로 60세 이상 요건에 해당하지 않습니다.`,
      amountDescription: seniorAmount,
      note: seniorNote,
    };
  }
  results.push(applyApplicationWindow(seniorResult, input.hireDate, today));

  // 아래 2종은 "현재 재직자" 대상 지원금이라 채용일 경과 여부와 무관하다(신청 가능 기간 적용 안 함).
  const flexibleWorkAmount = "월 60만원 × 최대 1년 = 총 720만원";
  const flexibleWorkNote = "최대 3명. 신청은 사업계획서 승인 후 가능.";
  results.push(
    input.usesFlexibleWork
      ? {
          name: "유연근무제",
          verdict: "가능성 있음",
          reason: "현재 유연근무제(시차출퇴근제 등)를 활용 중인 것으로 표시하셨습니다.",
          amountDescription: flexibleWorkAmount,
          note: flexibleWorkNote,
        }
      : {
          name: "유연근무제",
          verdict: "확인 필요",
          reason: "유연근무제 활용 여부를 아직 표시하지 않았습니다.",
          amountDescription: flexibleWorkAmount,
          note: flexibleWorkNote,
        }
  );

  const workLifeBalanceAmount = "월 50만원 × 최대 1년 = 총 600만원";
  const workLifeBalanceNote = "최대 3명. 근로시간 단축개시일 다음달부터 12개월 내 신청.";
  results.push(
    input.hasReducedWorkingHours
      ? {
          name: "워라밸일자리 장려금",
          verdict: "가능성 있음",
          reason: "소정근로시간을 단축하여 근무 중인 것으로 표시하셨습니다.",
          amountDescription: workLifeBalanceAmount,
          note: workLifeBalanceNote,
        }
      : {
          name: "워라밸일자리 장려금",
          verdict: "확인 필요",
          reason: "소정근로시간 단축 여부를 아직 표시하지 않았습니다.",
          amountDescription: workLifeBalanceAmount,
          note: workLifeBalanceNote,
        }
  );

  return results;
}
