-- 사업장(회사) 테이블. 사업자등록번호로 조회/구분한다.
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_registration_number text not null unique,
  business_name text,
  representative_name text,
  business_address text,
  business_phone text,
  five_or_more_employees boolean not null default true
);

-- 직원 현황표 테이블. 이제 사업장별로 분리된다.
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  worker_name text not null,
  worker_gender text,
  worker_birth_date date,
  worker_address text,
  worker_phone text,
  job_description text,
  work_location text,
  contract_start_date date,
  contract_end_date date,

  employment_pattern jsonb,
  break_times jsonb,
  wage jsonb,
  five_or_more_employees boolean not null default true,

  note text
);

alter table employees add column if not exists business_id uuid references businesses(id) on delete cascade;
alter table employees add column if not exists worker_gender text check (worker_gender in ('M', 'F'));

-- 사업장 구분 없이 만들어졌던 기존 테스트 데이터는 정리한다.
delete from employees where business_id is null;

-- 결제/승인 완료 여부. true인 사업장만 저장 문서의 인쇄·출력이 가능하다.
alter table businesses add column if not exists approved boolean not null default false;
alter table businesses add column if not exists approved_at timestamptz;

-- 체험판에서 정식 이용을 신청한 문의 목록. 텔레그램으로 실시간 알림이 간다.
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_registration_number text,
  business_name text,
  contact_name text,
  contact_phone text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

comment on table businesses is '사업자등록번호로 조회/등록되는 사업장(고객사) 단위.';
comment on table employees is '사업장(businesses)에 속한 직원 현황표. 근로계약서/임금명세서 자동입력에 재사용된다.';
comment on column businesses.approved is '결제/승인 완료 여부. true인 사업장만 저장문서 인쇄·출력이 가능하다.';
comment on table inquiries is '체험판에서 정식 이용을 신청한 문의 목록. 텔레그램으로 실시간 알림이 간다.';

-- 실계정 인증 도입: 익명 세션(승인 전)과 이메일+비밀번호 계정(승인 후)이 같은 auth.users.id를
-- 공유한다. owner_id가 RLS의 소유권 판단 기준이 된다.
alter table businesses add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table businesses add column if not exists email text;
create index if not exists businesses_owner_id_idx on businesses(owner_id);

-- RLS만으로는 "행 소유자가 자기 행을 수정할 수 있다"는 정책 자체가 approved/owner_id 컬럼까지
-- 자유롭게 바꾸는 걸 막지 못한다 — 이 트리거로 service role(관리자 전용 경로)이 아닌 모든
-- 쓰기에서 approved/approved_at/owner_id를 강제로 이전 값(또는 false/null)으로 되돌린다.
create or replace function prevent_business_owner_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() <> 'service_role' then
    if tg_op = 'INSERT' then
      new.approved := false;
      new.approved_at := null;
    elsif tg_op = 'UPDATE' then
      new.approved := old.approved;
      new.approved_at := old.approved_at;
      new.owner_id := old.owner_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists businesses_prevent_escalation on businesses;
create trigger businesses_prevent_escalation
before insert or update on businesses
for each row execute function prevent_business_owner_escalation();

-- RLS: 승인 전(익명 포함)에도 실제 보안을 건다. 관리자 전용 경로는 service role 키를 써서
-- 아래 정책과 무관하게 항상 전체 접근 가능하다(lib/supabase/adminClient.ts).
-- 주의: Supabase 익명 인증은 Postgres role이 'anon'이 아니라 'authenticated'로 발급된다
-- (is_anonymous 클레임만 다름) — 그래서 정책 대상은 anon이 아니라 authenticated로 잡는다.
alter table businesses enable row level security;
alter table employees enable row level security;
alter table inquiries enable row level security;

create policy businesses_select_own on businesses
  for select to authenticated using (owner_id = auth.uid());
create policy businesses_insert_own on businesses
  for insert to authenticated with check (owner_id = auth.uid());
create policy businesses_update_own on businesses
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
-- delete 정책 없음 = 삭제는 관리자(service role)만 가능

create policy employees_select_own on employees
  for select to authenticated using (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_id = auth.uid())
  );
create policy employees_insert_own on employees
  for insert to authenticated with check (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_id = auth.uid())
  );
create policy employees_update_own on employees
  for update to authenticated using (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_id = auth.uid())
  );
create policy employees_delete_own on employees
  for delete to authenticated using (
    exists (select 1 from businesses b where b.id = employees.business_id and b.owner_id = auth.uid())
  );

-- inquiries: 누구나(로그인 없이도) 문의를 남길 수 있어야 하므로 insert만 공개. 조회/상태변경은
-- 관리자(service role, lib/inquiries/adminStore.ts)로만 가능 — select/update 정책이 없다.
create policy inquiries_insert_public on inquiries
  for insert to anon, authenticated with check (true);
