import { useState } from "react";
import { formatBusinessRegistrationNumber } from "@/lib/contract-templates/inputFormatters";
import { createBusiness } from "@/lib/businesses/store";
import { BusinessRecord } from "@/lib/businesses/types";
import { setStoredBusinessRegNumber } from "@/lib/businesses/currentBusiness";
import { FieldLabel, TextInput } from "./fields";

const DUPLICATE_REG_NUMBER_MESSAGE =
  "이미 등록된 사업자등록번호입니다. 최초 등록하신 브라우저로 다시 접속하시거나, 이용문의를 남겨주시면 확인해드리겠습니다.";

/** 보안 계정(RLS) 도입 이후에는 "타인 소유 사업장"과 "존재하지 않는 사업장"을 조회 결과로
 * 구분할 수 없다 — 둘 다 빈 결과로 돌아온다. 그래서 조회 단계 없이 바로 등록만 받고,
 * 이미 존재하는 번호면(유니크 제약 위반) 그 사실을 명확히 안내한다. */
export function BusinessGate({
  onBusinessLoaded,
}: {
  onBusinessLoaded: (business: BusinessRecord) => void;
}) {
  const [regNumber, setRegNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "registering" | "duplicate" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (regNumber.length < 12) return; // "000-00-00000" 형식 완성 전
    setStatus("registering");
    try {
      const created = await createBusiness({
        businessRegistrationNumber: regNumber,
        businessName: "",
        representativeName: "",
        businessAddress: "",
        businessPhone: "",
        fiveOrMoreEmployees: true,
      });
      setStoredBusinessRegNumber(regNumber);
      onBusinessLoaded(created);
    } catch (e) {
      const code = (e as { code?: string } | null)?.code;
      if (code === "23505") {
        setStatus("duplicate");
      } else {
        setErrorMessage(e instanceof Error ? e.message : "등록 중 오류가 발생했습니다.");
        setStatus("error");
      }
    }
  };

  return (
    <div className="business-gate">
      <div className="business-gate-card">
        <h2 className="text-lg font-semibold text-slate-900">사업장 등록</h2>
        <p className="mt-1 text-sm text-slate-500">
          사업자등록번호를 입력하면 이 브라우저에 사업장을 새로 등록하고, 직원 현황표를 바로
          관리할 수 있습니다.
        </p>

        <div className="mt-4">
          <FieldLabel>사업자등록번호</FieldLabel>
          <TextInput
            value={regNumber}
            placeholder="123-45-67890"
            onChange={(e) => {
              setStatus("idle");
              setRegNumber(formatBusinessRegistrationNumber(e.target.value));
            }}
          />
        </div>

        {status === "error" && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMessage}
          </p>
        )}

        {status === "duplicate" && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {DUPLICATE_REG_NUMBER_MESSAGE}
          </p>
        )}

        <button
          type="button"
          onClick={handleRegister}
          disabled={regNumber.length < 12 || status === "registering"}
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "registering" ? "등록 중..." : "사업장 등록하기"}
        </button>
      </div>
    </div>
  );
}
