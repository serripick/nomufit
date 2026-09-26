export interface BusinessRecord {
  id: string;
  businessRegistrationNumber: string;
  businessName: string;
  representativeName: string;
  businessAddress: string;
  businessPhone: string;
  fiveOrMoreEmployees: boolean;
  /** 결제/승인 완료 여부. true인 사업장만 문서 인쇄·출력이 가능하다. */
  approved: boolean;
}

/** approved는 승인 전용 함수(approveBusiness)로만 바꾼다 — 일반 생성/수정 입력에는 포함하지 않는다. */
export type BusinessRecordInput = Omit<BusinessRecord, "id" | "approved">;
