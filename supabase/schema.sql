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

-- 사업장 구분 없이 만들어졌던 기존 테스트 데이터는 정리한다.
delete from employees where business_id is null;

comment on table businesses is '사업자등록번호로 조회/등록되는 사업장(고객사) 단위.';
comment on table employees is '사업장(businesses)에 속한 직원 현황표. 근로계약서/임금명세서 자동입력에 재사용된다.';
