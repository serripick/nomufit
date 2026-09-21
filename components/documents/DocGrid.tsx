import { ReactNode } from "react";

/** A4 용지 비율(210mm×297mm)에 맞춘 서식 미리보기 틀. 화면에서도 실제 인쇄 결과에 가깝게 보인다. */
export function DocShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[210mm] max-w-full rounded-lg border border-slate-300 bg-white px-12 py-10 text-slate-900 shadow-sm print:m-0 print:w-full print:max-w-none print:border-none print:px-8 print:py-6 print:shadow-none">
      {children}
    </div>
  );
}

export function DocTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-center text-2xl font-bold tracking-[0.2em] print:text-xl">{children}</h1>
  );
}

/** 라벨(회색 배경) + 값 셀 한 쌍. 여러 개를 이어붙여 한 행에 여러 필드를 배치한다. */
export function DocField({
  label,
  value,
  labelWidth = "18%",
  colSpan,
}: {
  label: string;
  value: ReactNode;
  labelWidth?: string;
  colSpan?: number;
}) {
  return (
    <>
      <td
        style={{ width: labelWidth }}
        className="border border-slate-400 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 print:px-2 print:py-1.5 print:text-xs"
      >
        {label}
      </td>
      <td
        colSpan={colSpan}
        className="border border-slate-400 px-3 py-2 text-sm text-slate-900 print:px-2 print:py-1.5 print:text-xs"
      >
        {value || ""}
      </td>
    </>
  );
}

export function DocTable({ children }: { children: ReactNode }) {
  return (
    <table className="mt-6 w-full table-fixed border-collapse border border-slate-400 print:mt-4">
      <tbody>{children}</tbody>
    </table>
  );
}

export function DocParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-sm leading-loose print:mt-4 print:text-xs print:leading-relaxed">
      {children}
    </p>
  );
}

export function DocNumberedList({ items }: { items: string[] }) {
  return (
    <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-800 print:text-xs">
      {items.map((t, i) => (
        <p key={i}>
          {i + 1}) {t}
        </p>
      ))}
    </div>
  );
}

export function DocSignatureRow({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-8 text-sm print:mt-6 print:text-xs">
      <div>{left}</div>
      <div className="text-right">{right}</div>
    </div>
  );
}
