import { Document, Page, Text } from "@react-pdf/renderer";
import type { WorkerRegisterData } from "@/components/documents/WorkerRegisterDoc";
import { styles as pageStyles } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocTable } from "@/lib/pdf/docGrid";

export function WorkerRegisterPdf({ data }: { data: WorkerRegisterData }) {
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <DocTitle>근로자 명부</DocTitle>
        <DocTable
          rows={[
            [
              { label: "① 성명", value: data.workerName },
              { label: "② 생년월일", value: data.birthDate },
            ],
            [{ label: "③ 주소", value: data.address, span: 2 }],
            [{ label: "핸드폰 번호", value: data.phone, span: 2 }],
            [
              { label: "④ 부양가족", value: `${data.dependents}명` },
              { label: "⑤ 종사업무", value: data.jobDescription },
            ],
            [{ label: "⑥ 기능 및 자격", value: data.qualification, span: 2 }],
            [{ label: "⑦ 최종학력", value: data.education, span: 2 }],
            [{ label: "⑧ 경력", value: data.career, span: 2 }],
            [{ label: "⑨ 병역", value: data.militaryService, span: 2 }],
            [
              { label: "⑩ 해고일", value: data.dismissalDate },
              { label: "⑪ 퇴직일", value: data.resignationDate },
            ],
            [
              { label: "⑫ 사유", value: data.resignationReason },
              { label: "⑬ 금품청산 등", value: data.clearance },
            ],
            [
              { label: "⑭ 고용일(계약기간)", value: data.hireDate },
              { label: "⑮ 근로계약갱신일", value: data.contractRenewalDate },
            ],
            [{ label: "<17> 특기사항", value: data.specialNotes || "(교육, 건강, 휴직 등)", span: 2 }],
          ]}
        />
        <Text style={docStyles.centerNote}>{data.businessName || ""} 대표귀중</Text>
      </Page>
    </Document>
  );
}
