import { Document, Page, Text } from "@react-pdf/renderer";
import type { EmploymentCertificateData } from "@/components/documents/EmploymentCertificateDoc";
import { styles as pageStyles } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocTable, DocParagraph } from "@/lib/pdf/docGrid";

export function EmploymentCertificatePdf({ data }: { data: EmploymentCertificateData }) {
  const b = data.business;
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <DocTitle>재 직 증 명 서</DocTitle>
        <DocTable
          rows={[
            [{ label: "증명서번호", value: `${b.businessName || ""} ${data.certNumber || ""}`, span: 2 }],
            [
              { label: "성명", value: data.workerName },
              { label: "생년월일", value: data.birthDate },
            ],
            [{ label: "주소", value: data.address, span: 2 }],
            [
              { label: "근로장소", value: data.workLocation },
              { label: "연락처", value: data.phone },
            ],
            [
              {
                label: "입사일자",
                value: `${data.hireDate || ""} 부터 ${data.asOfDate || "현재"}까지`,
                span: 2,
              },
            ],
            [
              { label: "용도", value: data.purpose },
              { label: "발급부수", value: `${data.copies}부` },
            ],
          ]}
        />
        <DocParagraph>위 사실과 다름없이 재직하고 있음을 확인합니다.</DocParagraph>
        <Text style={docStyles.centerNote}>{data.issueDate || "20     년      월      일"}</Text>
        <Text style={[docStyles.centerNote, { fontWeight: 700, fontSize: 11 }]}>
          {b.businessName || ""}    대표  {b.representativeName || ""}  (인)
        </Text>
        <Text style={{ marginTop: 16, fontSize: 7.5, color: "#64748b", lineHeight: 1.8 }}>
          주소 : {b.businessAddress || ""}
          {"\n"}전화 : {b.businessPhone || ""}
          {"\n"}사업자번호 : {b.businessRegistrationNumber || ""}
        </Text>
      </Page>
    </Document>
  );
}
