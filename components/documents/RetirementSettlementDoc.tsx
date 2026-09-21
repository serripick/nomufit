import { useState } from "react";
import { CurrencyInput, FieldLabel, TextInput } from "@/components/forms/fields";
import { formatCurrency } from "@/lib/contract-templates/format";
import { EmployeeRecord } from "@/lib/employees/types";
import { DocShell, DocTitle } from "./DocGrid";

type PaymentMethod = "현금" | "계좌이체";

export interface RetirementSettlementData {
  businessName: string;
  representativeName: string;
  workerName: string;
  workerBirthDate: string;
  position: string;
  settlementAmount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  hireDate: string;
  resignationDate: string;
  agreementDate: string;
}

export function RetirementSettlementForm({
  businessName,
  representativeName,
  employees,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  employees: EmployeeRecord[];
  onDataChange: (data: RetirementSettlementData) => void;
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerBirthDate, setWorkerBirthDate] = useState("");
  const [position, setPosition] = useState("");
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("계좌이체");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [resignationDate, setResignationDate] = useState("");
  const [agreementDate, setAgreementDate] = useState("");

  const emit = (patch: Partial<RetirementSettlementData>) => {
    onDataChange({
      businessName,
      representativeName,
      workerName,
      workerBirthDate,
      position,
      settlementAmount,
      paymentDate,
      paymentMethod,
      bankName,
      accountNumber,
      accountHolder,
      hireDate,
      resignationDate,
      agreementDate,
      ...patch,
    });
  };

  const loadEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      setWorkerName(emp.workerName);
      setWorkerBirthDate(emp.workerBirthDate);
      setPosition(emp.jobDescription);
      setHireDate(emp.contractStartDate);
      emit({
        workerName: emp.workerName,
        workerBirthDate: emp.workerBirthDate,
        position: emp.jobDescription,
        hireDate: emp.contractStartDate,
      });
    }
  };

  return (
    <div className="space-y-4">
      {employees.length > 0 && (
        <div>
          <FieldLabel>직원 현황표에서 불러오기 (선택)</FieldLabel>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedEmployeeId}
            onChange={(e) => loadEmployee(e.target.value)}
          >
            <option value="">직접 입력</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.workerName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>직원명</FieldLabel>
          <TextInput
            value={workerName}
            onChange={(e) => {
              setWorkerName(e.target.value);
              emit({ workerName: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>생년월일</FieldLabel>
          <TextInput
            type="date"
            value={workerBirthDate}
            onChange={(e) => {
              setWorkerBirthDate(e.target.value);
              emit({ workerBirthDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>직위/근무장소</FieldLabel>
          <TextInput
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
              emit({ position: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>합의 금액 (원)</FieldLabel>
          <CurrencyInput
            value={settlementAmount}
            onChange={(v) => {
              setSettlementAmount(v);
              emit({ settlementAmount: v });
            }}
          />
        </div>
        <div>
          <FieldLabel>지급일정</FieldLabel>
          <TextInput
            type="date"
            value={paymentDate}
            onChange={(e) => {
              setPaymentDate(e.target.value);
              emit({ paymentDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>수령방법</FieldLabel>
          <div className="flex gap-4 pt-2">
            {(["현금", "계좌이체"] as PaymentMethod[]).map((m) => (
              <label key={m} className="flex items-center gap-1.5 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={paymentMethod === m}
                  onChange={() => {
                    setPaymentMethod(m);
                    emit({ paymentMethod: m });
                  }}
                />
                {m}
              </label>
            ))}
          </div>
        </div>
        {paymentMethod === "계좌이체" && (
          <>
            <div>
              <FieldLabel>은행</FieldLabel>
              <TextInput
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  emit({ bankName: e.target.value });
                }}
              />
            </div>
            <div>
              <FieldLabel>계좌번호</FieldLabel>
              <TextInput
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  emit({ accountNumber: e.target.value });
                }}
              />
            </div>
            <div>
              <FieldLabel>예금주</FieldLabel>
              <TextInput
                value={accountHolder}
                onChange={(e) => {
                  setAccountHolder(e.target.value);
                  emit({ accountHolder: e.target.value });
                }}
              />
            </div>
          </>
        )}
        <div>
          <FieldLabel>입사일</FieldLabel>
          <TextInput
            type="date"
            value={hireDate}
            onChange={(e) => {
              setHireDate(e.target.value);
              emit({ hireDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>퇴사(근로관계 종료)일</FieldLabel>
          <TextInput
            type="date"
            value={resignationDate}
            onChange={(e) => {
              setResignationDate(e.target.value);
              emit({ resignationDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>작성일</FieldLabel>
          <TextInput
            type="date"
            value={agreementDate}
            onChange={(e) => {
              setAgreementDate(e.target.value);
              emit({ agreementDate: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function RetirementSettlementPreview({ data }: { data: RetirementSettlementData }) {
  return (
    <DocShell>
      <DocTitle>퇴직 정산 확인서</DocTitle>

      <p className="mt-6 text-sm leading-relaxed print:mt-4 print:text-xs">
        {data.businessName || "(사업장명 미입력)"} 대표 {data.representativeName || "미입력"}
        과(와) (이하 &quot;사업주&quot;라고 한다)와 {data.workerName || "미입력"}
        (이하 &quot;직원&quot;이라고 한다)는 다음과 같이 합의하고 이에 각자의 책임과 의무를
        명확히 하기 위하여 본 확인서를 작성한다.
      </p>

      <p className="mt-4 text-center text-sm font-semibold print:mt-3 print:text-xs">
        - 다 &nbsp;&nbsp;&nbsp; 음 -
      </p>

      <div className="mt-4 space-y-3 text-sm leading-relaxed print:mt-3 print:text-xs">
        <p>
          1. 합의 금액 : <span className="font-semibold">{formatCurrency(data.settlementAmount)}</span>
        </p>
        <p>2. 지급일정 : {data.paymentDate || "미입력"}</p>
        <p>
          3. 수령방법 : {data.paymentMethod}
          {data.paymentMethod === "계좌이체" && (
            <span>
              {" "}
              (은행: {data.bankName || "미입력"} / 계좌번호: {data.accountNumber || "미입력"} /
              예금주: {data.accountHolder || "미입력"})
            </span>
          )}
        </p>

        <p className="font-semibold">4. 합의내용</p>
        <p>
          가. &quot;직원&quot;은 상기금액을 지급받음으로써 입사한 {data.hireDate || "미입력"}
          로부터 퇴사한 {data.resignationDate || "미입력"}까지 발생한 퇴직금 및 일체의
          근로관련 모든 법적 제수당 금액에 대해 모두 정산받았음을 확인한다. (법적 제수당은
          기본, 연장, 주휴수당, 연차수당이다)
        </p>
        <p>
          나. &quot;직원&quot;은 &quot;사업주&quot;가 의무사항을 이행하는 한 지급받은
          합의금액에 대하여 사업주를 상대로 관계기관에 진정, 이의신청 및 민·형사상
          이의제기를 하지 않는다.
        </p>
        <p>
          다. &quot;사업주&quot;와 &quot;직원&quot;은 합의금액에 약속했으며 양당사자 중 일방이
          본 합의내용에 위반하는 경우 본 합의서에 정한 금액의 2배액을 합의 상대방에게
          위약금으로 지급한다.
        </p>
        <p>
          라. &quot;직원&quot;은 &quot;사업주&quot;와 &quot;직원&quot;간의 합의내용에 대해
          타인에게 누설하지 않고 절대 비밀로 하며, 특히 합의내용 일체에 대하여
          &quot;사업주&quot;의 사업장 전·현직 매장직원 누구에게도 발설하지 않을 것이며, 제3자
          (동료 근로자 포함)의 &quot;사업주&quot;에 대한 법적 분쟁에 어떠한 형식으로든
          관여하지 않을 것임을 확인한다.
        </p>
        <p>
          마. &quot;직원&quot;과 &quot;사업주&quot;의 근로관계는{" "}
          {data.resignationDate || "미입력"}부로 종료한다.
        </p>
        <p>
          5. &quot;사업주&quot;와 &quot;직원&quot;은 본 합의의 성립을 증명하기 위하여
          합의서 2부를 작성하여 각각 기명날인하고 1부씩 보관한다.
        </p>
      </div>

      <p className="mt-6 text-center text-sm print:mt-4 print:text-xs">
        {data.agreementDate || "20     년      월      일"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 text-sm print:mt-4 print:text-xs">
        <div>
          <p>생년월일 : {data.workerBirthDate || "미입력"}</p>
          <p>직위/근무장소 : {data.position || "미입력"}</p>
          <p className="mt-2">&apos;직원&apos; : {data.workerName || "미입력"} (인)</p>
        </div>
        <div className="text-right">
          <p>&apos;사업주&apos; : {data.representativeName || "미입력"} (인)</p>
        </div>
      </div>
    </DocShell>
  );
}
