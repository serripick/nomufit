import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { RetirementSettlementData } from "@/components/documents/RetirementSettlementDoc";
import { formatCurrency } from "@/lib/contract-templates/format";
import { styles as pageStyles } from "@/lib/pdf/primitives";
import { docStyles, DocTitle } from "@/lib/pdf/docGrid";
import { nb } from "@/lib/pdf/primitives";

export function RetirementSettlementPdf({ data }: { data: RetirementSettlementData }) {
  return (
    <Document>
      <Page size="A4" style={pageStyles.page}>
        <DocTitle>퇴직 정산 확인서</DocTitle>

        <Text style={docStyles.paragraph}>
          {data.businessName || ""} 대표 {data.representativeName || ""}
          과(와) (이하 &quot;사업주&quot;라고 한다)와 {data.workerName || ""}(이하 &quot;직원&quot;이라고
          한다)는 다음과 같이 합의하고 이에 각자의 책임과 의무를 명확히 하기 위하여 본 확인서를 작성한다.
        </Text>

        <Text style={[docStyles.centerNote, { fontWeight: 700 }]}>-  다     음  -</Text>

        <View style={{ marginTop: 8 }}>
          <Text style={docStyles.numberedItem}>
            1. 합의 금액 : <Text style={{ fontWeight: 700 }}>{formatCurrency(data.settlementAmount)}</Text>
          </Text>
          <Text style={docStyles.numberedItem}>2. 지급일정 : {data.paymentDate || ""}</Text>
          <Text style={docStyles.numberedItem}>
            3. 수령방법 : {data.paymentMethod}
            {data.paymentMethod === "계좌이체" &&
              ` (은행: ${data.bankName || ""} / 계좌번호: ${data.accountNumber || ""} / 예금주: ${data.accountHolder || ""})`}
          </Text>
          <Text style={[docStyles.numberedItem, { fontWeight: 700 }]}>4. 합의내용</Text>
          <Text style={docStyles.numberedItem}>
            가. &quot;직원&quot;은 상기금액을 지급받음으로써 입사한 {nb(data.hireDate) || ""}로부터 퇴사한{" "}
            {nb(data.resignationDate) || ""}까지 발생한 퇴직금 및 일체의 근로관련 모든 법적 제수당 금액에
            대해 모두 정산받았음을 확인한다. (법적 제수당은 기본, 연장, 주휴수당, 연차수당이다)
          </Text>
          <Text style={docStyles.numberedItem}>
            나. &quot;직원&quot;은 &quot;사업주&quot;가 의무사항을 이행하는 한 지급받은 합의금액에 대하여
            사업주를 상대로 관계기관에 진정, 이의신청 및 민·형사상 이의제기를 하지 않는다.
          </Text>
          <Text style={docStyles.numberedItem}>
            다. &quot;사업주&quot;와 &quot;직원&quot;은 합의금액에 약속했으며 양당사자 중 일방이 본
            합의내용에 위반하는 경우 본 합의서에 정한 금액의 2배액을 합의 상대방에게 위약금으로 지급한다.
          </Text>
          <Text style={docStyles.numberedItem}>
            라. &quot;직원&quot;은 &quot;사업주&quot;와 &quot;직원&quot;간의 합의내용에 대해 타인에게
            누설하지 않고 절대 비밀로 하며, 특히 합의내용 일체에 대하여 &quot;사업주&quot;의 사업장
            전·현직 매장직원 누구에게도 발설하지 않을 것이며, 제3자(동료 근로자 포함)의
            &quot;사업주&quot;에 대한 법적 분쟁에 어떠한 형식으로든 관여하지 않을 것임을 확인한다.
          </Text>
          <Text style={docStyles.numberedItem}>
            마. &quot;직원&quot;과 &quot;사업주&quot;의 근로관계는 {nb(data.resignationDate) || ""}부로
            종료한다.
          </Text>
          <Text style={docStyles.numberedItem}>
            5. &quot;사업주&quot;와 &quot;직원&quot;은 본 합의의 성립을 증명하기 위하여 합의서 2부를
            작성하여 각각 기명날인하고 1부씩 보관한다.
          </Text>
        </View>

        <Text style={docStyles.centerNote}>{data.agreementDate || "20     년      월      일"}</Text>

        <View style={docStyles.signRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8.5 }}>생년월일 : {data.workerBirthDate || ""}</Text>
            <Text style={{ fontSize: 8.5 }}>직위/근무장소 : {data.position || ""}</Text>
            <Text style={{ fontSize: 8.5, marginTop: 4 }}>
              &apos;직원&apos; : {data.workerName || ""} (인)
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8.5 }}>
              &apos;사업주&apos; : {data.representativeName || ""} (인)
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
