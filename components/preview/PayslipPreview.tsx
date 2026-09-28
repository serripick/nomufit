import { WageBreakdown } from "@/lib/contract-templates/wage-calc";
import { PayslipDeductions } from "@/lib/contract-templates/payslipCalc";
import { formatCurrency } from "@/lib/contract-templates/format";
import { EmployeeRecord } from "@/lib/employees/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="border border-slate-300 px-2 py-1.5 text-slate-700 print:px-1 print:py-0.5">
        {label}
      </td>
      <td className="border border-slate-300 px-2 py-1.5 text-right print:px-1 print:py-0.5">
        {value}
      </td>
    </tr>
  );
}

export function PayslipPreview({
  employee,
  breakdown,
  deductions,
  payYear,
  payMonth,
  payDay,
}: {
  employee: EmployeeRecord;
  breakdown: WageBreakdown;
  deductions: PayslipDeductions;
  payYear: number;
  payMonth: number;
  payDay: number;
}) {
  const netPay = breakdown.totalMonthlyPay - deductions.totalDeduction;

  return (
    <div className="mx-auto max-w-[780px] rounded-lg border border-slate-300 bg-white p-8 text-slate-900 shadow-sm print:m-0 print:w-full print:max-w-none print:border-none print:p-4 print:shadow-none">
      <p className="text-xs text-slate-400">[별지 제17호의2 서식]</p>
      <h1 className="mt-1 text-center text-2xl font-bold tracking-wide print:text-base">
        임 금 명 세 서
      </h1>
      <p className="mt-2 text-right text-sm text-slate-600 print:text-xs">
        지급일: {payYear}년 {payMonth}월 {payDay}일
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm print:text-xs">
        <p>
          <span className="text-slate-500">성명: </span>
          {employee.workerName || "미입력"}
        </p>
        <p>
          <span className="text-slate-500">생년월일: </span>
          {employee.workerBirthDate || "미입력"}
        </p>
        <p>
          <span className="text-slate-500">연락처: </span>
          {employee.workerPhone || "미입력"}
        </p>
        <p>
          <span className="text-slate-500">담당업무: </span>
          {employee.jobDescription || "미입력"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 print:gap-2">
        <div>
          <p className="mb-1 bg-slate-100 px-2 py-1 text-sm font-semibold print:text-xs">지 급</p>
          <table className="w-full border-collapse text-sm print:text-xs">
            <tbody>
              <Row label="기본급" value={formatCurrency(breakdown.baseSalary)} />
              {breakdown.monthlyOvertimeHours > 0 && (
                <Row
                  label="연장근로수당"
                  value={formatCurrency(breakdown.overtimeAllowanceAmount)}
                />
              )}
              {breakdown.monthlyNightHours > 0 && (
                <Row label="야간근로수당" value={formatCurrency(breakdown.nightAllowanceAmount)} />
              )}
              {breakdown.holidayAllowanceAmount > 0 && (
                <Row label="휴일근로수당" value={formatCurrency(breakdown.holidayAllowanceAmount)} />
              )}
              {breakdown.annualLeaveAllowanceAmount > 0 && (
                <Row label="연차수당" value={formatCurrency(breakdown.annualLeaveAllowanceAmount)} />
              )}
              {employee.wage.nonTaxableAllowances.map((a) => (
                <Row key={a.id} label={`${a.name || "비과세 항목"} (비과세)`} value={formatCurrency(a.amount)} />
              ))}
              <tr className="bg-slate-50 font-semibold">
                <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                  지급액 계
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-right print:px-1 print:py-0.5">
                  {formatCurrency(breakdown.totalMonthlyPay)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p className="mb-1 bg-slate-100 px-2 py-1 text-sm font-semibold print:text-xs">공 제</p>
          <table className="w-full border-collapse text-sm print:text-xs">
            <tbody>
              <Row label="국민연금" value={formatCurrency(deductions.nationalPension)} />
              <Row label="건강보험" value={formatCurrency(deductions.healthInsurance)} />
              <Row label="장기요양보험" value={formatCurrency(deductions.longTermCare)} />
              <Row label="고용보험" value={formatCurrency(deductions.employmentInsurance)} />
              <Row label="근로소득세" value={formatCurrency(deductions.incomeTax)} />
              <Row label="지방소득세" value={formatCurrency(deductions.localIncomeTax)} />
              {deductions.dormitoryDeduction > 0 && (
                <Row label="숙박비" value={formatCurrency(deductions.dormitoryDeduction)} />
              )}
              <tr className="bg-slate-50 font-semibold">
                <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                  공제액 계
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-right print:px-1 print:py-0.5">
                  {formatCurrency(deductions.totalDeduction)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="rounded-md bg-blue-50 px-4 py-2 text-right">
          <span className="text-sm text-blue-700 print:text-xs">실수령액 </span>
          <span className="text-lg font-bold text-blue-900 print:text-sm">
            {formatCurrency(netPay)}
          </span>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500 print:mt-3 print:text-[9.5px]">
        · 위 임금명세서는 한달간 정상 근무 시에 해당되는 명세입니다.
        <br />
        · 근로일자, 근로시간 등이 변경되었을 경우에는 근로계약서에 명시된 내용대로 가감하여
        계산합니다.
        <br />
        · 근로소득세는 국세청 간이세액표를 조회하여 직접 입력한 금액이며, 지방소득세는 그 10%로
        자동 계산되었습니다.
      </p>
    </div>
  );
}
