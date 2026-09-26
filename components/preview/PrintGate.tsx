import { ReactNode } from "react";

/** 미승인 사업장의 완성 문서는 화면에서는 자유롭게 보이되(체험 목적), 인쇄/출력 시에는
 * 실제 내용 대신 안내 문구만 나오도록 막는다. 저장은 이 컴포넌트와 무관하게 항상 가능하다. */
export function PrintGate({ approved, children }: { approved: boolean; children: ReactNode }) {
  if (approved) return <>{children}</>;
  return (
    <div className="doc-watermark">
      <div className="doc-print-content">{children}</div>
      <div className="doc-print-lock">
        <p>정식 이용 신청 및 승인 후 출력하실 수 있습니다.</p>
        <p>화면 하단의 &quot;정식 이용 신청&quot;을 먼저 진행해주세요.</p>
      </div>
    </div>
  );
}
