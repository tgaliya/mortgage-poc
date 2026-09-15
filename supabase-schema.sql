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

-- ---------- Permissions (Administration / Manage Permissions) ----------
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  sub_module text not null,
  action text not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Roles (Administration / Manage Roles) ----------
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  role_name text not null,
  description text,
  status text not null default 'Active',
  -- Array of permissions.id - simpler than a join table for this POC.
  permission_ids uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Users (Administration / Manage Users) ----------
-- NOTE: password is stored as plain text. This app has no backend server
-- to hash it against (client talks to Supabase directly), so this is
-- POC-only - same spirit as the permissive RLS policies below. Do not
-- reuse this pattern beyond a proof-of-concept.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone_number text,
  password text not null,
  role_id uuid references roles(id),
  status text not null default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Activity Log (Borrower History / Document Audit Trail) ----------
-- Append-only: the app never updates or deletes rows here, even for admins.
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_name text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  entity_label text,
  created_at timestamptz default now()
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
alter table permissions enable row level security;
alter table roles enable row level security;
alter table users enable row level security;
alter table activity_log enable row level security;

create policy "POC allow all - borrowers" on borrowers for all using (true) with check (true);
create policy "POC allow all - properties" on properties for all using (true) with check (true);
create policy "POC allow all - loans" on loans for all using (true) with check (true);
create policy "POC allow all - documents" on documents for all using (true) with check (true);
create policy "POC allow all - applicants" on applicants for all using (true) with check (true);
create policy "POC allow all - permissions" on permissions for all using (true) with check (true);
create policy "POC allow all - roles" on roles for all using (true) with check (true);
create policy "POC allow all - users" on users for all using (true) with check (true);
create policy "POC allow all - activity_log" on activity_log for all using (true) with check (true);

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

-- ==========================================================================
-- Administration bootstrap seed data
-- Fixed ids are used (instead of gen_random_uuid()) purely so the role and
-- user rows below can reference the permission rows in the same script.
-- This is the ONLY way into the app once the login screen no longer has a
-- hardcoded credential: log in as the seeded admin below, then use
-- Manage Users to create real accounts for everyone else.
--   Admin login -> email: admin@outamation.com   password: Admin@123
-- ==========================================================================

-- 44 permissions: every sub-module x every action (View / Create / Edit / Delete)
insert into permissions (id, module, sub_module, action, name) values
  ('00000000-0000-0000-0000-000000000001', 'Dashboard', 'Dashboard', 'View', 'View Dashboard'),
  ('00000000-0000-0000-0000-000000000002', 'Dashboard', 'Dashboard', 'Create', 'Create Dashboard'),
  ('00000000-0000-0000-0000-000000000003', 'Dashboard', 'Dashboard', 'Edit', 'Edit Dashboard'),
  ('00000000-0000-0000-0000-000000000004', 'Dashboard', 'Dashboard', 'Delete', 'Delete Dashboard'),
  ('00000000-0000-0000-0000-000000000005', 'Borrower Details', 'Borrower Information', 'View', 'View Borrower Information'),
  ('00000000-0000-0000-0000-000000000006', 'Borrower Details', 'Borrower Information', 'Create', 'Create Borrower Information'),
  ('00000000-0000-0000-0000-000000000007', 'Borrower Details', 'Borrower Information', 'Edit', 'Edit Borrower Information'),
  ('00000000-0000-0000-0000-000000000008', 'Borrower Details', 'Borrower Information', 'Delete', 'Delete Borrower Information'),
  ('00000000-0000-0000-0000-000000000009', 'Borrower Details', 'Borrower History', 'View', 'View Borrower History'),
  ('00000000-0000-0000-0000-00000000000a', 'Borrower Details', 'Borrower History', 'Create', 'Create Borrower History'),
  ('00000000-0000-0000-0000-00000000000b', 'Borrower Details', 'Borrower History', 'Edit', 'Edit Borrower History'),
  ('00000000-0000-0000-0000-00000000000c', 'Borrower Details', 'Borrower History', 'Delete', 'Delete Borrower History'),
  ('00000000-0000-0000-0000-00000000000d', 'Property & Loan Details', 'Property Details', 'View', 'View Property Details'),
  ('00000000-0000-0000-0000-00000000000e', 'Property & Loan Details', 'Property Details', 'Create', 'Create Property Details'),
  ('00000000-0000-0000-0000-00000000000f', 'Property & Loan Details', 'Property Details', 'Edit', 'Edit Property Details'),
  ('00000000-0000-0000-0000-000000000010', 'Property & Loan Details', 'Property Details', 'Delete', 'Delete Property Details'),
  ('00000000-0000-0000-0000-000000000011', 'Property & Loan Details', 'Loan Details', 'View', 'View Loan Details'),
  ('00000000-0000-0000-0000-000000000012', 'Property & Loan Details', 'Loan Details', 'Create', 'Create Loan Details'),
  ('00000000-0000-0000-0000-000000000013', 'Property & Loan Details', 'Loan Details', 'Edit', 'Edit Loan Details'),
  ('00000000-0000-0000-0000-000000000014', 'Property & Loan Details', 'Loan Details', 'Delete', 'Delete Loan Details'),
  ('00000000-0000-0000-0000-000000000015', 'Document Upload & Review', 'Document Details', 'View', 'View Document Details'),
  ('00000000-0000-0000-0000-000000000016', 'Document Upload & Review', 'Document Details', 'Create', 'Create Document Details'),
  ('00000000-0000-0000-0000-000000000017', 'Document Upload & Review', 'Document Details', 'Edit', 'Edit Document Details'),
  ('00000000-0000-0000-0000-000000000018', 'Document Upload & Review', 'Document Details', 'Delete', 'Delete Document Details'),
  ('00000000-0000-0000-0000-000000000019', 'Document Upload & Review', 'Document Audit Trail', 'View', 'View Document Audit Trail'),
  ('00000000-0000-0000-0000-00000000001a', 'Document Upload & Review', 'Document Audit Trail', 'Create', 'Create Document Audit Trail'),
  ('00000000-0000-0000-0000-00000000001b', 'Document Upload & Review', 'Document Audit Trail', 'Edit', 'Edit Document Audit Trail'),
  ('00000000-0000-0000-0000-00000000001c', 'Document Upload & Review', 'Document Audit Trail', 'Delete', 'Delete Document Audit Trail'),
  ('00000000-0000-0000-0000-00000000001d', 'Applicant Profile', 'Personal Details', 'View', 'View Personal Details'),
  ('00000000-0000-0000-0000-00000000001e', 'Applicant Profile', 'Personal Details', 'Create', 'Create Personal Details'),
  ('00000000-0000-0000-0000-00000000001f', 'Applicant Profile', 'Personal Details', 'Edit', 'Edit Personal Details'),
  ('00000000-0000-0000-0000-000000000020', 'Applicant Profile', 'Personal Details', 'Delete', 'Delete Personal Details'),
  ('00000000-0000-0000-0000-000000000021', 'Administration', 'Manage Users', 'View', 'View Manage Users'),
  ('00000000-0000-0000-0000-000000000022', 'Administration', 'Manage Users', 'Create', 'Create Manage Users'),
  ('00000000-0000-0000-0000-000000000023', 'Administration', 'Manage Users', 'Edit', 'Edit Manage Users'),
  ('00000000-0000-0000-0000-000000000024', 'Administration', 'Manage Users', 'Delete', 'Delete Manage Users'),
  ('00000000-0000-0000-0000-00000000002d', 'Administration', 'Manage Users', 'Change Status', 'Change Status'),
  ('00000000-0000-0000-0000-000000000025', 'Administration', 'Manage Roles', 'View', 'View Manage Roles'),
  ('00000000-0000-0000-0000-000000000026', 'Administration', 'Manage Roles', 'Create', 'Create Manage Roles'),
  ('00000000-0000-0000-0000-000000000027', 'Administration', 'Manage Roles', 'Edit', 'Edit Manage Roles'),
  ('00000000-0000-0000-0000-000000000028', 'Administration', 'Manage Roles', 'Delete', 'Delete Manage Roles'),
  ('00000000-0000-0000-0000-000000000029', 'Administration', 'Manage Permissions', 'View', 'View Manage Permissions'),
  ('00000000-0000-0000-0000-00000000002a', 'Administration', 'Manage Permissions', 'Create', 'Create Manage Permissions'),
  ('00000000-0000-0000-0000-00000000002b', 'Administration', 'Manage Permissions', 'Edit', 'Edit Manage Permissions'),
  ('00000000-0000-0000-0000-00000000002c', 'Administration', 'Manage Permissions', 'Delete', 'Delete Manage Permissions')
on conflict (id) do nothing;

-- One "Administrator" role with every seeded permission checked
insert into roles (id, role_name, description, status, permission_ids) values (
  '00000000-0000-0000-0000-0000000000a1',
  'Administrator',
  'Full system access - all permissions.',
  'Active',
  array(select id from permissions)
)
on conflict (id) do nothing;

-- One bootstrap admin user, assigned the Administrator role above
insert into users (id, first_name, last_name, email, password, role_id, status) values (
  '00000000-0000-0000-0000-0000000000b1',
  'Admin',
  'User',
  'admin@outamation.com',
  'Admin@123',
  '00000000-0000-0000-0000-0000000000a1',
  'Active'
)
on conflict (id) do nothing;
