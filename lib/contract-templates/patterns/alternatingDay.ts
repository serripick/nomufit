import { AlternatingDayData, ContractPatternModule } from "../types";
import { formatTimeRange } from "../format";

export const alternatingDayModule: ContractPatternModule<AlternatingDayData> = {
  label: "격일 근무",
  createDefault: () => ({
    type: "ALTERNATING_DAY",
    workStartTime: "08:00",
    workEndTime: "08:00",
    crossesMidnight: true,
    cycleReferenceDate: new Date().toISOString().slice(0, 10),
  }),
  renderClauseText: (data) => {
    const timeText = data.crossesMidnight
      ? `${data.workStartTime}부터 다음날 ${data.workEndTime}까지`
      : formatTimeRange(data.workStartTime, data.workEndTime);
    return `근로일과 휴무일은 1일 단위로 교대하는 격일제로 하며, 근무시간은 ${timeText}로 한다. ${data.cycleReferenceDate}을(를) 근무일로 하여 이후 격일로 근로일과 휴무일이 반복된다.`;
  },
  renderScheduleTable: () => null,
};
