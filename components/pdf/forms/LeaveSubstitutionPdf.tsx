import { Document, Page, Text } from "@react-pdf/renderer";
import type { LeaveSubstitutionData } from "@/components/documents/LeaveSubstitutionDoc";
import { styles as pageStyles, SimpleTable, nb } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocParagraph } from "@/lib/pdf/docGrid";

export function LeaveSubstitutionPdf({ data }: { data: LeaveSubstitutionData }) {
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <Text style={{ textAlign: "right", fontSize: 7.5, color: "#94a3b8" }}>(5인 이상 사업장용)</Text>
        <DocTitle>연차유급휴가 대체사용 합의서</DocTitle>

        <Text style={[docStyles.numberedItem, { marginTop: 10, fontWeight: 700 }]}>1. 당사자</Text>
        <Text style={docStyles.numberedItem}>
          사 업 주 : {data.representativeName || ""}    직원 대표 : {data.repName || ""}
        </Text>

        <Text style={[docStyles.numberedItem, { marginTop: 10, fontWeight: 700 }]}>2. 합의 내용</Text>
        <Text style={[docStyles.numberedItem, { fontWeight: 700 }]}>제1조 [적용범위]</Text>
        <Text style={docStyles.numberedItem}>
          근로기준법이 정하는 유급휴가의 대체와 관련하여 회사와 직원 대표는 연차휴가 사용을 아래와 같이
          특정 근로일에 직원들이 휴무하는 경우에는 대체하는 것으로 합의합니다.
        </Text>

        <Text style={[docStyles.numberedItem, { fontWeight: 700 }]}>제2조 [대체일]</Text>
        <Text style={docStyles.numberedItem}>
          근로기준법 제60조에 의해 발생한 직원의 연차휴가를 다음과 같이 대체한다.
        </Text>

        <SimpleTable
          headers={["대체할 휴일", "휴일명", "대체 근로일(연차 사용)"]}
          rows={data.pairs.map((p) => [
            p.holidayDate || "",
            p.holidayName || "",
            p.replacementDate || "",
          ])}
        />

        <Text style={[docStyles.numberedItem, { marginTop: 8, fontWeight: 700 }]}>
          제3조 [초과 및 미달 일수의 처리]
        </Text>
        <Text style={docStyles.numberedItem}>
          ① 전조와 같이 연차 휴가를 대체하기로 하되 당해 연도의 휴가일수를 초과하여 휴가를 실시하게 되는
          직원은 임의 휴가를 부여한 것으로 간주한다.{"\n"}② 전조의 휴가일수를 초과하여 연차휴가가 발생하는
          직원은 취업규칙이 정한 바에 따라 잔여 휴가를 사용한다.
        </Text>

        <Text style={[docStyles.numberedItem, { fontWeight: 700 }]}>제4조 [유효기간]</Text>
        <Text style={docStyles.numberedItem}>
          본 합의서의 유효기간은 {nb(data.effectiveStart) || ""}부터 {nb(data.effectiveEnd) || ""}까지로
          한다.
        </Text>

        <DocParagraph>
          위 대체된 근로일은 근로자의 연차유급휴가를 사용한 것으로 처리하며, 대체된 휴일에는 정상적으로
          근로를 제공한다.
        </DocParagraph>

        <Text style={docStyles.centerNote}>20    년    월    일</Text>

        <Text style={{ marginTop: 12, fontSize: 8.5 }}>사업주(대표자): {data.representativeName || ""} (인)</Text>
        <Text style={{ marginTop: 4, fontSize: 8.5 }}>근로자대표: {data.repName || ""} (서명)</Text>
      </Page>
    </Document>
  );
}
