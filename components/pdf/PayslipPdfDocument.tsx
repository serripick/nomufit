import { Document, Page, View, Text } from "@react-pdf/renderer";
import { WageBreakdown } from "@/lib/contract-templates/wage-calc";
import { PayslipDeductions } from "@/lib/contract-templates/payslipCalc";
import { formatCurrency } from "@/lib/contract-templates/format";
import { EmployeeRecord } from "@/lib/employees/types";
import { styles } from "@/lib/pdf/primitives";

function Row({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <View style={[styles.tr, emphasis ? { backgroundColor: "#f8fafc" } : {}]}>
      <Text style={[styles.td, emphasis ? { fontWeight: 700 } : {}]}>{label}</Text>
      <Text style={[styles.td, { textAlign: "right" }, emphasis ? { fontWeight: 700 } : {}]}>{value}</Text>
    </View>
  );
}

export function PayslipPdfDocument({
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
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 7.5, color: "#94a3b8" }}>[별지 제17호의2 서식]</Text>
        <Text style={[styles.title, { marginTop: 2 }]}>임 금 명 세 서</Text>
        <Text style={{ textAlign: "right", fontSize: 8.5, color: "#475569", marginTop: 4 }}>
          지급일: {payYear}년 {payMonth}월 {payDay}일
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 4 }}>
          <Text style={{ width: "50%", fontSize: 8.5 }}>성명: {employee.workerName || ""}</Text>
          <Text style={{ width: "50%", fontSize: 8.5 }}>
            생년월일: {employee.workerBirthDate || ""}
          </Text>
          <Text style={{ width: "50%", fontSize: 8.5 }}>연락처: {employee.workerPhone || ""}</Text>
          <Text style={{ width: "50%", fontSize: 8.5 }}>
            담당업무: {employee.jobDescription || ""}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ backgroundColor: "#f1f5f9", padding: 4, fontSize: 8.5, fontWeight: 700 }}>
              지 급
            </Text>
            <View style={styles.table}>
              <Row label="기본급" value={formatCurrency(breakdown.baseSalary)} />
              {breakdown.monthlyOvertimeHours > 0 && (
                <Row label="연장근로수당" value={formatCurrency(breakdown.overtimeAllowanceAmount)} />
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
                <Row
                  key={a.id}
                  label={`${a.name || "비과세 항목"} (비과세)`}
                  value={formatCurrency(a.amount)}
                />
              ))}
              <Row label="지급액 계" value={formatCurrency(breakdown.totalMonthlyPay)} emphasis />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ backgroundColor: "#f1f5f9", padding: 4, fontSize: 8.5, fontWeight: 700 }}>
              공 제
            </Text>
            <View style={styles.table}>
              <Row label="국민연금" value={formatCurrency(deductions.nationalPension)} />
              <Row label="건강보험" value={formatCurrency(deductions.healthInsurance)} />
              <Row label="장기요양보험" value={formatCurrency(deductions.longTermCare)} />
              <Row label="고용보험" value={formatCurrency(deductions.employmentInsurance)} />
              <Row label="근로소득세" value={formatCurrency(deductions.incomeTax)} />
              <Row label="지방소득세" value={formatCurrency(deductions.localIncomeTax)} />
              {deductions.dormitoryDeduction > 0 && (
                <Row label="숙박비" value={formatCurrency(deductions.dormitoryDeduction)} />
              )}
              <Row label="공제액 계" value={formatCurrency(deductions.totalDeduction)} emphasis />
            </View>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", marginTop: 12 }}>
          <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 8.5, color: "#1d4ed8" }}>
              실수령액 <Text style={{ fontSize: 11, fontWeight: 700 }}>{formatCurrency(netPay)}</Text>
            </Text>
          </View>
        </View>

        <Text style={{ marginTop: 14, fontSize: 7.5, color: "#64748b", lineHeight: 1.7 }}>
          · 위 임금명세서는 한달간 정상 근무 시에 해당되는 명세입니다.{"\n"}· 근로일자, 근로시간 등이
          변경되었을 경우에는 근로계약서에 명시된 내용대로 가감하여 계산합니다.{"\n"}· 근로소득세는
          국세청 간이세액표를 조회하여 직접 입력한 금액이며, 지방소득세는 그 10%로 자동 계산되었습니다.
        </Text>
      </Page>
    </Document>
  );
}
