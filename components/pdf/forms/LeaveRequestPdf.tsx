import { Document, Page, Text } from "@react-pdf/renderer";
import type { LeaveRequestData } from "@/components/documents/LeaveRequestDoc";
import { styles as pageStyles } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocTable, DocParagraph } from "@/lib/pdf/docGrid";

const LEAVE_TYPES = ["연차휴가", "하기휴가", "경조휴가", "특별휴가", "공가", "병가", "포상휴가", "기타"] as const;

function dayCount(start: string, end: string): number | null {
  const s = new Date(start);
  const e = new Date(end || start);
  if (!start || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function LeaveRequestPdf({ data }: { data: LeaveRequestData }) {
  const days = dayCount(data.startDate, data.endDate);

  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <DocTitle>휴 가 신 청 서</DocTitle>
        <DocTable
          rows={[
            [
              { label: "사업장명", value: data.businessName || "" },
              { label: "직원명", value: data.workerName },
            ],
            [{ label: "비상연락처", value: data.contact, span: 2 }],
            [
              {
                label: "휴가 기간",
                value: `${data.startDate || ""} 부터 ${data.endDate || data.startDate || ""} 까지${
                  days !== null ? ` (${days}일간)` : ""
                }`,
                span: 2,
              },
            ],
            [
              {
                label: "휴가의 종류",
                value: LEAVE_TYPES.map((t) => (t === data.leaveType ? `[${t}]` : t)).join("  "),
                span: 2,
              },
            ],
            [{ label: "특이사항", value: data.note, span: 2 }],
          ]}
        />

        <DocParagraph>상기 본인은 위와 같이 휴가를 신청하오니 허락하여 주시기 바랍니다.</DocParagraph>

        <Text style={docStyles.centerNote}>{data.applyDate || "20     년      월      일"}</Text>

        <Text style={{ marginTop: 12, textAlign: "right", fontSize: 8.5 }}>
          직원 : {data.workerName || ""} (서명/인)
        </Text>
        <Text style={{ marginTop: 3, textAlign: "right", fontSize: 8.5 }}>
          사업주 : {data.representativeName || ""} (서명/인)
        </Text>

        <Text style={[docStyles.centerNote, { fontWeight: 700 }]}>
          {data.businessName || ""} 대표귀중
        </Text>
      </Page>
    </Document>
  );
}
