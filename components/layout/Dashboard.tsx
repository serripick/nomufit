"use client";

import Link from "next/link";
import { FeatureIcon } from "@/components/layout/AppShell";

const features = [
  { href: "/apply", title: "근로계약서", description: "우리 사업장에 맞는\n근로계약서 작성", color: "blue" },
  { href: "/payslip", title: "임금대장", description: "급여 내역을\n쉽고 명확하게", color: "mint" },
  { href: "/subsidies", title: "고용지원금", description: "우리 회사가 검토할\n수 있는 지원금 찾기", color: "orange" },
  { href: "/forms", title: "노무서식", description: "필요한 서식을\n바로 작성", color: "pink" },
];

const faqs = [
  { tag: "시작", title: "처음 이용하는 사업장은 어떻게 시작하나요?", answer: "홈 화면의 '지금 시작하기'를 눌러 근로계약서 작성 화면으로 들어간 뒤, 사업장 정보와 직원 정보를 입력하세요. 로그인 없이도 바로 저장되고, 임금대장·고용지원금·노무서식 등 다른 메뉴에서 자동으로 그 정보를 불러와 사용합니다." },
  { tag: "연결", title: "사업장 정보를 매번 입력해야 하나요?", answer: "한 번 등록한 사업장 정보는 근로계약서, 임금대장, 고용지원금, 노무서식에서 자동으로 함께 사용됩니다. 정식 이용 승인을 받으면 이메일과 비밀번호를 설정해, 다른 기기에서도 로그인만으로 같은 사업장 정보를 이어서 쓸 수 있습니다." },
  { tag: "서식", title: "어떤 노무서식을 작성할 수 있나요?", answer: "근로자명부, 재직증명서, 퇴직 정산 확인서, 근로자대표 선임서, 연차유급휴가 대체 합의서, 사직서, 휴가 신청서, 해고예고통지서를 작성할 수 있습니다." },
];

function ServiceArtwork({ index }: { index: number }) {
  return <span className="service-artwork" aria-hidden="true"><span className="icon-back" /><span className="icon-front"><FeatureIcon index={index + 1} /></span></span>;
}

function HeroLaptop() {
  return (
    <svg viewBox="0 0 320 240" className="hero-laptop-art" aria-hidden="true">
      <ellipse cx="228" cy="72" rx="92" ry="72" fill="#e1f3ff" />
      <ellipse cx="86" cy="176" rx="76" ry="58" fill="#e1faf3" />
      <g transform="translate(22 118)">
        <rect x="0" y="46" width="32" height="20" rx="5" fill="#ffffff" stroke="#dbe7f4" />
        <path d="M16 46C16 18 -4 16 3 -2C12 16 16 26 16 46Z" fill="#93ddc6" />
        <path d="M16 46C16 10 32 6 27 -10C18 8 16 24 16 46Z" fill="#5fc8ac" />
      </g>
      <path d="M68 210 L252 210 L266 226 L54 226 Z" fill="#c9d5e4" />
      <rect x="68" y="205" width="184" height="7" rx="3.5" fill="#aebbcd" />
      <rect x="84" y="26" width="152" height="182" rx="12" fill="#102D53" />
      <rect x="93" y="35" width="134" height="164" rx="5" fill="#f4f9ff" />
      <g transform="translate(120 76) scale(1.34)">
        <rect x="5" y="17" width="17" height="43" rx="8.5" fill="#102D53" />
        <path d="M5 25V21C5 13 14 9 20 15L52 43V60C48 61 45 59 41 55L19 34V25C19 18 11 17 5 25Z" fill="#102D53" />
        <path d="M44 29C44 18 61 18 61 29V51C61 59 54 63 47 58L39 51C44 52 44 45 44 41V29Z" fill="#02BFA8" />
        <circle cx="52.5" cy="10" r="7.5" fill="#02BFA8" />
      </g>
    </svg>
  );
}

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p className="hero-label">사업장의 노무, <strong>딱 맞게.</strong></p>
          <h1 id="welcome-title">복잡한 노무 업무,<br /><span>노무핏</span> 하나로 충분합니다.</h1>
          <p className="hero-description">근로계약서부터 임금대장, 고용지원금, 노무서식까지<br className="desktop-break" /> 한 번의 입력으로 간편하게 이어가세요.</p>
          <div className="hero-actions"><Link href="/apply" className="primary-link">지금 시작하기 <span aria-hidden="true">→</span></Link><Link href="/contact" className="secondary-link">이용문의</Link></div>
          <ul className="hero-benefits"><li><span aria-hidden="true">✓</span>사업장 정보 연동</li><li><span aria-hidden="true">◷</span>반복 업무는 간결하게</li><li><span aria-hidden="true">▤</span>문서 미리보기·출력</li></ul>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <HeroLaptop />
        </div>
      </section>

      <section aria-label="업무 바로가기" className="services-section"><div className="service-grid">{features.map((item, index) => <Link href={item.href} key={item.href} className={`service-card ${item.color}`}><ServiceArtwork index={index} /><div className="service-copy"><h2>{item.title}</h2><p>{item.description}</p></div><span className="card-arrow" aria-hidden="true">›</span></Link>)}</div></section>

      <div className="dashboard-panels">
        <section className="faq-panel" aria-labelledby="faq-title"><div className="panel-heading"><h2 id="faq-title"><span className="announcement-icon" aria-hidden="true">◖</span> 이용 안내</h2></div><div className="faq-list">{faqs.map((faq) => <details key={faq.title}><summary><span className={`faq-tag tag-${faq.tag}`}>{faq.tag}</span><span>{faq.title}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>
        <section className="subsidy-banner"><div className="subsidy-copy"><span className="eyebrow">SUPPORT FOR YOUR BUSINESS</span><h2>지금, 우리 회사에 맞는<br />고용지원금을 확인해보세요.</h2><p>근로자의 고용조건을 바탕으로<br />검토할 수 있는 지원금을 안내합니다.</p><Link href="/subsidies" className="secondary-link">지원금 바로 확인 <span aria-hidden="true">→</span></Link></div><div className="subsidy-art" aria-hidden="true"><div className="support-orbit" /><div className="support-paper"><strong>고용지원금</strong><i /><i /><i /><i /></div><span className="support-check">✓</span><span className="support-spark">✦</span></div></section>
      </div>

      <footer className="dashboard-footer"><span>노무핏 · 사업장의 노무, 딱 맞게.</span><span>좋은 사람과 더 나은 회사를 위해.</span></footer>
    </div>
  );
}
