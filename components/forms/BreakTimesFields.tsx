import { BreakTimeEntry } from "@/lib/contract-templates/types";
import { createBreakTimeId } from "@/lib/contract-templates/defaults";
import { FieldLabel, NumberInput, TimeInput } from "./fields";

const TYPE_LABEL: Record<BreakTimeEntry["type"], string> = {
  REST: "휴게시간",
  BREAK: "브레이크타임",
};

export function BreakTimesFields({
  data,
  onChange,
}: {
  data: BreakTimeEntry[];
  onChange: (data: BreakTimeEntry[]) => void;
}) {
  return (
    <div className="space-y-3">
      {data.map((entry, index) => {
        const update = (patch: Partial<BreakTimeEntry>) => {
          const next = [...data];
          next[index] = { ...entry, ...patch };
          onChange(next);
        };
        return (
          <div key={entry.id} className="space-y-2 rounded-md bg-slate-50 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <FieldLabel>구분</FieldLabel>
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={entry.type}
                  onChange={(e) => update({ type: e.target.value as BreakTimeEntry["type"] })}
                >
                  <option value="REST">{TYPE_LABEL.REST}</option>
                  <option value="BREAK">{TYPE_LABEL.BREAK}</option>
                </select>
              </div>
              <div>
                <FieldLabel>사용 방식</FieldLabel>
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={entry.mode}
                  onChange={(e) => update({ mode: e.target.value as BreakTimeEntry["mode"] })}
                >
                  <option value="FIXED">고정 시간</option>
                  <option value="FLEXIBLE">자율 사용 (시간만 지정)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => onChange(data.filter((_, i) => i !== index))}
                className="ml-auto rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>

            {entry.mode === "FIXED" ? (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <FieldLabel>시작</FieldLabel>
                  <TimeInput
                    value={entry.startTime}
                    onChange={(e) => update({ startTime: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>종료</FieldLabel>
                  <TimeInput
                    value={entry.endTime}
                    onChange={(e) => update({ endTime: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-28">
                  <FieldLabel>1회당 시간(분)</FieldLabel>
                  <NumberInput
                    min={0}
                    value={entry.durationMinutes}
                    onChange={(e) => update({ durationMinutes: Number(e.target.value) })}
                  />
                </div>
                <div className="w-24">
                  <FieldLabel>횟수</FieldLabel>
                  <NumberInput
                    min={0}
                    value={entry.count}
                    onChange={(e) => update({ count: Number(e.target.value) })}
                  />
                </div>
                <p className="pb-2 text-xs text-slate-500">
                  총 {entry.durationMinutes * entry.count}분, 정해진 시각 없이 근로자가 근무시간
                  중 자율적으로 사용
                </p>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...data,
            {
              id: createBreakTimeId(),
              type: "REST",
              mode: "FIXED",
              startTime: "12:00",
              endTime: "13:00",
              durationMinutes: 30,
              count: 1,
            },
          ])
        }
        className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
      >
        + 휴게시간/브레이크타임 추가
      </button>
    </div>
  );
}
