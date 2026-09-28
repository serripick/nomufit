/** 승인된 사업장이 아직 익명 세션이면 /apply에 노출된다. 접속 아이디(사업자등록번호)와
 * 비밀번호는 관리자가 통화 후 직접 발급하므로, 여기서는 안내만 한다. */
export function AccountSetupBanner() {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm print:hidden">
      <p className="font-semibold text-slate-900">정식 이용이 승인되었습니다!</p>
      <p className="mt-1 text-xs text-slate-600">
        담당자에게 안내받은 접속 아이디(사업자등록번호)와 비밀번호로 로그인하면, 다른 기기에서도
        우리 사업장 정보를 이어서 관리할 수 있습니다.
      </p>
    </div>
  );
}
