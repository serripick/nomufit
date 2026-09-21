/**
 * 소득세법 시행령상 대표적인 비과세 근로소득 항목.
 * limitNote는 안내용 참고정보이며, 실제 한도 적용 여부는 사업장 상황에 따라 다를 수 있다.
 */
export interface NonTaxablePreset {
  label: string;
  limitNote: string;
}

export const NON_TAXABLE_PRESETS: NonTaxablePreset[] = [
  { label: "식대", limitNote: "월 20만원 이하 비과세 (별도 현물 급식이 없는 경우)" },
  { label: "자가운전보조금(차량유지비)", limitNote: "월 20만원 이하 비과세 (본인 명의 차량, 별도 여비 미지급 시)" },
  { label: "육아수당(출산·보육수당)", limitNote: "월 20만원 이하 비과세 (만 6세 이하 자녀)" },
  { label: "연구보조비", limitNote: "월 20만원 이하 비과세 (특정 연구기관 등 종사자)" },
  { label: "국외근로소득", limitNote: "월 100만원 이하 비과세 (일반 국외근로, 원양·건설 등은 월 500만원)" },
];

export const CUSTOM_NON_TAXABLE_LABEL = "직접입력";
