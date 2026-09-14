-- ==========================================================================
-- Mortgage POC - Supabase Schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> paste this entire file -> Run)
-- ==========================================================================

-- ---------- Borrowers (Borrower Information) ----------
create table if not exists borrowers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  middle_name text,
  last_name text not null,
  email text not null,
  phone_number text not null,
  dob date not null,
  ssn text not null,
  gender text not null,
  gender_specify text,
  marital_status text,
  has_co_borrower boolean default false,
  co_borrower jsonb,
  employment_status text,
  borrower_status text not null default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Properties (Property Details) ----------
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  property_name text not null,
  street_address text not null,
  address_line2 text,
  city text not null,
  state text not null,
  county text not null,
  zip_code text not null,
  owner_contact_number text,
  property_status text default 'Active',
  occupancy_status text,
  amount text not null,
  property_type text,
  occupancy_type text,
  loan_purpose text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Loans (Loan Details) ----------
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  loan_number text not null,
  loan_type text not null,
  lien_position text,
  next_payment_due_date date,
  original_loan_amount text not null,
  investor text not null,
  loan_payment_duration text not null,
  loan_maturity_date date,
  last_payment_date date,
  unpaid_principal_balance text not null,
  loan_status text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Documents (Document Details) ----------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  document_name text not null,
  document_type text not null,
  document_sub_type text not null,
  document_number text,
  document_date date,
  document_description text,
  document_status text not null,
  file_name text not null,
  file_path text,
  file_size_bytes bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Applicants (Applicant Profile / Personal Details) ----------
create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),

  first_name text not null,
  middle_name text,
  last_name text not null,
  gender text not null,
  gender_specify text,
  dob date not null,
  marital_status text not null,
  nationality text not null,
  photo_file_name text,
  photo_file_path text,

  email text not null,
  phone_number text not null,
  alternate_phone_number text,
  emergency_contact_name text not null,
  emergency_contact_relationship text not null,
  emergency_contact_number text not null,

  current_address_line1 text not null,
  current_address_line2 text,
  current_city text not null,
  current_state text not null,
  current_county text not null,
  current_zip_code text not null,

  same_as_current_address boolean default false,
  permanent_address_line1 text,
  permanent_address_line2 text,
  permanent_city text,
  permanent_state text,
  permanent_county text,
  permanent_zip_code text,

  drivers_license_number text,
  drivers_license_state text,
  passport_number text,
  passport_expiry_date date,

  employer_name text not null,
  employer_address text,
  employer_phone_number text,
  job_title text not null,
  employment_status text not null,
  employment_type text not null,
  years_at_current_job text not null,
  monthly_salary text not null,
  annual_income text,
  other_income_source text,
  other_income_amount text,

  number_of_dependents text default '0',
  spouse_name text,
  spouse_employment_status text,
  spouse_income text,

  preferred_language text not null,
  preferred_communication_method text not null,
  preferred_contact_time text,
  preferred_nickname text,
  additional_notes text,

  agreement_confirmed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================================================
-- Row Level Security
-- POC-level policies: allow the anon (public) role full read/write access.
-- NOTE: this is intentionally permissive for a proof-of-concept with no
-- real authentication tied to Supabase. Before any real deployment beyond
-- a POC, replace these with policies scoped to an authenticated user.
-- ==========================================================================

alter table borrowers enable row level security;
alter table properties enable row level security;
alter table loans enable row level security;
alter table documents enable row level security;
alter table applicants enable row level security;

create policy "POC allow all - borrowers" on borrowers for all using (true) with check (true);
create policy "POC allow all - properties" on properties for all using (true) with check (true);
create policy "POC allow all - loans" on loans for all using (true) with check (true);
create policy "POC allow all - documents" on documents for all using (true) with check (true);
create policy "POC allow all - applicants" on applicants for all using (true) with check (true);

-- ==========================================================================
-- Storage buckets for file uploads (Document Details file, Applicant photo)
-- Run this section too - creates two public buckets.
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('applicant-photos', 'applicant-photos', true)
on conflict (id) do nothing;

create policy "POC public read - documents bucket"
  on storage.objects for select using (bucket_id = 'documents');
create policy "POC public insert - documents bucket"
  on storage.objects for insert with check (bucket_id = 'documents');
create policy "POC public update - documents bucket"
  on storage.objects for update using (bucket_id = 'documents');
create policy "POC public delete - documents bucket"
  on storage.objects for delete using (bucket_id = 'documents');

create policy "POC public read - photos bucket"
  on storage.objects for select using (bucket_id = 'applicant-photos');
create policy "POC public insert - photos bucket"
  on storage.objects for insert with check (bucket_id = 'applicant-photos');
create policy "POC public update - photos bucket"
  on storage.objects for update using (bucket_id = 'applicant-photos');
create policy "POC public delete - photos bucket"
  on storage.objects for delete using (bucket_id = 'applicant-photos');
