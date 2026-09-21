import { BreakTimeEntry, EmploymentPatternData, PayType, WageInfo } from "@/lib/contract-templates/types";
import { createAllowanceId } from "@/lib/contract-templates/defaults";
import { formatCurrency } from "@/lib/contract-templates/format";
import { computeWageBreakdown } from "@/lib/contract-templates/wage-calc";
import { MINIMUM_HOURLY_WAGE } from "@/lib/contract-templates/minimumWage";
import { CUSTOM_NON_TAXABLE_LABEL, NON_TAXABLE_PRESETS } from "@/lib/contract-templates/nonTaxablePresets";
import { CurrencyInput, FieldLabel, NumberInput, TextInput } from "./fields";

export function WageFields({
  data,
  employmentPattern,
  breakTimes,
  fiveOrMoreEmployees,
  onChange,
}: {
  data: WageInfo;
  employmentPattern: EmploymentPatternData;
  breakTimes: BreakTimeEntry[];
  fiveOrMoreEmployees: boolean;
  onChange: (data: WageInfo) => void;
}) {
  const breakdown = computeWageBreakdown(employmentPattern, breakTimes, data, fiveOrMoreEmployees);

  const isHourly = data.payType === "HOURLY";
  const isDaily = data.payType === "DAILY";
  const hasWageInput =
    (isHourly && data.hourlyRate > 0) ||
    (isDaily && data.dailyRate > 0) ||
    (data.payType === "MONTHLY" && data.totalMonthlyPay > 0);
  const belowMinimumWage = hasWageInput && breakdown.isBelowMinimumWage;

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>급여 형태</FieldLabel>
        <div className="flex gap-4">
          {(["MONTHLY", "HOURLY", "DAILY"] as PayType[]).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                checked={data.payType === type}
                onChange={() => onChange({ ...data, payType: type })}
              />
              {type === "MONTHLY" && "월급제"}
              {type === "HOURLY" && "시급제 (아르바이트 등)"}
              {type === "DAILY" && "일급제 (일용직 등)"}
            </label>
          ))}
        </div>
      </div>

      {!isHourly && (
        <div>
          <FieldLabel>포괄임금 여부</FieldLabel>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                checked={data.isInclusiveWage}
                onChange={() => onChange({ ...data, isInclusiveWage: true })}
              />
              포괄임금 (연장·야간·휴일·연차수당 포함)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                checked={!data.isInclusiveWage}
                onChange={() => onChange({ ...data, isInclusiveWage: false })}
              />
              수당 별도 지급
            </label>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {data.isInclusiveWage
              ? "입력한 금액에 연장·야간·휴일·연차수당이 이미 포함된 것으로 보아 기본급을 역산합니다."
              : "입력한 금액은 고정 기본급이며, 연장·야간·휴일·연차수당은 이와 별도로 계산해 추가 지급합니다."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isHourly && (
          <div>
            <FieldLabel>시급 (원)</FieldLabel>
            <CurrencyInput
              value={data.hourlyRate}
              onChange={(hourlyRate) => onChange({ ...data, hourlyRate })}
            />
            {belowMinimumWage ? (
              <p className="mt-1 animate-pulse text-xs font-semibold text-red-600">
                {new Date().getFullYear()}년 최저시급 {formatCurrency(MINIMUM_HOURLY_WAGE)} 미만입니다. 아래 안내를 확인하세요.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                근로자에게 지급할 시급을 입력하세요. 월 예상 지급액은 자동으로 계산됩니다.
              </p>
            )}
          </div>
        )}
        {isDaily && (
          <div>
            <FieldLabel>일당 (원)</FieldLabel>
            <CurrencyInput
              value={data.dailyRate}
              onChange={(dailyRate) => onChange({ ...data, dailyRate })}
            />
            {belowMinimumWage ? (
              <p className="mt-1 animate-pulse text-xs font-semibold text-red-600">
                {new Date().getFullYear()}년 최저시급 {formatCurrency(MINIMUM_HOURLY_WAGE)} 미만입니다. 아래 안내를 확인하세요.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                {data.isInclusiveWage
                  ? "근로자에게 지급할 일당을 입력하세요. 연장·야간·휴일·연차수당은 일당에 이미 포함된 것으로 보아 기본급이 자동으로 역산됩니다."
                  : "근로자에게 지급할 고정 일당을 입력하세요. 연장·야간·휴일·연차수당은 이와 별도로 계산되어 추가 지급됩니다."}
              </p>
            )}
          </div>
        )}
        {data.payType === "MONTHLY" && (
          <div>
            <FieldLabel>임금총액 (월, 세전, 원)</FieldLabel>
            <CurrencyInput
              value={data.totalMonthlyPay}
              onChange={(totalMonthlyPay) => onChange({ ...data, totalMonthlyPay })}
            />
            {belowMinimumWage ? (
              <p className="mt-1 animate-pulse text-xs font-semibold text-red-600">
                {new Date().getFullYear()}년 최저시급 {formatCurrency(MINIMUM_HOURLY_WAGE)} 미만입니다. 아래 안내를 확인하세요.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                {data.isInclusiveWage
                  ? "비과세·수당을 포함해 실제로 지급하는 월 급여 총액을 입력하세요. 기본급은 자동으로 역산됩니다."
                  : "비과세를 포함한 고정 월급을 입력하세요. 연장·야간·휴일·연차수당은 이와 별도로 계산되어 추가 지급됩니다."}
              </p>
            )}
          </div>
        )}
        <div>
          <FieldLabel>지급일</FieldLabel>
          <TextInput
            value={data.payDay}
            onChange={(e) => onChange({ ...data, payDay: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>지급방법</FieldLabel>
          <TextInput
            value={data.payMethod}
            onChange={(e) => onChange({ ...data, payMethod: e.target.value })}
          />
        </div>
      </div>

      {belowMinimumWage && (
        <div className="animate-pulse rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
          <p className="font-semibold">
            최저임금 미달 — 재조정이 필요합니다 ({new Date().getFullYear()}년 최저시급{" "}
            {formatCurrency(MINIMUM_HOURLY_WAGE)})
          </p>
          <p className="mt-1">
            최저임금 산입 임금(기본급 + 매월 정기 비과세 수당) {formatCurrency(breakdown.baseSalary)} +{" "}
            {formatCurrency(breakdown.nonTaxableTotal)} = {formatCurrency(breakdown.baseSalary + breakdown.nonTaxableTotal)} ÷ 월 소정근로시간{" "}
            {breakdown.monthlyStandardHours}시간 = 환산시급{" "}
            <span className="font-semibold">{formatCurrency(Math.round(breakdown.minimumWageHourlyEquivalent))}</span>
          </p>
          <p className="mt-1">
            최저시급 {formatCurrency(MINIMUM_HOURLY_WAGE)} − 환산시급{" "}
            {formatCurrency(Math.round(breakdown.minimumWageHourlyEquivalent))} = 시간당{" "}
            {formatCurrency(Math.ceil(MINIMUM_HOURLY_WAGE - breakdown.minimumWageHourlyEquivalent))} 부족 × 월{" "}
            {breakdown.monthlyStandardHours}시간 = 월{" "}
            <span className="font-semibold">
              {formatCurrency(breakdown.minimumWageShortfallPerMonth)} 이상 증액 필요
            </span>
          </p>
          <p className="mt-1 text-red-600">
            연장·야간·휴일근로수당과 연차수당은 최저임금 산입범위에서 제외되므로, 이 부족분은 위 수당을
            늘려서는 해결되지 않고 기본급(또는 매월 정기 비과세 수당)을 올려야 합니다.
          </p>
        </div>
      )}

      {breakdown.monthlyOvertimeHours > 0 && (
        <div className="rounded-md bg-amber-50 px-4 py-2 text-xs text-amber-800">
          근무패턴상 1주 40시간을 초과하는 연장근로 {breakdown.weeklyOvertimeHours.toFixed(1)}시간이
          있어 고정연장근로수당이 자동으로 포함됩니다: 통상시급 × {breakdown.premiumMultiplier} × 월{" "}
          {breakdown.monthlyOvertimeHours.toFixed(1)}시간 ={" "}
          <span className="font-semibold text-slate-900">
            {formatCurrency(breakdown.overtimeAllowanceAmount)}
          </span>
          {breakdown.premiumMultiplier === 1 && (
            <span className="ml-1 text-amber-700">(5인 미만 사업장, 가산율 미적용)</span>
          )}
        </div>
      )}

      {breakdown.monthlyNightHours > 0 && (
        <div className="rounded-md bg-amber-50 px-4 py-2 text-xs text-amber-800">
          근무패턴상 22:00~06:00 사이에 걸치는 야간근로가 월 {breakdown.monthlyNightHours.toFixed(1)}
          시간 있어 고정야간근로수당이 자동으로 포함됩니다: 통상시급 × {breakdown.premiumMultiplier} ×
          월 {breakdown.monthlyNightHours.toFixed(1)}시간 ={" "}
          <span className="font-semibold text-slate-900">
            {formatCurrency(breakdown.nightAllowanceAmount)}
          </span>
          {breakdown.premiumMultiplier === 1 && (
            <span className="ml-1 text-amber-700">(5인 미만 사업장, 가산율 미적용)</span>
          )}
        </div>
      )}

      <div>
        <FieldLabel>비과세 항목</FieldLabel>
        <div className="space-y-2">
          {data.nonTaxableAllowances.map((allowance, index) => {
            const preset = NON_TAXABLE_PRESETS.find((p) => p.label === allowance.name);
            const isCustom = !preset;
            return (
              <div key={allowance.id} className="space-y-1">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={isCustom ? CUSTOM_NON_TAXABLE_LABEL : allowance.name}
                      onChange={(e) => {
                        const next = [...data.nonTaxableAllowances];
                        const nextName =
                          e.target.value === CUSTOM_NON_TAXABLE_LABEL ? "" : e.target.value;
                        next[index] = { ...allowance, name: nextName };
                        onChange({ ...data, nonTaxableAllowances: next });
                      }}
                    >
                      {NON_TAXABLE_PRESETS.map((p) => (
                        <option key={p.label} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                      <option value={CUSTOM_NON_TAXABLE_LABEL}>{CUSTOM_NON_TAXABLE_LABEL}</option>
                    </select>
                    {isCustom && (
                      <TextInput
                        className="mt-1"
                        placeholder="항목명 직접 입력"
                        value={allowance.name}
                        onChange={(e) => {
                          const next = [...data.nonTaxableAllowances];
                          next[index] = { ...allowance, name: e.target.value };
                          onChange({ ...data, nonTaxableAllowances: next });
                        }}
                      />
                    )}
                  </div>
                  <div className="w-40">
                    <CurrencyInput
                      placeholder="금액"
                      value={allowance.amount}
                      onChange={(amount) => {
                        const next = [...data.nonTaxableAllowances];
                        next[index] = { ...allowance, amount };
                        onChange({ ...data, nonTaxableAllowances: next });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        nonTaxableAllowances: data.nonTaxableAllowances.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
                {preset && <p className="text-xs text-slate-500">{preset.limitNote}</p>}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                nonTaxableAllowances: [
                  ...data.nonTaxableAllowances,
                  { id: createAllowanceId(), name: NON_TAXABLE_PRESETS[0].label, amount: 0 },
                ],
              })
            }
            className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
          >
            + 비과세 항목 추가
          </button>
        </div>
      </div>

      <div className="rounded-md bg-slate-50 p-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={data.holidayWorkAllowance.enabled}
            onChange={(e) =>
              onChange({
                ...data,
                holidayWorkAllowance: { ...data.holidayWorkAllowance, enabled: e.target.checked },
              })
            }
          />
          휴일근무수당 선지급 적용
        </label>
        {data.holidayWorkAllowance.enabled && (
          <div className="space-y-2">
            <div>
              <FieldLabel>월 선지급 시간수</FieldLabel>
              <NumberInput
                value={data.holidayWorkAllowance.hoursPerMonth}
                min={0}
                step={0.5}
                onChange={(e) =>
                  onChange({
                    ...data,
                    holidayWorkAllowance: {
                      ...data.holidayWorkAllowance,
                      hoursPerMonth: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <p className="text-xs text-slate-600">
              통상시급 × {breakdown.premiumMultiplier} × {data.holidayWorkAllowance.hoursPerMonth}
              시간 = 월{" "}
              <span className="font-semibold text-slate-900">
                {formatCurrency(breakdown.holidayAllowanceAmount)}
              </span>{" "}
              (임금총액에서 역산된 기본급 기준 자동계산, 매월 급여에 선지급)
            </p>
          </div>
        )}
      </div>

      <div className="rounded-md bg-slate-50 p-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={data.annualLeaveAllowance.enabled}
            onChange={(e) =>
              onChange({
                ...data,
                annualLeaveAllowance: { ...data.annualLeaveAllowance, enabled: e.target.checked },
              })
            }
          />
          연차수당 선지급 적용
        </label>
        {data.annualLeaveAllowance.enabled && (
          <div className="space-y-2">
            <div>
              <FieldLabel>월 선지급 시간수</FieldLabel>
              <NumberInput
                value={data.annualLeaveAllowance.hoursPerMonth}
                min={0}
                step={0.5}
                onChange={(e) =>
                  onChange({
                    ...data,
                    annualLeaveAllowance: {
                      ...data.annualLeaveAllowance,
                      hoursPerMonth: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <p className="text-xs text-slate-600">
              통상시급 × {data.annualLeaveAllowance.hoursPerMonth}시간 = 월{" "}
              <span className="font-semibold text-slate-900">
                {formatCurrency(breakdown.annualLeaveAllowanceAmount)}
              </span>{" "}
              (임금총액에서 역산된 기본급 기준 자동계산, 매월 급여에 선지급 후 퇴사·연차사용 시
              정산)
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1 rounded-md bg-blue-50 px-4 py-3 text-xs text-blue-900">
        {isHourly ? (
          <>
            <p className="font-semibold">시급 기준 예상 월 지급액 (참고용)</p>
            <p>
              기본급(시급×월 소정근로시간) {formatCurrency(breakdown.baseSalary)} + 비과세{" "}
              {formatCurrency(breakdown.nonTaxableTotal)}
              {breakdown.monthlyOvertimeHours > 0 && (
                <> + 고정연장근로수당 {formatCurrency(breakdown.overtimeAllowanceAmount)}</>
              )}
              {breakdown.monthlyNightHours > 0 && (
                <> + 고정야간근로수당 {formatCurrency(breakdown.nightAllowanceAmount)}</>
              )}{" "}
              + 휴일근무수당 {formatCurrency(breakdown.holidayAllowanceAmount)} + 연차수당{" "}
              {formatCurrency(breakdown.annualLeaveAllowanceAmount)} ={" "}
              <span className="font-semibold">
                예상 월 지급액 {formatCurrency(breakdown.totalMonthlyPay)}
              </span>
            </p>
            <p className="text-blue-700">
              실제 지급액은 그 달의 실근로시간에 따라 달라질 수 있습니다.
            </p>
          </>
        ) : data.isInclusiveWage ? (
          <>
            <p className="font-semibold">
              {isDaily ? "일당 기준 포괄임금 자동 산정 결과" : "임금총액 기준 자동 산정 결과"}
            </p>
            {isDaily && (
              <p>
                일당 {formatCurrency(data.dailyRate)} × 월 평균 근무일수{" "}
                {breakdown.monthlyWorkDays.toFixed(1)}일 = 환산 임금총액{" "}
                <span className="font-semibold">{formatCurrency(breakdown.totalMonthlyPay)}</span>
              </p>
            )}
            <p>
              {isDaily
                ? `환산 임금총액 ${formatCurrency(breakdown.totalMonthlyPay)}`
                : `임금총액 ${formatCurrency(data.totalMonthlyPay)}`}{" "}
              − 비과세 {formatCurrency(breakdown.nonTaxableTotal)}
              {breakdown.monthlyOvertimeHours > 0 && (
                <> − 고정연장근로수당 {formatCurrency(breakdown.overtimeAllowanceAmount)}</>
              )}
              {breakdown.monthlyNightHours > 0 && (
                <> − 고정야간근로수당 {formatCurrency(breakdown.nightAllowanceAmount)}</>
              )}{" "}
              − 휴일근무수당 {formatCurrency(breakdown.holidayAllowanceAmount)} − 연차수당{" "}
              {formatCurrency(breakdown.annualLeaveAllowanceAmount)} ={" "}
              <span className="font-semibold">기본급 {formatCurrency(breakdown.baseSalary)}</span>
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">
              {isDaily ? "일당 기준 예상 월 지급액 (수당 별도지급)" : "임금총액 기준 예상 월 지급액 (수당 별도지급)"}
            </p>
            {isDaily && (
              <p>
                일당 {formatCurrency(data.dailyRate)} × 월 평균 근무일수{" "}
                {breakdown.monthlyWorkDays.toFixed(1)}일 = 고정급{" "}
                <span className="font-semibold">{formatCurrency(breakdown.baseSalary + breakdown.nonTaxableTotal)}</span>
              </p>
            )}
            <p>
              기본급 {formatCurrency(breakdown.baseSalary)} + 비과세{" "}
              {formatCurrency(breakdown.nonTaxableTotal)}
              {breakdown.monthlyOvertimeHours > 0 && (
                <> + 고정연장근로수당 {formatCurrency(breakdown.overtimeAllowanceAmount)}</>
              )}
              {breakdown.monthlyNightHours > 0 && (
                <> + 고정야간근로수당 {formatCurrency(breakdown.nightAllowanceAmount)}</>
              )}{" "}
              + 휴일근무수당 {formatCurrency(breakdown.holidayAllowanceAmount)} + 연차수당{" "}
              {formatCurrency(breakdown.annualLeaveAllowanceAmount)} ={" "}
              <span className="font-semibold">
                예상 월 지급액 {formatCurrency(breakdown.totalMonthlyPay)}
              </span>
            </p>
            <p className="text-blue-700">
              입력하신 금액은 고정 기본급이며, 연장·야간·휴일·연차수당은 이와 별도로 추가 지급됩니다.
            </p>
          </>
        )}
        <p>
          통상시급{" "}
          <span className="font-semibold">{formatCurrency(Math.round(breakdown.hourlyWage))}</span>{" "}
          (주 소정근로시간 {breakdown.weeklyHours.toFixed(1)}시간 · 월 소정근로시간{" "}
          {breakdown.monthlyStandardHours}시간 기준)
        </p>
      </div>
    </div>
  );
}
