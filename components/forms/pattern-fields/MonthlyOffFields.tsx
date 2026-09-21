import { MonthlyOffData } from "@/lib/contract-templates/types";
import { FieldLabel, NumberInput, TextInput, TimeInput } from "../fields";

export function MonthlyOffFields({
  data,
  onChange,
}: {
  data: MonthlyOffData;
  onChange: (data: MonthlyOffData) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>출근 시각</FieldLabel>
          <TimeInput
            value={data.shiftStartTime}
            onChange={(e) => onChange({ ...data, shiftStartTime: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>퇴근 시각</FieldLabel>
          <TimeInput
            value={data.shiftEndTime}
            onChange={(e) => onChange({ ...data, shiftEndTime: e.target.value })}
          />
        </div>
      </div>
      <div>
        <FieldLabel>월 휴무일 수</FieldLabel>
        <NumberInput
          value={data.restDaysPerMonth}
          min={1}
          max={31}
          onChange={(e) => onChange({ ...data, restDaysPerMonth: Number(e.target.value) })}
        />
      </div>
      <div>
        <FieldLabel>근무표 작성/고지 방법</FieldLabel>
        <TextInput
          value={data.schedulingMethod}
          onChange={(e) => onChange({ ...data, schedulingMethod: e.target.value })}
        />
      </div>
    </>
  );
}
