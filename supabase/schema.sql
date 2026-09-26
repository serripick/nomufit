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
