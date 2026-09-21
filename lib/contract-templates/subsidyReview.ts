// 고용지원금 1차 참고용 스크리닝. 나이·계약형태 등 기본 정보만으로 대표적인 지원금 4종의
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

function ageAt(birthDate: string, atDate: string): number | null {
  const b = new Date(birthDate);
  const a = new Date(atDate);
  if (!birthDate || !atDate || Number.isNaN(b.getTime()) || Number.isNaN(a.getTime())) return null;
  let age = a.getFullYear() - b.getFullYear();
  const monthDiff = a.getMonth() - b.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && a.getDate() < b.getDate())) age -= 1;
  return age;
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
}

export function reviewEmploymentSubsidies(input: SubsidyReviewInput): SubsidyResult[] {
  const age = ageAt(input.birthDate, input.hireDate);
  const results: SubsidyResult[] = [];

  const youthAmount =
    "월 60만원 × 최대 1년 = 연 720만원" +
    (input.isPreferentialRegion
      ? " + 청년장기근속인센티브(우대지역) 6개월마다 150만원 × 최대 2년 = 총 600만원"
      : "");
  const youthNote =
    "최대 6명, 6개월 이상 고용 유지 시 지급. 인위적 감원 금지(채용 전 3개월~청년고용 후 1년간). 24~25년 매출액에 따라 최대 인원이 변경될 수 있음.";
  if (age === null) {
    results.push({
      name: "청년일자리도약장려금",
      verdict: "확인 필요",
      reason: "생년월일 또는 채용일 정보가 없어 나이를 계산할 수 없습니다.",
      amountDescription: youthAmount,
      note: youthNote,
    });
  } else if (age >= 15 && age <= 34) {
    results.push({
      name: "청년일자리도약장려금",
      verdict: "가능성 있음",
      reason: `채용일 기준 만 ${age}세로 만 15~34세 청년 채용 요건을 충족합니다.`,
      amountDescription: youthAmount,
      note: youthNote,
    });
  } else {
    results.push({
      name: "청년일자리도약장려금",
      verdict: "요건 불충족",
      reason: `채용일 기준 만 ${age}세로 만 15~34세 요건에 해당하지 않습니다.`,
      amountDescription: youthAmount,
      note: youthNote,
    });
  }

  const conversionAmount = "월 60만원 × 최대 1년 = 총 720만원";
  const conversionNote = "최대 3명. 인위적 감원 금지. 재직자 중 기간제근로자가 있어야 참여 가능.";
  results.push(
    input.isFixedTerm
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
        }
  );

  const promotionAmount = "월 60만원 × 최대 2년 = 총 1,440만원";
  const promotionNote =
    "최대 3명, 6개월 이상 고용 유지 시. 인위적 감원 금지(채용 전 3개월~채용 후 1년).";
  results.push(
    input.isVulnerableGroup
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
        }
  );

  const seniorAmount = "인턴·채용지원금(270만원) + 장기취업유지지원금(280만원) = 총 550만원";
  const seniorNote =
    "60세 이상(경비원 등) 채용, 6개월 이상 유지 시. 한도없음(배정인원 마감 시 신청 불가). 부당해고 방지 조건(약정기간 만료 전, 계속고용 후).";
  if (age === null) {
    results.push({
      name: "시니어인턴십",
      verdict: "확인 필요",
      reason: "생년월일 또는 채용일 정보가 없어 나이를 계산할 수 없습니다.",
      amountDescription: seniorAmount,
      note: seniorNote,
    });
  } else if (age >= 60) {
    results.push({
      name: "시니어인턴십",
      verdict: "가능성 있음",
      reason: `채용일 기준 만 ${age}세로 60세 이상 요건을 충족합니다.`,
      amountDescription: seniorAmount,
      note: seniorNote,
    });
  } else {
    results.push({
      name: "시니어인턴십",
      verdict: "요건 불충족",
      reason: `채용일 기준 만 ${age}세로 60세 이상 요건에 해당하지 않습니다.`,
      amountDescription: seniorAmount,
      note: seniorNote,
    });
  }

  return results;
}
