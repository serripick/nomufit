import { Document, Page, Text } from "@react-pdf/renderer";
import type { ResignationLetterData } from "@/components/documents/ResignationLetterDoc";
import { styles as pageStyles } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocTable, DocParagraph, DocNumberedList } from "@/lib/pdf/docGrid";

const RETIREMENT_TYPES = ["이직", "건강", "가사", "결혼", "권고", "정년", "진학", "기타"] as const;

export function ResignationLetterPdf({ data }: { data: ResignationLetterData }) {
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <DocTitle>사 직 서</DocTitle>
        <DocTable
          rows={[
            [
              { label: "사업장명", value: data.businessName || "(사업장명 미입력)" },
              { label: "직원명", value: data.workerName },
            ],
            [
              { label: "근무장소", value: data.workLocation },
              { label: "연락처", value: data.phone },
            ],
            [
              { label: "연락주소", value: data.address },
              { label: "입사일자", value: data.hireDate },
            ],
            [
              { label: "사직일자", value: data.resignationDate },
              {
                label: "퇴사구분",
                value: RETIREMENT_TYPES.map((t) => (t === data.retirementType ? `[${t}]` : t)).join("  "),
              },
            ],
            [{ label: "퇴사사유", value: data.reason, span: 2 }],
          ]}
        />

        <DocParagraph>
          상기 본인은 위와 같은 사유로 인하여 사직하고자 하오니 속히 처리하여 주시기 바랍니다. 아울러 회사
          내 퇴직규정에 관련된 사항을 준수할 것을 서약합니다.
        </DocParagraph>

        <Text style={[docStyles.numberedItem, { marginTop: 10, fontWeight: 700 }]}>▣ 준수사항</Text>
        <DocNumberedList
          items={[
            "본인은 퇴직에 따른 업무 인수인계를 철저히 하여 퇴사 시까지 직무책임과 의무를 다하겠습니다.",
            "재직 시 업무상 취득한 회사의 제반 기밀 사항을 타인에게 일체 누설하지 않겠습니다.",
            "차용금, 근무복, 회사 비품 등 반환물건(금품)은 퇴직일 전일까지 반환하겠습니다.",
            "만일 본인이 상기 사항을 위반하였을 때에는 이유 여하를 막론하고 민/형사상의 책임과 손해배상 의무를 지겠습니다.",
            "기타 회사와 관련한 제반 사항은 회사규정에 의거 퇴직일 전일까지 처리하겠습니다.",
          ]}
        />

        <DocParagraph>본인은 이러한 사직이 본인의 자유의사에 따라 실행되는 것임을 다시 확인합니다.</DocParagraph>

        <Text style={docStyles.centerNote}>{data.writtenDate || "20     년      월      일"}</Text>
        <Text style={{ marginTop: 10, textAlign: "right", fontSize: 8.5 }}>
          직원 : {data.workerName || "미입력"} (서명/인)
        </Text>
        <Text style={[docStyles.centerNote, { fontWeight: 700 }]}>
          {data.businessName || "(사업장명 미입력)"} 대표귀중
        </Text>
      </Page>
    </Document>
  );
}
