# 노무핏 (NomuFit)

사업장 정보와 근로조건을 입력하면 근로계약서·임금명세서·고용지원금 검토·노무서식을 자동으로 만들어주는 노무 관리 웹앱입니다.

## 주요 기능

- **근로계약서**: 근무패턴(주5일/6일, 격일, 격주, 요일별 상이 등)별 조건부 입력 → 표준근로계약서 자동 완성, 최저임금 미달 경고
- **임금대장**: 등록된 직원을 선택하면 2026년 요율 기준 4대보험료·소득세까지 반영한 임금명세서 자동 계산, 공제항목 수동 보정 가능
- **고용지원금**: 근로자의 나이·계약형태를 기준으로 청년일자리도약장려금, 정규직 전환 지원금, 고용촉진장려금, 시니어인턴십 등 4종 1차 스크리닝
- **노무서식**: 근로자명부, 재직증명서, 퇴직정산확인서, 근로자대표 선임서, 연차대체 합의서, 사직서, 휴가신청서, 해고예고통지서 등 8종을 사업자정보 자동입력으로 작성

사업장은 사업자등록번호로 구분되는 멀티테넌트 구조이며(현재는 클라이언트 로컬 저장 기준, 로그인/인증 미적용), 데이터는 Supabase(Postgres)에 저장됩니다.

## 기술 스택

- Next.js 16 (App Router) + TypeScript, Tailwind CSS v4
- Supabase (Postgres + PostgREST), `@supabase/supabase-js`
- Vercel 배포

## 로컬 개발

```bash
npm install
npm run dev
```

`.env.local`에 아래 두 값이 필요합니다 (Supabase 프로젝트 설정 > API에서 확인):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 배포 (Vercel)

- 프로젝트: `risingjaya7-4309/nomufit`
- URL: https://nomufit.vercel.app
- 재배포는 `/deploy` 스킬을 실행하거나 아래 명령어로 직접 실행합니다.

```bash
npx.cmd vercel deploy --prod --yes
```

Windows PowerShell에서 실행 정책 때문에 `npx`가 막히면 `npx.cmd`를 대신 사용합니다.

### 알아둘 점

- **Vercel Hobby(무료) 요금제는 약관상 비상업적 개인 용도로 제한**됩니다. 로그인·결제를 붙여 실제 유료 서비스로 오픈하는 시점에는 Pro 요금제(월 $20~)로 전환이 필요합니다.
- **Supabase 무료 프로젝트는 7일간 접속이 없으면 자동으로 일시정지**됩니다. 정지되면 사업장 조회 등 DB 기능이 에러가 나며, Supabase 대시보드에서 수동으로 "Restore"해야 복구됩니다.

## 다음 단계

- 로그인 / 인증 (현재 사업장 구분은 브라우저 로컬 저장 기준)
- 결제 시스템
- Supabase Row Level Security(RLS) 적용 (현재 미적용 — 배포 전 보안 검토 필요)
