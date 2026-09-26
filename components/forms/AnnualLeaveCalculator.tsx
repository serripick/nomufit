import { useEffect, useState } from "react";
import { BreakTimeEntry, EmploymentPatternData, WageInfo } from "@/lib/contract-templates/types";
import { computeWageBreakdown } from "@/lib/contract-templates/wage-calc";
import {
  computeMultiYearLeaveSettlement,
  computeYearlyLeaveEntitlements,
} from "@/lib/contract-templates/annualLeaveCalc";
import { formatCurrency } from "@/lib/contract-templates/format";
import { listEmployees } from "@/lib/employees/store";
import { EmployeeRecord } from "@/lib/employees/types";
import { FieldLabel, NumberInput, TextInput } from "./fields";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AnnualLeaveCalculator({
  businessId,
  defaultHireDate,
  wage,
  employmentPattern,
  breakTimes,
  fiveOrMoreEmployees,
}: {
  /** 사업장이 아직 등록되지 않은 예시/초안 상태라면 null — 이때는 직원 선택 없이 현재 입력값을 그대로 사용한다. */
  businessId: string | null;
  defaultHireDate: string;
  wage: WageInfo;
  employmentPattern: EmploymentPatternData;
  breakTimes: BreakTimeEntry[];
  fiveOrMoreEmployees: boolean;
}) {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [hireDateOverride, setHireDateOverride] = useState<string | null>(null);
  const [asOfDateOverride, setAsOfDateOverride] = useState<string | null>(null);
  const [usedDaysByYear, setUsedDaysByYear] = useState<Record<number, number>>({});
  const [touchedYears, setTouchedYears] = useState<Set<number>>(new Set());
  const [targetMode, setTargetMode] = useState<"ALL" | number | null>(null);

  useEffect(() => {
    if (!businessId) {
      setEmployees([]);
      setSelectedEmployeeId("");
      return;
    }
    listEmployees(businessId)
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, [businessId]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) ?? null;

  const resetSettlementInputs = () => {
    setHireDateOverride(null);
    setAsOfDateOverride(null);
    setUsedDaysByYear({});
    setTouchedYears(new Set());
    setTargetMode(null);
  };

  // 사업장 등록 전(예시 화면)에는 직원 선택 없이 현재 폼 입력값을 그대로 계산에 사용한다.
  // 사업장이 등록된 뒤에는 "계약서 작성" 탭에서 무엇을 편집 중이든 상관없이, 저장된 직원을
  // 직접 골라야만 그 직원의 실제 임금 정보로 정확히 계산된다.
  const effectiveWage = businessId ? selectedEmployee?.wage : wage;
  const effectiveEmploymentPattern = businessId
    ? selectedEmployee?.employmentPattern
    : employmentPattern;
  const effectiveBreakTimes = businessId ? selectedEmployee?.breakTimes : breakTimes;
  const effectiveFiveOrMoreEmployees = businessId
    ? (selectedEmployee?.fiveOrMoreEmployees ?? fiveOrMoreEmployees)
    : fiveOrMoreEmployees;
  const effectiveDefaultHireDate = businessId
    ? (selectedEmployee?.contractStartDate ?? "")
    : defaultHireDate;

  const readyToCalculate = !businessId || Boolean(selectedEmployee);

  const hireDate = hireDateOverride ?? effectiveDefaultHireDate;
  const asOfDate = asOfDateOverride ?? todayString();

  const breakdown =
    readyToCalculate && effectiveWage && effectiveEmploymentPattern && effectiveBreakTimes
      ? computeWageBreakdown(
          effectiveEmploymentPattern,
          effectiveBreakTimes,
          effectiveWage,
          effectiveFiveOrMoreEmployees
        )
      : null;
  const isInclusive = effectiveWage ? effectiveWage.payType !== "HOURLY" && effectiveWage.isInclusiveWage : false;
  const prepaidMonthlyAmount =
    breakdown && effectiveWage?.annualLeaveAllowance.enabled && isInclusive
      ? breakdown.annualLeaveAllowanceAmount
      : 0;

  const entries = breakdown ? computeYearlyLeaveEntitlements(hireDate, asOfDate) : [];
  const settlement = breakdown
    ? computeMultiYearLeaveSettlement(
        hireDate,
        asOfDate,
        usedDaysByYear,
        targetMode ?? "ALL",
        breakdown.hourlyWage,
        breakdown.dailyStandardHours,
        prepaidMonthlyAmount
      )
    : null;

  const allYearsTouched = entries.every((e) => touchedYears.has(e.yearIndex));

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        퇴직 정산 또는 재직 중 연간 정산 등, 특정 시점 기준 미사용 연차수당을 근속연도별로
        계산합니다.
        {businessId
          ? " 계약서 작성 탭에서 지금 편집 중인 내용과는 무관하게, 아래에서 직원 현황표에 저장된 직원을 직접 선택해야 그 직원의 실제 임금 정보로 계산됩니다."
          : ' 입사일은 위 "근로계약 시작일"을 기본값으로 가져오며, 통상시급은 위 "임금 및 수당" 섹션의 설정을 그대로 사용합니다.'}
      </p>

      {businessId && (
        <div>
          <FieldLabel>직원 선택</FieldLabel>
          {employees.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">
              아직 저장된 직원이 없습니다. 먼저 &quot;직원 현황표&quot;에서 직원을 저장한 뒤
              계산해주세요.
            </p>
          ) : (
            <select
              className={
                "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" +
                (selectedEmployeeId ? "" : " doc-type-attention")
              }
              value={selectedEmployeeId}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
                resetSettlementInputs();
              }}
            >
              <option value="">-- 계산할 직원을 선택하세요 --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.workerName || "(이름 미입력)"} (입사일 {emp.contractStartDate || "미입력"})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {readyToCalculate && breakdown && settlement && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>입사일</FieldLabel>
              <TextInput
                type="date"
                value={hireDate}
                onChange={(e) => setHireDateOverride(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>정산 기준일(퇴사일 등)</FieldLabel>
              <TextInput
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDateOverride(e.target.value)}
              />
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">
              입사일이 정산 기준일보다 이전이어야 계산할 수 있습니다.
            </p>
          ) : (
            <>
              <div>
                <FieldLabel>근속연도별 발생·사용 내역</FieldLabel>
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <table className="w-full min-w-[520px] border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="border-b border-slate-200 px-2 py-2 text-left">근속연도</th>
                        <th className="border-b border-slate-200 px-2 py-2 text-left">기간</th>
                        <th className="border-b border-slate-200 px-2 py-2 text-right">발생일수</th>
                        <th className="border-b border-slate-200 px-2 py-2 text-left">
                          사용일수 (실제로 쉰 날짜만)
                        </th>
                        <th className="border-b border-slate-200 px-2 py-2 text-right">잔여일수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlement.rows.map((row) => (
                        <tr key={row.yearIndex} className="border-b border-slate-100 last:border-0">
                          <td className="px-2 py-2">
                            {row.yearIndex}년차{row.isOngoing ? " (진행중)" : ""}
                          </td>
                          <td className="px-2 py-2 text-slate-500">
                            {row.startDate} ~ {row.endDate}
                          </td>
                          <td className="px-2 py-2 text-right font-medium">{row.entitledDays}일</td>
                          <td className="px-2 py-2">
                            <NumberInput
                              value={usedDaysByYear[row.yearIndex] ?? 0}
                              min={0}
                              step={0.5}
                              className={
                                "!min-h-0 !py-1 " +
                                (touchedYears.has(row.yearIndex) ? "" : "doc-type-attention")
                              }
                              onChange={(e) => {
                                setUsedDaysByYear((prev) => ({
                                  ...prev,
                                  [row.yearIndex]: Number(e.target.value),
                                }));
                                setTouchedYears((prev) => new Set(prev).add(row.yearIndex));
                              }}
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-medium">{row.remainingDays}일</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  2년차부터는 매 anniversary(만 1년, 2년...)를 채우는 순간 그 해 발생일수가 한 번에
                  확정되며, 그 뒤 조기 퇴직해도 일할로 줄어들지 않습니다. 선지급된 연차수당(포괄임금
                  항목)이 있다면 아래 최종 계산에서 연도별로 비례 차감되니, 위 칸에는 실제로 쉰
                  연차일수만 입력하세요.
                </p>
              </div>

              {!allYearsTouched && (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  연도별 사용일수를 모두 확인 후 입력해주세요. 확인하지 않고 0일로 그대로 정산하면
                  실제 사용한 연차가 있어도 반영되지 않아 수당이 과다 계산될 수 있습니다.
                </p>
              )}

              <div>
                <FieldLabel>정산 대상</FieldLabel>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      className={targetMode === null ? "doc-type-attention" : ""}
                      checked={targetMode === "ALL"}
                      onChange={() => setTargetMode("ALL")}
                    />
                    전체 근속기간 합산 (퇴직 정산용 — 그동안 못 쓴 연차를 모두 정산)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        className={targetMode === null ? "doc-type-attention" : ""}
                        checked={typeof targetMode === "number"}
                        onChange={() =>
                          setTargetMode(entries[entries.length - 1]?.yearIndex ?? 1)
                        }
                      />
                      특정 연도만 (재직 중 연간 정산용)
                    </label>
                    {typeof targetMode === "number" && (
                      <select
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                        value={targetMode}
                        onChange={(e) => setTargetMode(Number(e.target.value))}
                      >
                        {entries.map((entry) => (
                          <option key={entry.yearIndex} value={entry.yearIndex}>
                            {entry.yearIndex}년차{entry.isOngoing ? " (진행중)" : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {targetMode !== null && (
                <>
                  <div className="rounded-lg border-2 border-blue-200 bg-white px-4 py-3">
                    <p className="text-xs text-slate-500">
                      {targetMode === "ALL"
                        ? "최종 미사용 연차수당 (전체 근속기간 합산)"
                        : `최종 미사용 연차수당 (${targetMode}년차만)`}
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(settlement.payoutAmount)}
                    </p>
                  </div>

                  <div className="space-y-1 rounded-md bg-blue-50 px-4 py-3 text-xs text-blue-900">
                    <p>
                      정산 대상 최종 잔여{" "}
                      <span className="font-semibold">
                        {settlement.selectedNetRemainingDays.toFixed(1)}일
                      </span>{" "}
                      (선지급 차감 반영) × 1일 통상임금{" "}
                      {formatCurrency(settlement.dailyOrdinaryWage)} (통상시급{" "}
                      {formatCurrency(Math.round(breakdown.hourlyWage))} × 1일{" "}
                      {breakdown.dailyStandardHours.toFixed(1)}시간) ={" "}
                      <span className="font-semibold">
                        미사용 연차수당 {formatCurrency(settlement.payoutAmount)}
                      </span>
                    </p>
                    <p className="text-blue-700">
                      80% 이상 출근을 전제로 한 단순 계산이며, 결근 등 특수사정은 반영되지
                      않습니다.
                      {prepaidMonthlyAmount > 0 &&
                        " 포괄임금 + 연차수당 선지급이 적용 중이어서, 해당 연도에 매월 선지급되어 온 것으로 보이는 연차수당을 일수로 환산해 그 연도 잔여일수에서 먼저 차감했습니다."}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
