import { WeeklyScheduleData } from "@/lib/contract-templates/types";
import { WeekScheduleTable } from "./WeekScheduleTable";

export function WeeklyScheduleFields({
  data,
  onChange,
}: {
  data: WeeklyScheduleData;
  onChange: (data: WeeklyScheduleData) => void;
}) {
  return (
    <WeekScheduleTable
      schedule={data.schedule}
      onChange={(schedule) => onChange({ ...data, schedule })}
    />
  );
}
