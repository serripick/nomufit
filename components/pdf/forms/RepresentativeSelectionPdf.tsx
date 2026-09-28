import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { RepresentativeSelectionData } from "@/components/documents/RepresentativeSelectionDoc";
import { padVoterRows } from "@/lib/documents/representativeSelection";
import { styles as pageStyles, SimpleTable, nb } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocParagraph } from "@/lib/pdf/docGrid";

export function RepresentativeSelectionPdf({ data }: { data: RepresentativeSelectionData }) {
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <Text style={{ textAlign: "right", fontSize: 7.5, color: "#94a3b8" }}>(5인 이상 사업장용)</Text>
        <DocTitle>직원 대표 선임서</DocTitle>

        <DocParagraph>
          직원 일동은 노사합의, 근로기준법 제62조 연차유급휴가의 대체와 관련하여 아래 직원을 근로자 대표로
          선출하여 포괄 위임합니다. 위임 기간은 {nb(data.termStart) || "미입력"}부터 {nb(data.termEnd) || "미입력"}까지로
          하되, 새로운 대표선정이 없으면 연임하는 것으로 한다.
        </DocParagraph>

        <Text style={[docStyles.centerNote, { fontWeight: 700 }]}>-  아     래  -</Text>

        <Text style={{ marginTop: 10, fontSize: 8.5 }}>
          직원대표 : <Text style={{ fontWeight: 700 }}>{data.repName || "미입력"}</Text> ( 생년월일 :{" "}
          {data.repBirthDate || "미입력"} )
        </Text>

        <View style={{ marginTop: 8 }}>
          <SimpleTable
            headers={["순서", "성명", "생년월일", "서명 날인"]}
            rows={padVoterRows(data.voters).map((v) => [String(v.index), v.name, v.birthDate, v.name ? "(인)" : ""])}
          />
        </View>

        <Text style={docStyles.centerNote}>{data.businessName || "(사업장명 미입력)"} 대표귀중</Text>
      </Page>
    </Document>
  );
}
