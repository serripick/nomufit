export interface BusinessRecord {
  id: string;
  /** 이 사업장 데이터의 소유자(Supabase Auth 사용자, 익명 세션 포함). RLS의 기준이 된다. */
  ownerId: string | null;
  businessRegistrationNumber: string;
  businessName: string;
  representativeName: string;
  businessAddress: string;
  businessPhone: string;
  /** 승인 후 실계정(이메일+비밀번호) 전환 시 저장되는 로그인 이메일. */
  email: string;
  fiveOrMoreEmployees: boolean;
  /** 결제/승인 완료 여부. true인 사업장만 문서 인쇄·출력이 가능하다. */
  approved: boolean;
}

/** approved는 승인 전용 함수(approveBusiness)로만, ownerId는 생성 시 서버가 자동으로 붙인다 —
 * 둘 다 일반 생성/수정 입력에는 포함하지 않는다. email은 계정 전환 시에만 선택적으로 넘긴다. */
export type BusinessRecordInput = Omit<BusinessRecord, "id" | "approved" | "ownerId" | "email"> & {
  email?: string;
};
