"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: HomeIcon },
  { href: "/apply", label: "근로계약서", icon: ContractIcon },
  { href: "/payslip", label: "임금대장", icon: WonIcon },
  { href: "/subsidies", label: "고용지원금", icon: GiftIcon },
  { href: "/forms", label: "노무서식", icon: FolderIcon },
];

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nomufitGradient" x1="4" y1="34" x2="36" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      {/* N 리본 형태 */}
      <path d="M6 34V6L12 12V34H6Z" fill="url(#nomufitGradient)" />
      <path d="M6 6H13L34 27V34H27L6 13V6Z" fill="url(#nomufitGradient)" fillOpacity="0.85" />
      <path d="M28 34V6H34V34H28Z" fill="url(#nomufitGradient)" />
      {/* 사람 아이콘 (N의 접힘 지점) */}
      <circle cx="20" cy="11" r="3.4" fill="white" />
      <path d="M14.5 22c0-3.6 2.9-6 5.5-6s5.5 2.4 5.5 6v2h-11v-2Z" fill="white" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11.5L12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M9 12h7M9 15.5h7M9 8.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function WonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8 10.5h8M8 13.5h8M9.2 8.5 12 15.5l2.8-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="10" width="16" height="9.5" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 10h16v3H4v-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v9.5M12 10c-1.8 0-3.5-1-3.5-2.8A2.2 2.2 0 0 1 12 5.5c0 1.4-1 4.5-1 4.5Zm0 0c1.8 0 3.5-1 3.5-2.8A2.2 2.2 0 0 0 12 5.5c0 1.4 1 4.5 1 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6.5A1 1 0 0 1 5 5.5h4.2l1.6 2H19a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
  variant,
}: {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => ReactNode;
  active: boolean;
  variant: "sidebar" | "bottom";
}) {
  if (variant === "bottom") {
    return (
      <a
        href={href}
        className={
          "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium " +
          (active ? "text-blue-600" : "text-slate-400")
        }
      >
        <Icon className="h-5 w-5" />
        {label}
      </a>
    );
  }
  return (
    <a
      href={href}
      className={
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
        (active
          ? "bg-gradient-to-r from-blue-50 to-green-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
      }
    >
      <Icon className="h-4.5 w-4.5" />
      {label}
    </a>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 print:hidden">
        <div className="flex h-14 items-center gap-2">
          <a href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-base font-extrabold tracking-tight text-slate-900">노무핏</span>
          </a>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-56 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-3 md:flex print:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={pathname === item.href}
              variant="sidebar"
            />
          ))}
        </aside>

        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white md:hidden print:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            Icon={item.icon}
            active={pathname === item.href}
            variant="bottom"
          />
        ))}
      </nav>
    </div>
  );
}

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 print:hidden">
      <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
