import { ContractPatternModule, MonthlyOffData } from "../types";
import { formatTimeRange } from "../format";

export const monthlyOffModule: ContractPatternModule<MonthlyOffData> = {
  label: "교대 근무 (월 단위 휴무일수, 근무표에 따름)",
  createDefault: () => ({
    type: "MONTHLY_OFF",
    shiftStartTime: "09:00",
    shiftEndTime: "18:00",
    restDaysPerMonth: 6,
    schedulingMethod: "매월 근무표를 작성하여 전월 말일까지 근로자에게 고지한다.",
  }),
  renderClauseText: (data) => {
    return `근무시간은 ${formatTimeRange(
      data.shiftStartTime,
      data.shiftEndTime
    )}로 하며, 휴무일은 월 ${data.restDaysPerMonth}일로 한다. ${data.schedulingMethod}`;
  },
  renderScheduleTable: () => null,
};
