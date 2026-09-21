import { useState } from "react";
import { formatBusinessRegistrationNumber } from "@/lib/contract-templates/inputFormatters";
import { createBusiness, findBusinessByRegistrationNumber } from "@/lib/businesses/store";
import { BusinessRecord } from "@/lib/businesses/types";
import { setStoredBusinessRegNumber } from "@/lib/businesses/currentBusiness";
import { FieldLabel, TextInput } from "./fields";

export function BusinessGate({
  onBusinessLoaded,
}: {
  onBusinessLoaded: (business: BusinessRecord) => void;
}) {
  const [regNumber, setRegNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "not_found" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    if (regNumber.length < 12) return; // "000-00-00000" 형식 완성 전
    setStatus("searching");
    try {
      const found = await findBusinessByRegistrationNumber(regNumber);
      if (found) {
        setStoredBusinessRegNumber(regNumber);
        onBusinessLoaded(found);
      } else {
        setStatus("not_found");
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "조회 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const handleRegisterNew = async () => {
    setStatus("searching");
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
      setErrorMessage(e instanceof Error ? e.message : "등록 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-md py-16">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">사업장 조회</h2>
        <p className="mt-1 text-sm text-slate-500">
          사업자등록번호를 입력하면 해당 사업장의 정보와 직원 현황표를 불러옵니다. 처음
          이용하시는 사업장이라면 새로 등록해드립니다.
        </p>

        <div className="mt-4">
          <FieldLabel>사업자등록번호</FieldLabel>
          <TextInput
            value={regNumber}
            placeholder="326-87-03180"
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

        {status === "not_found" ? (
          <div className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="mb-2">등록되지 않은 사업자등록번호입니다.</p>
            <button
              type="button"
              onClick={handleRegisterNew}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              이 번호로 새 사업장 등록하기
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSearch}
            disabled={regNumber.length < 12 || status === "searching"}
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "searching" ? "조회 중..." : "조회"}
          </button>
        )}
      </div>
    </div>
  );
}
