import { ReactNode } from "react";

export function FieldLabel({ children, error }: { children: ReactNode; error?: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {children}
      {error && <span className="ml-2 text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 " +
        (props.className ?? "")
      }
    />
  );
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const timeSelectClass =
  "rounded-md border border-slate-300 bg-white px-1.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500";

/** 24시간제 시:분 선택 컴포넌트. 오전/오후 표기 없이 00~23시로만 표시한다. */
export function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
}) {
  const [h, m] = (value ?? "").split(":");

  const emit = (hh: string, mm: string) => {
    if (hh !== "" && mm !== "") onChange?.({ target: { value: `${hh}:${mm}` } });
  };

  return (
    <div className="flex items-center gap-1">
      <select
        className={timeSelectClass}
        value={h ?? ""}
        disabled={disabled}
        onChange={(e) => emit(e.target.value, m || "00")}
      >
        <option value="">--</option>
        {HOURS_24.map((hh) => (
          <option key={hh} value={hh}>
            {hh}시
          </option>
        ))}
      </select>
      <select
        className={timeSelectClass}
        value={m ?? ""}
        disabled={disabled}
        onChange={(e) => emit(h || "00", e.target.value)}
      >
        <option value="">--</option>
        {MINUTES_5.map((mm) => (
          <option key={mm} value={mm}>
            {mm}분
          </option>
        ))}
      </select>
    </div>
  );
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput type="number" {...props} />;
}

export function CurrencyInput({
  value,
  onChange,
  ...rest
}: {
  value: number;
  onChange: (value: number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const display = value ? value.toLocaleString("ko-KR") : "";
  return (
    <TextInput
      {...rest}
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^0-9]/g, "");
        onChange(digits === "" ? 0 : Number(digits));
      }}
    />
  );
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function WeekdayCheckboxGroup({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (days: string[]) => void;
}) {
  const days: { value: string; label: string }[] = [
    { value: "MON", label: "월" },
    { value: "TUE", label: "화" },
    { value: "WED", label: "수" },
    { value: "THU", label: "목" },
    { value: "FRI", label: "금" },
    { value: "SAT", label: "토" },
    { value: "SUN", label: "일" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((d) => {
        const checked = selected.includes(d.value);
        return (
          <button
            type="button"
            key={d.value}
            onClick={() => {
              if (checked) {
                onChange(selected.filter((s) => s !== d.value));
              } else {
                onChange([...selected, d.value]);
              }
            }}
            className={
              "h-9 w-9 rounded-full text-sm font-medium transition " +
              (checked
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
