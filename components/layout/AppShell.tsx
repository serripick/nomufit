"use client";

import { ReactNode, useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: HomeIcon },
  { href: "/apply", label: "근로계약서", icon: ContractIcon },
  { href: "/payslip", label: "임금대장", icon: WonIcon },
  { href: "/subsidies", label: "고용지원금", icon: GiftIcon },
  { href: "/forms", label: "노무서식", icon: FolderIcon },
  { href: "/apply#calculator", label: "연차계산기", icon: LeaveIcon },
];

/** pathname은 해시(#)를 포함하지 않으므로, 현재 위치를 pathname+hash로 합쳐서 비교해야
 * "근로계약서"(/apply)와 "연차계산기"(/apply#calculator)가 서로 헷갈리지 않고 정확히 구분된다. */
function useCurrentPathWithHash(): string {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);
  return pathname + hash;
}

/** 관리자가 /admin에서 특정 사업장을 "열기"로 들어왔을 때(?adminBusinessId=...), 사이드바의
 * 일반 <Link>는 그 값을 모른 채 고정된 href로만 이동하므로 다른 메뉴를 클릭하는 순간 관리자
 * 열람 모드가 풀려버린다. useSearchParams()는 정적 렌더링 중인 다른 페이지들(로그인 등)에서
 * Suspense 없이 쓰면 빌드가 깨지므로, window.location만 직접 읽어 우회한다. */
function useAdminBusinessIdParam(pathname: string): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("adminBusinessId"));
  }, [pathname]);
  return id;
}

function withAdminParam(href: string, adminBusinessId: string | null): string {
  if (!adminBusinessId) return href;
  const [base, hash] = href.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}adminBusinessId=${adminBusinessId}${hash ? `#${hash}` : ""}`;
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="5" y="17" width="17" height="43" rx="8.5" fill="#102D53" />
      <path d="M5 25V21C5 13 14 9 20 15L52 43V60C48 61 45 59 41 55L19 34V25C19 18 11 17 5 25Z" fill="#102D53" />
      <path d="M44 29C44 18 61 18 61 29V51C61 59 54 63 47 58L39 51C44 52 44 45 44 41V29Z" fill="#02BFA8" />
      <circle cx="52.5" cy="10" r="7.5" fill="#02BFA8" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="노무핏 홈"><LogoMark size={48} /><span className="brand-word">노무<span>핏</span><small>NOMUFIT</small></span></Link>;
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

function LeaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="5" width="16" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.5 14.2 10.8 16.3 15.5 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

export function FeatureIcon({ index }: { index: number }) {
  const Icon = NAV_ITEMS[index]?.icon ?? HomeIcon;
  return <Icon className="nav-icon" />;
}

const SEARCH_ITEMS = [
  { href: "/apply", label: "근로계약서", detail: "근무조건 · 계약서 작성" },
  { href: "/payslip", label: "임금대장", detail: "급여 · 임금명세서" },
  { href: "/subsidies", label: "고용지원금", detail: "지원금 검토" },
  { href: "/forms", label: "노무서식", detail: "재직증명서 · 사직서 · 휴가 신청서 · 근로자명부" },
];

function WorkspaceSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const id = useId();
  const matches = SEARCH_ITEMS.filter((item) => `${item.label} ${item.detail}`.includes(query.trim()));
  return <div className="workspace-search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <form role="search" onSubmit={(event) => { event.preventDefault(); if (matches[0]) { router.push(matches[0].href); setOpen(false); } }}>
      <input aria-label="업무 및 서식 검색" aria-controls={id} placeholder="필요한 업무·서식을 검색해보세요." value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} />
      <button type="submit" aria-label="검색 결과로 이동" aria-expanded={open} aria-controls={id}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></button>
    </form>
    {open && <div id={id} className="search-results"><p>{query ? "검색 결과" : "빠른 업무 이동"}</p>{matches.length ? matches.map((item) => <Link href={item.href} key={item.href} onClick={() => { setOpen(false); setQuery(""); }}><strong>{item.label}</strong><span>{item.detail}</span><span aria-hidden="true">↗</span></Link>) : <div className="search-empty" role="status">일치하는 업무가 없습니다.<br />계약서, 급여, 재직증명서 등으로 검색해보세요.</div>}</div>}
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentPath = useCurrentPathWithHash();
  const adminBusinessId = useAdminBusinessIdParam(pathname);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">본문으로 바로가기</a>
      <header className="app-topbar print:hidden"><Brand /><p className="brand-tagline">사업장의 노무, <strong>딱 맞게.</strong></p><WorkspaceSearch /><Link href="/login" className="topbar-login">로그인</Link><Link href="/account" className="workspace-profile"><span className="profile-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3Z" /></svg></span><span>내 워크스페이스</span></Link></header>
      <aside className="app-sidebar print:hidden">
        <nav aria-label="주 메뉴" className="sidebar-nav">{NAV_ITEMS.map((item) => <Link href={withAdminParam(item.href, adminBusinessId)} key={item.href} aria-current={currentPath === item.href ? "page" : undefined} className={`sidebar-link ${currentPath === item.href ? "is-active" : ""}`}><item.icon className="nav-icon" /><span>{item.label}</span></Link>)}</nav>
        <div className="sidebar-bottom"><div className="sidebar-note"><h3>좋은 사람과<br />더 나은 회사를<br /><strong>노무핏</strong>이<br />함께합니다.</h3><div className="note-line" /></div><Link className="sidebar-help" href="/#faq-title">이용 가이드 <span aria-hidden="true">↗</span></Link><Link className="sidebar-help" href="/contact">이용문의 <span aria-hidden="true">↗</span></Link></div>
      </aside>
      <div className="app-body"><main id="main-content" className="app-main">{children}</main></div>
      <nav className="mobile-nav print:hidden" aria-label="모바일 주 메뉴">{NAV_ITEMS.map((item) => <Link key={item.href} href={withAdminParam(item.href, adminBusinessId)} aria-current={currentPath === item.href ? "page" : undefined} className={currentPath === item.href ? "is-active" : ""}><item.icon className="nav-icon" /><span>{item.label}</span></Link>)}</nav>
    </div>
  );
}

export function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className="page-heading print:hidden"><p className="eyebrow">NOMUFIT WORKSPACE</p><h1>{title}<span className="heading-dot">.</span></h1><p>{description}</p></div>;
}

