"use client";

/** 승인된 사업장에서만 노출되는 다운로드 버튼. 이미 인쇄 최적화된 화면을 그대로
 * 브라우저의 인쇄 기능으로 열어주며, 사용자는 인쇄 대상에서 "PDF로 저장"을 선택하면 된다. */
export function PrintDownloadButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
    >
      PDF로 저장 / 인쇄하기
    </button>
  );
}
