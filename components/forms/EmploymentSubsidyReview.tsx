import { useState } from "react";
import { reviewEmploymentSubsidies } from "@/lib/contract-templates/subsidyReview";

export function EmploymentSubsidyReview({
  workerName,
  workerBirthDate,
  contractStartDate,
  contractEndDate,
}: {
  workerName: string;
  workerBirthDate: string;
  contractStartDate: string;
  contractEndDate: string | null;
}) {
  const [isVulnerableGroup, setIsVulnerableGroup] = useState(false);
  const [isPreferentialRegion, setIsPreferentialRegion] = useState(false);

  const results = reviewEmploymentSubsidies({
    birthDate: workerBirthDate,
    hireDate: contractStartDate,
    isFixedTerm: !!contractEndDate,
    isVulnerableGroup,
    isPreferentialRegion,
  });
  const matched = results.filter((r) => r.verdict === "가능성 있음");

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        현재 입력된 근로자의 생년월일·채용일·계약형태를 기준으로, 대표적인 고용지원금 4종
        (청년일자리도약장려금, 정규직 전환 지원금, 고용촉진장려금, 시니어인턴십) 중 해당 가능성이
        있는 항목만 결과지로 뽑아드립니다.
      </p>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isVulnerableGroup}
            onChange={(e) => setIsVulnerableGroup(e.target.checked)}
          />
          장애인·여성가장 등 취업취약계층 해당
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPreferentialRegion}
            onChange={(e) => setIsPreferentialRegion(e.target.checked)}
          />
          수도권 외 우대지역 사업장
        </label>
      </div>

      {matched.length === 0 ? (
        <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-500">
          현재 입력된 정보 기준으로는 해당되는 고용지원금이 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-300">
          <div className="border-b border-slate-300 bg-slate-100 px-4 py-2">
            <p className="text-sm font-bold text-slate-900">고용지원금 검토 결과지</p>
            <p className="text-xs text-slate-500">
              대상 근로자: {workerName || "미입력"} / 채용일: {contractStartDate || "미입력"}
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {matched.map((r) => (
              <div key={r.name} className="px-4 py-3 text-xs">
                <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                <p className="mt-1 text-slate-700">판정 근거: {r.reason}</p>
                <p className="mt-1 text-slate-700">지원수준: {r.amountDescription}</p>
                <p className="mt-1 text-slate-500">비고: {r.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="rounded-md bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
        위 결과지는 나이·계약형태 등 기본 정보만으로 계산한 1차 참고용 스크리닝입니다. 사업장
        규모(우선지원대상기업 여부), 예산 소진 상황, 인원 한도 등 정확한 자격요건은 반드시
        고용24(work24.go.kr) 또는 노무사 등 전문가 상담을 통해 확인하시기 바랍니다.
      </p>
    </div>
  );
}
