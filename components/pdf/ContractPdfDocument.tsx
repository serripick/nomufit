import { Document, Page, View, Text } from "@react-pdf/renderer";
import { ContractFormData } from "@/lib/contract-templates/types";
import { getPatternModule } from "@/lib/contract-templates/registry";
import {
  addMonthsToDateString,
  formatBreakTime,
  formatCurrency,
  formatGender,
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
import { styles, ArticleRow, ClauseList, PartyBox, SimpleTable, nb } from "@/lib/pdf/primitives";

const INSURANCE_LABEL: Record<string, string> = {
  pension: "국민연금",
  health: "건강보험",
  employment: "고용보험",
  industrialAccident: "산재보험",
};

export function ContractPdfDocument({ data }: { data: ContractFormData }) {
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

  const wageRows: string[][] = [];
  if (wage.payType === "HOURLY") {
    wageRows.push(["시급", formatCurrency(wage.hourlyRate), "실 근로시간에 따라 계산하여 지급"]);
  }
  if (wage.payType === "DAILY") {
    wageRows.push([
      "일급",
      formatCurrency(wage.dailyRate),
      wage.isInclusiveWage
        ? `연장·야간·휴일·연차수당을 포함한 포괄임금 (환산시급 ${formatCurrency(Math.round(breakdown.hourlyWage))})`
        : `소정근로에 대한 고정급 (환산시급 ${formatCurrency(Math.round(breakdown.hourlyWage))}), 연장·야간·휴일·연차수당 별도 지급`,
    ]);
  }
  wageRows.push([
    wage.payType === "MONTHLY" ? "기본급" : "기본급(월 환산)",
    formatCurrency(breakdown.baseSalary),
    `월 기본근로 ${Math.round(breakdown.monthlyStandardHours)}시간(주휴수당 포함)`,
  ]);
  for (const a of wage.nonTaxableAllowances) {
    wageRows.push([a.name || "비과세 항목", formatCurrency(a.amount), "비과세"]);
  }
  if (breakdown.monthlyOvertimeHours > 0) {
    wageRows.push([
      "고정연장근로수당",
      formatCurrency(breakdown.overtimeAllowanceAmount),
      `월 약 ${breakdown.monthlyOvertimeHours.toFixed(1)}시간(1주 ${breakdown.weeklyOvertimeHours.toFixed(1)}시간)의 고정연장근로시간`,
    ]);
  }
  if (breakdown.monthlyNightHours > 0) {
    wageRows.push([
      "고정야간근로수당",
      formatCurrency(breakdown.nightAllowanceAmount),
      `월 약 ${breakdown.monthlyNightHours.toFixed(1)}시간(22:00~06:00)의 고정야간근로시간`,
    ]);
  }
  if (wage.holidayWorkAllowance.enabled) {
    wageRows.push([
      "휴일근무수당",
      formatCurrency(breakdown.holidayAllowanceAmount),
      `월 ${wage.holidayWorkAllowance.hoursPerMonth}시간의 고정휴일근로시간`,
    ]);
  }
  if (wage.annualLeaveAllowance.enabled) {
    wageRows.push([
      "연차수당",
      formatCurrency(breakdown.annualLeaveAllowanceAmount),
      `연차휴가미사용수당 선지급분(${wage.annualLeaveAllowance.hoursPerMonth}시간)`,
    ]);
  }
  wageRows.push([
    wage.payType === "MONTHLY" ? "월 지급액" : "예상 월 지급액(참고용)",
    formatCurrency(breakdown.totalMonthlyPay),
    "",
  ]);

  const wageClauses = [
    wage.payType === "HOURLY"
      ? "임금은 시급제로 하며, 실제 근로시간을 기준으로 계산하여 지급한다. 위 예상 월 지급액은 참고용이며 실제 지급액은 그 달의 실근로시간에 따라 달라질 수 있다."
      : wage.payType === "DAILY"
        ? wage.isInclusiveWage
          ? "임금은 일급제로 하며, 연장·야간·휴일·연차수당을 포함한 포괄임금으로 일당을 정한다. 위 예상 월 지급액은 참고용이며 실제 지급액은 그 달의 실근로일수에 따라 달라질 수 있다."
          : "임금은 일급제로 하며, 일당은 소정근로에 대한 고정급으로 정하고 연장·야간·휴일·연차수당은 이와 별도로 산정하여 추가 지급한다."
        : wage.isInclusiveWage
          ? "임금은 월급제로 하며, 위 임금총액에는 연장·야간·휴일·연차수당이 포함되어 있다."
          : "임금은 월급제로 하며, 위 표의 기본급 외 연장·야간·휴일·연차수당은 이와 별도로 산정하여 추가 지급한다.",
    `임금은 세전금액에서 법정세금 등을 원천징수하여 ${wage.payDay || ""}에 지급하며, 지급방법은 ${
      wage.payMethod || ""
    }으로 한다. 다만 지급일이 휴(무)일 또는 공휴일과 중복되는 경우 그 이후 첫 소정근로일에 지급할 수 있다.`,
    "근로자가 해당월에 중도 입사·퇴직하거나 결근하는 등 근태사고가 발생하는 경우 당해 월 지급액을 일할계산(공제)하여 지급한다.",
    ...(breakdown.premiumMultiplier === 1 &&
    (breakdown.monthlyOvertimeHours > 0 || breakdown.monthlyNightHours > 0 || wage.holidayWorkAllowance.enabled)
      ? [
          "본 사업장은 상시근로자 5인 미만으로 근로기준법 제56조에 따른 연장·야간·휴일근로 가산수당(50%)이 적용되지 아니하며, 통상임금을 기준으로 계산하여 지급한다.",
        ]
      : []),
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>근로계약서</Text>
        <Text style={styles.titleNote}>
          {businessInfo.businessName || ""}(이하 &quot;사업주&quot;라 함)와(과){" "}
          {businessInfo.workerName || ""}(이하 &quot;근로자&quot;라 함)은(는) 다음과
          같이 근로계약을 체결한다.
        </Text>

        <View style={{ marginTop: 10 }}>
          <ArticleRow number={1} title="당사자" first>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={{ flex: 1 }}>
                <PartyBox
                  title="사업주 (갑)"
                  rows={[
                    { label: "상호", value: businessInfo.businessName },
                    { label: "주소", value: businessInfo.businessAddress },
                    { label: "대표자", value: businessInfo.representativeName },
                    { label: "연락처", value: businessInfo.businessPhone },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PartyBox
                  title="근로자 (을)"
                  rows={[
                    { label: "성명", value: businessInfo.workerName },
                    { label: "성별", value: formatGender(businessInfo.workerGender) },
                    { label: "주소", value: businessInfo.workerAddress },
                    { label: "생년월일", value: businessInfo.workerBirthDate },
                    { label: "연락처", value: businessInfo.workerPhone },
                  ]}
                />
              </View>
            </View>
          </ArticleRow>

          <ArticleRow number={2} title="담당업무">
            <View style={styles.kvTable}>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>담당업무</Text>
                <Text style={styles.kvValue}>{businessInfo.jobDescription || ""}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>근무장소</Text>
                <Text style={styles.kvValue}>{businessInfo.workLocation || ""}</Text>
              </View>
            </View>
            <Text style={{ marginTop: 4, fontSize: 7.5, color: "#64748b" }}>
              사업주는 업무상 필요에 의해 근로자의 근무장소, 담당업무를 변경할 수 있다.
            </Text>
          </ArticleRow>

          <ArticleRow number={3} title="근로계약기간">
            <Text>
              {nb(businessInfo.contractStartDate) || ""}부터{" "}
              {businessInfo.contractEndDate ? `${nb(businessInfo.contractEndDate)}까지` : "기간의 정함 없음"}
            </Text>
          </ArticleRow>

          <ArticleRow number={4} title="수습기간">
            {probation.applicable ? (
              <ClauseList
                items={[
                  `입사일부터 ${probation.months}개월을 수습기간으로 한다(${
                    nb(businessInfo.contractStartDate) || ""
                  }부터 ${nb(probationEndDate) || ""}까지).`,
                  "수습기간 종료 시 수습기간 중의 근태, 근무성적, 동료와의 관계성, 업무숙련도 등을 고려하여 본채용 여부를 결정한다.",
                  `사업주는 근로자에게 수습기간 동안 정규임금의 ${probation.wagePercent}%에 해당하는 임금을 지급할 수 있다. 다만 최저임금액의 90% 이상을 지급한다.`,
                ]}
              />
            ) : (
              <Text>수습기간을 적용하지 아니한다.</Text>
            )}
          </ArticleRow>

          <ArticleRow number={5} title="임금">
            <SimpleTable headers={["구분", "금액", "비고"]} rows={wageRows} />
            <View style={{ marginTop: 5 }}>
              <ClauseList items={wageClauses} />
            </View>
          </ArticleRow>

          <ArticleRow number={6} title="근로시간">
            <Text>{clauseText}</Text>
            {scheduleTable && (
              <SimpleTable headers={scheduleTable.headers} rows={scheduleTable.rows} />
            )}
            {breakTimes.length > 0 && (
              <View style={{ marginTop: 4 }}>
                {breakTimes.map((bt) => (
                  <Text key={bt.id} style={{ fontSize: 8 }}>
                    · {formatBreakTime(bt)}
                  </Text>
                ))}
              </View>
            )}
            <Text style={{ marginTop: 5, fontSize: 8, color: "#1d4ed8" }}>
              근무시간에서 휴게시간을 제외하여 자동 계산한 소정근로시간 —{" "}
              {breakdown.hasUniformDailyHours ? `1일 ${formatHoursMinutes(breakdown.dailyRawHours)} · ` : ""}
              1주 {formatHoursMinutes(breakdown.weeklyHours)}
            </Text>
            <View style={{ marginTop: 5 }}>
              <ClauseList
                items={[
                  "근로자의 근로일과 근로시간은 위와 같되, 사업장의 업무 형편에 따라 근로자와 협의하여 변경할 수 있다.",
                  "휴게시간은 위와 같고, 사업장의 질서를 해치지 않는 범위에서 근로자가 자유롭게 사용할 수 있다.",
                  "근로자는 연장·야간·휴일근무를 하는 것에 동의한다.",
                ]}
              />
            </View>
          </ArticleRow>

          <ArticleRow number={7} title="휴일">
            <ClauseList items={getHolidayClause(businessInfo.fiveOrMoreEmployees)} />
          </ArticleRow>

          <ArticleRow number={8} title="휴가 및 휴직">
            <ClauseList
              items={getVacationClause(wage.annualLeaveAllowance.enabled, businessInfo.fiveOrMoreEmployees)}
            />
            {!wage.annualLeaveAllowance.enabled && (
              <Text style={{ marginTop: 4 }}>
                {annualLeave.basis === "LEGAL"
                  ? "그 밖의 연차유급휴가에 관한 사항은 근로기준법에서 정하는 바에 따른다."
                  : annualLeave.customDetail || ""}
              </Text>
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
          <View style={styles.sectionEnd} />
        </View>

        <Text style={{ marginTop: 8, fontSize: 8 }}>
          사회보험 적용여부: {activeInsurances.length > 0 ? activeInsurances.join(", ") : "해당 없음"}
        </Text>

        <View style={{ marginTop: 14 }} wrap={false}>
          <Text style={{ textAlign: "center", fontSize: 8.5, marginBottom: 10 }}>
            계약 당사자인 근로자와 사업주는 위와 같이 근로계약을 체결하며, 상호 성실히 이행할 것을
            서약한다.
          </Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={{ flex: 1, fontSize: 8 }}>
              <Text style={{ fontWeight: 700, marginBottom: 3 }}>사업주 (갑)</Text>
              <Text>상호: {businessInfo.businessName || ""}</Text>
              <Text>주소: {businessInfo.businessAddress || ""}</Text>
              <Text>대표자: {businessInfo.representativeName || ""} (인)</Text>
            </View>
            <View style={{ flex: 1, fontSize: 8 }}>
              <Text style={{ fontWeight: 700, marginBottom: 3 }}>근로자 (을)</Text>
              <Text>성명: {businessInfo.workerName || ""} (서명)</Text>
              <Text>주소: {businessInfo.workerAddress || ""}</Text>
              <Text>생년월일: {businessInfo.workerBirthDate || ""}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
