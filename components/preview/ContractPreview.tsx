import { ReactNode } from "react";
import { ContractFormData } from "@/lib/contract-templates/types";
import { getPatternModule } from "@/lib/contract-templates/registry";
import {
  addMonthsToDateString,
  formatBreakTime,
  formatCurrency,
  formatHoursMinutes,
} from "@/lib/contract-templates/format";
import { computeWageBreakdown } from "@/lib/contract-templates/wage-calc";
import {
  COMPLIANCE_CLAUSE,
  CONFIDENTIALITY_CLAUSE,
  PERSONAL_INFO_CLAUSE,
  RESIGNATION_CLAUSE,
  getHolidayClause,
  getVacationClause,
} from "@/lib/contract-templates/boilerplate";

const INSURANCE_LABEL: Record<string, string> = {
  pension: "국민연금",
  health: "건강보험",
  employment: "고용보험",
  industrialAccident: "산재보험",
};

function ArticleRow({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[96px_1fr] border-t border-slate-300 first:border-t-0 print:break-inside-avoid print:grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr]">
      <div className="border-r border-slate-300 bg-slate-50 px-2 py-4 text-center text-xs font-bold leading-tight text-slate-800 print:px-1 print:py-1 print:text-[9.5px] sm:text-sm">
        제{number}조
        <br />
        {title}
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-slate-800 print:px-1.5 print:py-1 print:text-[10px] print:leading-snug">
        {children}
      </div>
    </div>
  );
}

const CIRCLED_NUMERALS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

function ClauseList({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5 print:space-y-0.5">
      {items.map((t, i) => (
        <p key={i}>
          {CIRCLED_NUMERALS[i] ?? `${i + 1}.`} {t}
        </p>
      ))}
    </div>
  );
}

function KeyValueRow({
  label,
  value,
  labelWidth = 72,
}: {
  label: string;
  value: string;
  labelWidth?: number;
}) {
  return (
    <div
      className="grid border-t border-slate-100 text-xs first:border-t-0 print:text-[10px]"
      style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
    >
      <div className="bg-slate-50 px-2 py-1.5 text-slate-500 print:px-1.5 print:py-0.5">{label}</div>
      <div className="px-2 py-1.5 text-slate-800 print:px-1.5 print:py-0.5">{value || ""}</div>
    </div>
  );
}

function PartyBox({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 print:px-1.5 print:py-1 print:text-[10px]">
        {title}
      </div>
      {rows.map((r) => (
        <KeyValueRow key={r.label} label={r.label} value={r.value} />
      ))}
    </div>
  );
}

export function ContractPreview({ data }: { data: ContractFormData }) {
  const { businessInfo, probation, employmentPattern, breakTimes, wage, annualLeave, socialInsurance } =
    data;
  const patternModule = getPatternModule(employmentPattern.type);
  const clauseText = patternModule.renderClauseText(employmentPattern as never);
  const scheduleTable = patternModule.renderScheduleTable(employmentPattern as never);

  const breakdown = computeWageBreakdown(
    employmentPattern,
    breakTimes,
    wage,
    businessInfo.fiveOrMoreEmployees
  );

  const activeInsurances = (Object.keys(INSURANCE_LABEL) as (keyof typeof socialInsurance)[])
    .filter((key) => socialInsurance[key])
    .map((key) => INSURANCE_LABEL[key]);

  const probationEndDate = probation.applicable
    ? addMonthsToDateString(businessInfo.contractStartDate, probation.months)
    : "";

  return (
    <div className="mx-auto max-w-[780px] rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm print:m-0 print:w-full print:max-w-none print:border-none print:shadow-none">
      <div className="border-b-2 border-slate-800 px-8 py-6 print:px-4 print:py-3">
        <h1 className="text-center text-2xl font-bold tracking-wide print:text-base">근로계약서</h1>
        <p className="mt-3 text-center text-xs leading-relaxed text-slate-600 print:mt-1.5 print:text-[10px]">
          {businessInfo.businessName || ""}(이하 &quot;사업주&quot;라 함)와(과){" "}
          {businessInfo.workerName || ""}(이하 &quot;근로자&quot;라 함)은(는)
          다음과 같이 근로계약을 체결한다.
        </p>
      </div>

      <div className="border-b border-slate-300">
        <ArticleRow number={1} title="당사자">
          <div className="grid grid-cols-1 gap-3 print:gap-1.5 sm:grid-cols-2">
            <PartyBox
              title="사업주 (갑)"
              rows={[
                { label: "상호", value: businessInfo.businessName },
                { label: "주소", value: businessInfo.businessAddress },
                { label: "대표자", value: businessInfo.representativeName },
                { label: "연락처", value: businessInfo.businessPhone },
              ]}
            />
            <PartyBox
              title="근로자 (을)"
              rows={[
                { label: "성명", value: businessInfo.workerName },
                { label: "성별", value: businessInfo.workerGender === "F" ? "여성" : "남성" },
                { label: "주소", value: businessInfo.workerAddress },
                { label: "생년월일", value: businessInfo.workerBirthDate },
                { label: "연락처", value: businessInfo.workerPhone },
              ]}
            />
          </div>
        </ArticleRow>

        <ArticleRow number={2} title="담당업무">
          <div className="overflow-hidden rounded border border-slate-200">
            <KeyValueRow label="담당업무" value={businessInfo.jobDescription} labelWidth={88} />
            <KeyValueRow label="근무장소" value={businessInfo.workLocation} labelWidth={88} />
          </div>
          <p className="mt-2 text-xs text-slate-500 print:mt-1 print:text-[9.5px]">
            사업주는 업무상 필요에 의해 근로자의 근무장소, 담당업무를 변경할 수 있다.
          </p>
        </ArticleRow>

        <ArticleRow number={3} title="근로계약기간">
          <p>
            {businessInfo.contractStartDate || ""}부터{" "}
            {businessInfo.contractEndDate
              ? `${businessInfo.contractEndDate}까지`
              : "기간의 정함 없음"}
          </p>
        </ArticleRow>

        <ArticleRow number={4} title="수습기간">
          {probation.applicable ? (
            <ClauseList
              items={[
                `입사일부터 ${probation.months}개월을 수습기간으로 한다(${
                  businessInfo.contractStartDate || ""
                }부터 ${probationEndDate || ""}까지).`,
                "수습기간 종료 시 수습기간 중의 근태, 근무성적, 동료와의 관계성, 업무숙련도 등을 고려하여 본채용 여부를 결정한다.",
                `사업주는 근로자에게 수습기간 동안 정규임금의 ${probation.wagePercent}%에 해당하는 임금을 지급할 수 있다. 다만 최저임금액의 90% 이상을 지급한다.`,
              ]}
            />
          ) : (
            <p className="text-slate-600">수습기간을 적용하지 아니한다.</p>
          )}
        </ArticleRow>

        <ArticleRow number={5} title="임금">
          <table className="w-full border-collapse border border-slate-300 text-xs print:text-[9.5px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 px-2 py-1.5 font-semibold print:px-1 print:py-0.5">
                  구분
                </th>
                <th className="border border-slate-300 px-2 py-1.5 font-semibold print:px-1 print:py-0.5">
                  금액
                </th>
                <th className="border border-slate-300 px-2 py-1.5 font-semibold print:px-1 print:py-0.5">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {wage.payType === "HOURLY" && (
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">시급</td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(wage.hourlyRate)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    실 근로시간에 따라 계산하여 지급
                  </td>
                </tr>
              )}
              {wage.payType === "DAILY" && (
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">일급</td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(wage.dailyRate)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    {wage.isInclusiveWage
                      ? `연장·야간·휴일·연차수당을 포함한 포괄임금 (환산시급 ${formatCurrency(Math.round(breakdown.hourlyWage))})`
                      : `소정근로에 대한 고정급 (환산시급 ${formatCurrency(Math.round(breakdown.hourlyWage))}), 연장·야간·휴일·연차수당 별도 지급`}
                  </td>
                </tr>
              )}
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                  {wage.payType === "MONTHLY" ? "기본급" : "기본급(월 환산)"}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                  {formatCurrency(breakdown.baseSalary)}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                  월 기본근로 {Math.round(breakdown.monthlyStandardHours)}시간(주휴수당 포함)
                </td>
              </tr>
              {wage.nonTaxableAllowances.map((a) => (
                <tr key={a.id}>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {a.name || "비과세 항목"}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(a.amount)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    비과세
                  </td>
                </tr>
              ))}
              {breakdown.monthlyOvertimeHours > 0 && (
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    고정연장근로수당
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(breakdown.overtimeAllowanceAmount)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    월 약 {breakdown.monthlyOvertimeHours.toFixed(1)}시간(1주{" "}
                    {breakdown.weeklyOvertimeHours.toFixed(1)}시간)의 고정연장근로시간
                  </td>
                </tr>
              )}
              {breakdown.monthlyNightHours > 0 && (
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    고정야간근로수당
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(breakdown.nightAllowanceAmount)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    월 약 {breakdown.monthlyNightHours.toFixed(1)}시간(22:00~06:00)의
                    고정야간근로시간
                  </td>
                </tr>
              )}
              {wage.holidayWorkAllowance.enabled && (
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    휴일근무수당
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(breakdown.holidayAllowanceAmount)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    월 {wage.holidayWorkAllowance.hoursPerMonth}시간의 고정휴일근로시간
                  </td>
                </tr>
              )}
              {wage.annualLeaveAllowance.enabled && (
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    연차수당
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                    {formatCurrency(breakdown.annualLeaveAllowanceAmount)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-500 print:px-1 print:py-0.5">
                    연차휴가미사용수당 선지급분({wage.annualLeaveAllowance.hoursPerMonth}시간)
                  </td>
                </tr>
              )}
              <tr className="bg-slate-50 font-semibold">
                <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5">
                  {wage.payType === "MONTHLY" ? "월 지급액" : "예상 월 지급액(참고용)"}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 print:px-1 print:py-0.5" colSpan={2}>
                  {formatCurrency(breakdown.totalMonthlyPay)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 text-xs text-slate-600 print:mt-1.5">
            <ClauseList
              items={[
                wage.payType === "HOURLY"
                  ? "임금은 시급제로 하며, 실제 근로시간을 기준으로 계산하여 지급한다. 위 예상 월 지급액은 참고용이며 실제 지급액은 그 달의 실근로시간에 따라 달라질 수 있다."
                  : wage.payType === "DAILY"
                    ? wage.isInclusiveWage
                      ? "임금은 일급제로 하며, 연장·야간·휴일·연차수당을 포함한 포괄임금으로 일당을 정한다. 위 예상 월 지급액은 참고용이며 실제 지급액은 그 달의 실근로일수에 따라 달라질 수 있다."
                      : "임금은 일급제로 하며, 일당은 소정근로에 대한 고정급으로 정하고 연장·야간·휴일·연차수당은 이와 별도로 산정하여 추가 지급한다."
                    : wage.isInclusiveWage
                      ? "임금은 월급제로 하며, 위 임금총액에는 연장·야간·휴일·연차수당이 포함되어 있다."
                      : "임금은 월급제로 하며, 위 표의 기본급 외 연장·야간·휴일·연차수당은 이와 별도로 산정하여 추가 지급한다.",
                `임금은 세전금액에서 법정세금 등을 원천징수하여 ${
                  wage.payDay || ""
                }에 지급하며, 지급방법은 ${
                  wage.payMethod || ""
                }으로 한다. 다만 지급일이 휴(무)일 또는 공휴일과 중복되는 경우 그 이후 첫 소정근로일에 지급할 수 있다.`,
                "근로자가 해당월에 중도 입사·퇴직하거나 결근하는 등 근태사고가 발생하는 경우 당해 월 지급액을 일할계산(공제)하여 지급한다.",
                ...(breakdown.premiumMultiplier === 1 &&
                (breakdown.monthlyOvertimeHours > 0 ||
                  breakdown.monthlyNightHours > 0 ||
                  wage.holidayWorkAllowance.enabled)
                  ? [
                      "본 사업장은 상시근로자 5인 미만으로 근로기준법 제56조에 따른 연장·야간·휴일근로 가산수당(50%)이 적용되지 아니하며, 통상임금을 기준으로 계산하여 지급한다.",
                    ]
                  : []),
              ]}
            />
          </div>
        </ArticleRow>

        <ArticleRow number={6} title="근로시간">
          <p>{clauseText}</p>
          {scheduleTable && (
            <table className="mt-3 w-full border-collapse border border-slate-300 text-center text-xs print:mt-1.5 print:text-[9.5px]">
              <thead>
                <tr>
                  {scheduleTable.headers.map((h) => (
                    <th
                      key={h}
                      className="border border-slate-300 bg-slate-50 px-2 py-1 print:px-1 print:py-0.5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleTable.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border border-slate-300 px-2 py-1 print:px-1 print:py-0.5"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {breakTimes.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm print:mt-1 print:text-[10.5px]">
              {breakTimes.map((bt) => (
                <li key={bt.id}>{formatBreakTime(bt)}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 rounded bg-blue-50 px-3 py-2 text-xs text-blue-800 print:mt-1 print:px-2 print:py-1 print:text-[9.5px]">
            근무시간에서 휴게시간을 제외하여 자동 계산한 소정근로시간 —{" "}
            {breakdown.hasUniformDailyHours && (
              <>
                1일{" "}
                <span className="font-semibold">{formatHoursMinutes(breakdown.dailyRawHours)}</span>{" "}
                ·{" "}
              </>
            )}
            1주 <span className="font-semibold">{formatHoursMinutes(breakdown.weeklyHours)}</span>
          </p>
          <div className="mt-3 text-xs text-slate-600 print:mt-1.5">
            <ClauseList
              items={[
                "근로자의 근로일과 근로시간은 위와 같되, 사업장의 업무 형편에 따라 근로자와 협의하여 변경할 수 있다.",
                "휴게시간은 위와 같고, 사업장의 질서를 해치지 않는 범위에서 근로자가 자유롭게 사용할 수 있다.",
                "근로자는 연장·야간·휴일근무를 하는 것에 동의한다.",
              ]}
            />
          </div>
        </ArticleRow>

        <ArticleRow number={7} title="휴일">
          <ClauseList items={getHolidayClause(businessInfo.fiveOrMoreEmployees)} />
        </ArticleRow>

        <ArticleRow number={8} title="휴가 및 휴직">
          <ClauseList
            items={getVacationClause(
              wage.annualLeaveAllowance.enabled,
              businessInfo.fiveOrMoreEmployees
            )}
          />
          {!wage.annualLeaveAllowance.enabled && (
            <p className="mt-2 text-slate-700 print:mt-1">
              {annualLeave.basis === "LEGAL"
                ? "그 밖의 연차유급휴가에 관한 사항은 근로기준법에서 정하는 바에 따른다."
                : annualLeave.customDetail || ""}
            </p>
          )}
        </ArticleRow>

        <ArticleRow number={9} title="퇴직">
          <ClauseList items={RESIGNATION_CLAUSE} />
        </ArticleRow>

        <ArticleRow number={10} title="개인정보보호 및 비밀유지의무">
          <ClauseList items={CONFIDENTIALITY_CLAUSE} />
        </ArticleRow>

        <ArticleRow number={11} title="개인정보 수집이용 동의">
          <ClauseList items={PERSONAL_INFO_CLAUSE} />
        </ArticleRow>

        <ArticleRow number={12} title="준수사항">
          <ClauseList items={COMPLIANCE_CLAUSE} />
        </ArticleRow>
      </div>

      <div className="border-b border-slate-300 px-8 py-4 text-xs text-slate-700 print:px-4 print:py-2 print:text-[10px]">
        <span className="font-semibold text-slate-900">사회보험 적용여부: </span>
        {activeInsurances.length > 0 ? activeInsurances.join(", ") : "해당 없음"}
      </div>

      <div className="px-8 py-8 text-sm print:break-inside-avoid print:px-4 print:py-3">
        <p className="mb-6 text-center text-slate-700 print:mb-3 print:text-[10.5px]">
          계약 당사자인 근로자와 사업주는 위와 같이 근로계약을 체결하며, 상호 성실히 이행할 것을
          서약한다.
        </p>
        <div className="grid grid-cols-1 gap-8 print:gap-4 sm:grid-cols-2">
          <div className="text-xs leading-relaxed print:text-[10px]">
            <p className="mb-2 font-semibold text-slate-900 print:mb-1">사업주 (갑)</p>
            <p>상호: {businessInfo.businessName || ""}</p>
            <p>주소: {businessInfo.businessAddress || ""}</p>
            <p>대표자: {businessInfo.representativeName || ""} (인)</p>
          </div>
          <div className="text-xs leading-relaxed print:text-[10px]">
            <p className="mb-2 font-semibold text-slate-900 print:mb-1">근로자 (을)</p>
            <p>성명: {businessInfo.workerName || ""} (서명)</p>
            <p>주소: {businessInfo.workerAddress || ""}</p>
            <p>생년월일: {businessInfo.workerBirthDate || ""}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
