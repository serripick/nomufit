import { useCallback, useEffect, useState } from "react";
import { ContractFormData } from "@/lib/contract-templates/types";
import { EmployeeRecord, EmployeeRecordInput } from "@/lib/employees/types";
import { deleteEmployee, insertEmployee, listEmployees, updateEmployee } from "@/lib/employees/store";

export interface EmployeeApi {
  listEmployees: (businessId: string) => Promise<EmployeeRecord[]>;
  insertEmployee: (businessId: string, input: EmployeeRecordInput) => Promise<EmployeeRecord>;
  updateEmployee: (id: string, input: EmployeeRecordInput) => Promise<EmployeeRecord>;
  deleteEmployee: (id: string) => Promise<void>;
}

/** 일반 고객 흐름의 기본값(RLS가 적용되는 anon-key 클라이언트). 관리자가 다른 사업장을
 * "열기"로 보는 중이라면, 페이지에서 lib/admin/adminBusinessApi.ts를 대신 넘겨준다. */
const defaultEmployeeApi: EmployeeApi = { listEmployees, insertEmployee, updateEmployee, deleteEmployee };

function toInput(data: ContractFormData): EmployeeRecordInput {
  const { businessInfo, employmentPattern, breakTimes, wage } = data;
  return {
    workerName: businessInfo.workerName,
    workerGender: businessInfo.workerGender,
    workerBirthDate: businessInfo.workerBirthDate,
    workerAddress: businessInfo.workerAddress,
    workerPhone: businessInfo.workerPhone,
    jobDescription: businessInfo.jobDescription,
    workLocation: businessInfo.workLocation,
    contractStartDate: businessInfo.contractStartDate,
    contractEndDate: businessInfo.contractEndDate,
    employmentPattern,
    breakTimes,
    wage,
    fiveOrMoreEmployees: businessInfo.fiveOrMoreEmployees,
    note: "",
  };
}

export function EmployeeRoster({
  businessId,
  formData,
  loadedEmployeeId,
  onLoadEmployee,
  onSavedEmployee,
  onStartNew,
  api = defaultEmployeeApi,
}: {
  businessId: string;
  formData: ContractFormData;
  loadedEmployeeId: string | null;
  onLoadEmployee: (record: EmployeeRecord) => void;
  onSavedEmployee: (id: string) => void;
  onStartNew: () => void;
  /** 관리자가 다른 사업장을 열람 중일 때 service role 경로로 바꿔치기하기 위한 주입점. */
  api?: EmployeeApi;
}) {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const rows = await api.listEmployees(businessId);
      setEmployees(rows);
      setStatus("idle");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "직원 목록을 불러오지 못했습니다.");
      setStatus("error");
    }
  }, [businessId, api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async () => {
    setStatus("saving");
    try {
      const input = toInput(formData);
      if (loadedEmployeeId) {
        const updated = await api.updateEmployee(loadedEmployeeId, input);
        onSavedEmployee(updated.id);
      } else {
        const created = await api.insertEmployee(businessId, input);
        onSavedEmployee(created.id);
      }
      await refresh();
      setStatus("idle");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "저장에 실패했습니다.");
      setStatus("error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 직원 기록을 삭제할까요?")) return;
    try {
      await api.deleteEmployee(id);
      if (id === loadedEmployeeId) onStartNew();
      await refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        현재 입력된 근로자 정보·근무패턴·임금 설정을 직원 현황표에 저장해두면, 다음에 같은
        직원의 계약서나 임금명세서를 만들 때 목록에서 불러와 자동으로 채울 수 있습니다.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving" || !formData.businessInfo.workerName}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loadedEmployeeId ? "현재 직원 정보 수정 저장" : "현재 입력값을 새 직원으로 저장"}
        </button>
        <button
          type="button"
          onClick={onStartNew}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          + 다른 직원 새로 입력하기 (사업장 정보는 유지, 나머지 초기화)
        </button>
      </div>

      {status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</p>
      )}

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">성명</th>
              <th className="px-3 py-2 font-medium">입사일</th>
              <th className="px-3 py-2 font-medium">연락처</th>
              <th className="px-3 py-2 font-medium">급여형태</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                  불러오는 중...
                </td>
              </tr>
            )}
            {status !== "loading" && employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                  등록된 직원이 없습니다.
                </td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className={
                  "border-t border-slate-100 " +
                  (emp.id === loadedEmployeeId ? "bg-blue-50" : "")
                }
              >
                <td className="px-3 py-2 font-medium text-slate-800">{emp.workerName}</td>
                <td className="px-3 py-2 text-slate-600">{emp.contractStartDate || "-"}</td>
                <td className="px-3 py-2 text-slate-600">{emp.workerPhone || "-"}</td>
                <td className="px-3 py-2 text-slate-600">
                  {emp.wage.payType === "MONTHLY"
                    ? "월급제"
                    : emp.wage.payType === "HOURLY"
                      ? "시급제"
                      : "일급제"}
                </td>
                <td className="space-x-2 px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onLoadEmployee(emp)}
                    className="text-blue-600 hover:underline"
                  >
                    불러오기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
