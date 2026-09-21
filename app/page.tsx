import { AppShell, LogoMark } from "@/components/layout/AppShell";

const CARDS = [
  {
    href: "/apply",
    title: "근로계약서",
    description: "사업장·근무조건을 입력하면 12개 조항의 표준 근로계약서가 자동으로 완성됩니다.",
  },
  {
    href: "/payslip",
    title: "임금대장",
    description: "직원 현황표에서 선택만 하면 4대보험·소득세까지 반영된 임금명세서가 나옵니다.",
  },
  {
    href: "/subsidies",
    title: "고용지원금",
    description: "근로자의 나이·계약형태를 기준으로 받을 수 있는 고용지원금을 결과지로 확인합니다.",
  },
  {
    href: "/forms",
    title: "노무서식",
    description: "사직서·재직증명서 등 자주 쓰는 노무 서식을 사업자정보 자동입력으로 바로 출력합니다.",
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <LogoMark size={48} />
          </div>
          <p className="mt-4 text-sm font-semibold text-green-600">사업장의 노무, 딱 맞게.</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-4xl">
            복잡한 노무 업무,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              노무핏
            </span>{" "}
            하나로 충분합니다.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            근로계약서부터 임금대장·고용지원금·노무서식까지, 사업장 정보 한 번의 입력으로
            자동 완성하세요.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/apply"
              className="rounded-full bg-gradient-to-r from-blue-600 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              지금 시작하기 →
            </a>
            <a
              href="/forms"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              노무서식 보기
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-400" />
              <p className="mt-3 text-base font-bold text-slate-900">{card.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{card.description}</p>
              <p className="mt-3 text-sm font-semibold text-blue-600 group-hover:underline">
                바로가기 →
              </p>
            </a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
