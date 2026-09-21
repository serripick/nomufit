import { BusinessInfo } from "@/lib/contract-templates/types";
import {
  formatBusinessRegistrationNumber,
  formatPhoneNumber,
} from "@/lib/contract-templates/inputFormatters";
import { FieldLabel, TextInput } from "./fields";

export function BusinessInfoFields({
  data,
  onChange,
}: {
  data: BusinessInfo;
  onChange: (data: BusinessInfo) => void;
}) {
  const isIndefinite = data.contractEndDate === null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>사업장명</FieldLabel>
          <TextInput
            value={data.businessName}
            onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>대표자명</FieldLabel>
          <TextInput
            value={data.representativeName}
            onChange={(e) => onChange({ ...data, representativeName: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>사업자등록번호</FieldLabel>
          <TextInput
            placeholder="326-87-03180"
            value={data.businessRegistrationNumber}
            onChange={(e) =>
              onChange({
                ...data,
                businessRegistrationNumber: formatBusinessRegistrationNumber(e.target.value),
              })
            }
          />
        </div>
        <div>
          <FieldLabel>사업장 주소</FieldLabel>
          <TextInput
            value={data.businessAddress}
            onChange={(e) => onChange({ ...data, businessAddress: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>사업장 연락처</FieldLabel>
          <TextInput
            placeholder="02-1234-5678"
            value={data.businessPhone}
            onChange={(e) =>
              onChange({ ...data, businessPhone: formatPhoneNumber(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="rounded-md bg-slate-50 p-4">
        <FieldLabel>상시근로자 수</FieldLabel>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              checked={data.fiveOrMoreEmployees}
              onChange={() => onChange({ ...data, fiveOrMoreEmployees: true })}
            />
            5인 이상
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              checked={!data.fiveOrMoreEmployees}
              onChange={() => onChange({ ...data, fiveOrMoreEmployees: false })}
            />
            5인 미만
          </label>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          연장·야간·휴일근로 가산수당(1.5배), 연차유급휴가 의무, 공휴일 유급화 여부가 사업장
          규모에 따라 달라집니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>근로자 성명</FieldLabel>
          <TextInput
            value={data.workerName}
            onChange={(e) => onChange({ ...data, workerName: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>근로자 생년월일</FieldLabel>
          <TextInput
            type="date"
            value={data.workerBirthDate}
            onChange={(e) => onChange({ ...data, workerBirthDate: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>근로자 주소</FieldLabel>
          <TextInput
            value={data.workerAddress}
            onChange={(e) => onChange({ ...data, workerAddress: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>근로자 연락처</FieldLabel>
          <TextInput
            placeholder="010-1234-5678"
            value={data.workerPhone}
            onChange={(e) => onChange({ ...data, workerPhone: formatPhoneNumber(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>근로계약 시작일</FieldLabel>
          <TextInput
            type="date"
            value={data.contractStartDate}
            onChange={(e) => onChange({ ...data, contractStartDate: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>근로계약 종료일</FieldLabel>
          <div className="flex items-center gap-2">
            <TextInput
              type="date"
              disabled={isIndefinite}
              value={data.contractEndDate ?? ""}
              onChange={(e) => onChange({ ...data, contractEndDate: e.target.value })}
            />
            <label className="flex shrink-0 items-center gap-1 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={isIndefinite}
                onChange={(e) =>
                  onChange({ ...data, contractEndDate: e.target.checked ? null : "" })
                }
              />
              기간의 정함 없음
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>근무장소</FieldLabel>
          <TextInput
            value={data.workLocation}
            onChange={(e) => onChange({ ...data, workLocation: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>업무내용</FieldLabel>
          <TextInput
            value={data.jobDescription}
            onChange={(e) => onChange({ ...data, jobDescription: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
