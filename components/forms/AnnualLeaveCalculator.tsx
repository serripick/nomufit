import { useState } from "react";
import { BreakTimeEntry, EmploymentPatternData, WageInfo } from "@/lib/contract-templates/types";
import { computeWageBreakdown } from "@/lib/contract-templates/wage-calc";
import { computeAnnualLeaveSettlement } from "@/lib/contract-templates/annualLeaveCalc";
import { formatCurrency } from "@/lib/contract-templates/format";
import { FieldLabel, NumberInput, TextInput } from "./fields";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AnnualLeaveCalculator({
  defaultHireDate,
  wage,
  employmentPattern,
  breakTimes,
  fiveOrMoreEmployees,
}: {
  defaultHireDate: string;
  wage: WageInfo;
  employmentPattern: EmploymentPatternData;
  breakTimes: BreakTimeEntry[];
  fiveOrMoreEmployees: boolean;
}) {
  const [hireDateOverride, setHireDateOverride] = useState<string | null>(null);
  const [asOfDateOverride, setAsOfDateOverride] = useState<string | null>(null);
  const [usedDays, setUsedDays] = useState(0);
  const [usedDaysConfirmed, setUsedDaysConfirmed] = useState(false);

  const hireDate = hireDateOverride ?? defaultHireDate;
  const asOfDate = asOfDateOverride ?? todayString();

  const breakdown = computeWageBreakdown(employmentPattern, breakTimes, wage, fiveOrMoreEmployees);
  const isInclusive = wage.payType !== "HOURLY" && wage.isInclusiveWage;
  const prepaidMonthlyAmount =
    wage.annualLeaveAllowance.enabled && isInclusive ? breakdown.annualLeaveAllowanceAmount : 0;
  const settlement = computeAnnualLeaveSettlement(
    hireDate,
    asOfDate,
    usedDays,
    breakdown.hourlyWage,
    breakdown.dailyStandardHours,
    prepaidMonthlyAmount
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        퇴직 정산 등 특정 시점 기준 미사용 연차수당을 계산합니다. 입사일은 위 &quot;근로계약
        시작일&quot;을 기본값으로 가져오며, 다른 근로자를 계산할 경우 직접 수정하면 그 값이
        우선 적용됩니다. 통상시급은 위 &quot;임금 및 수당&quot; 섹션의 급여·포괄임금 여부
        설정을 그대로 사용합니다.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <div>
          <FieldLabel>연차 사용일수 (실제로 쉰 날짜만)</FieldLabel>
          <NumberInput
            value={usedDays}
            min={0}
            step={0.5}
            onChange={(e) => {
              setUsedDays(Number(e.target.value));
              setUsedDaysConfirmed(true);
            }}
            className={usedDaysConfirmed ? "" : "doc-type-attention"}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            선지급된 연차수당(포괄임금 항목)은 아래 계산에 이미 자동으로 별도 차감되어 있으니,
            여기에는 실제로 쉰 연차일수만 입력하세요.
          </p>
        </div>
      </div>

      {!usedDaysConfirmed && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          연차 사용일수를 확인 후 입력해주세요. 확인하지 않고 0일로 그대로 정산하면 실제 사용한
          연차가 있어도 반영되지 않아 수당이 과다 계산될 수 있습니다.
        </p>
      )}

      <div className="space-y-1 rounded-md bg-blue-50 px-4 py-3 text-xs text-blue-900">
        <p>
          근속 {settlement.fullYears}년 {settlement.totalMonths % 12}개월 (총{" "}
          {settlement.totalMonths}개월) 기준 발생 연차{" "}
          <span className="font-semibold">{settlement.entitledDays}일</span> − 사용{" "}
          {usedDays}일 = 잔여{" "}
          <span className={prepaidMonthlyAmount > 0 ? "" : "font-semibold"}>
            {settlement.remainingDays}일
          </span>
        </p>
        {prepaidMonthlyAmount > 0 && (
          <p>
            − 선지급 일수 (월 선지급액 {formatCurrency(prepaidMonthlyAmount)} ×{" "}
            {settlement.totalMonths}개월 = {formatCurrency(settlement.prepaidTotal)} ÷ 1일
            통상임금 {formatCurrency(settlement.dailyOrdinaryWage)} ={" "}
            {settlement.prepaidDays.toFixed(1)}일) = 최종 잔여{" "}
            <span className="font-semibold">{settlement.netRemainingDays.toFixed(1)}일</span>
          </p>
        )}
        <p>
          1일 통상임금 {formatCurrency(settlement.dailyOrdinaryWage)} (통상시급{" "}
          {formatCurrency(Math.round(breakdown.hourlyWage))} × 1일{" "}
          {breakdown.dailyStandardHours.toFixed(1)}시간) × 최종 잔여{" "}
          {settlement.netRemainingDays.toFixed(1)}일 ={" "}
          <span className="font-semibold">
            미사용 연차수당 {formatCurrency(settlement.payoutAmount)}
          </span>
        </p>
        <p className="text-blue-700">
          80% 이상 출근을 전제로 한 단순 계산이며, 결근 등 특수사정은 반영되지 않습니다.
          {prepaidMonthlyAmount > 0 &&
            " 포괄임금 + 연차수당 선지급이 적용 중이어서, 입사일부터 정산 기준일까지 매월 선지급되어 온 것으로 보이는 연차수당을 일수로 환산해 잔여일수에서 먼저 차감했습니다."}
        </p>
      </div>
    </div>
  );
}
