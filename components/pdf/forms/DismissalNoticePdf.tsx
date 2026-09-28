import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { DismissalNoticeData } from "@/components/documents/DismissalNoticeDoc";
import { styles as pageStyles } from "@/lib/pdf/primitives";
import { docStyles, DocTitle, DocTable } from "@/lib/pdf/docGrid";

export function DismissalNoticePdf({ data }: { data: DismissalNoticeData }) {
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <DocTitle>해고[예고] 서면 통보서</DocTitle>

        <DocTable
          rows={[
            [
              { label: "사업장명", value: data.businessName || "" },
              { label: "직원명", value: data.workerName },
            ],
            [
              { label: "생년월일", value: data.workerBirthDate },
              { label: "종사업무", value: data.position },
            ],
          ]}
        />

        <Text style={docStyles.paragraph}>
          위 직원은 아래와 같이 해고[예고]되므로 근로기준법 제26조 및 제27조에 의거하여 30일 전에
          서면통보합니다.
        </Text>

        <DocTable
          rows={[
            [{ label: "해고사유", value: data.reason, span: 2 }],
            [
              { label: "해고일자", value: data.dismissalDate },
              { label: "전달일자", value: data.noticeDate },
            ],
            [
              {
                label: "내용",
                value:
                  "위 사유로 인하여 위에 명시된 일자에 직원과 사업주와의 근로관계가 종료되기에 해고 예고를 <서면통지> 하오니 남은 기간동안 업무에 만전을 기하여 주시고, 취업을 위해 필요한 시간은 사업주의 승인을 얻은 후에 할애 받으시기 바랍니다.",
                span: 2,
              },
            ],
          ]}
        />

        <Text style={{ marginTop: 10, fontSize: 8.5 }}>발신 : {data.businessAddress || ""}</Text>
        <Text style={{ marginTop: 2, fontSize: 8.5 }}>
          발신 : {data.businessName || ""} 대표 {data.representativeName || ""} (서명/인)
        </Text>

        <Text style={docStyles.centerNote}>{data.noticeDate || "20     년      월      일"}</Text>

        <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: "#94a3b8", borderStyle: "dashed", paddingTop: 14 }}>
          <Text style={{ textAlign: "center", fontSize: 7, color: "#94a3b8" }}>- 절취선 -</Text>
          <DocTitle>해고[예고] 통보서 수령확인증</DocTitle>
          <Text style={{ marginTop: 10, fontSize: 8.5 }}>해고 예고 통보서를 수령하였음을 확인합니다.</Text>
          <Text style={docStyles.centerNote}>{data.noticeDate || "20     년      월      일"}</Text>
          <Text style={{ marginTop: 10, textAlign: "right", fontSize: 8.5 }}>
            위 수령인 : {data.workerName || ""} (서명/인)
          </Text>
          <Text style={[docStyles.centerNote, { fontWeight: 700 }]}>
            {data.businessName || ""} 대표 귀중
          </Text>
        </View>
      </Page>
    </Document>
  );
}
