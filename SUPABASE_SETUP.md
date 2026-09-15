# Supabase Setup - Mortgage POC

This app now persists data to a real Supabase (Postgres) backend instead of
localStorage. Follow these steps once to get it running.

## 1. Create a free Supabase project

1. Go to https://supabase.com and sign up (no credit card required).
2. Click "New Project". Choose any name/region and a database password
   (you won't need the password for this app - the client uses the anon key).
3. Wait ~2 minutes for the project to finish provisioning.

## 2. Run the schema script

1. In your Supabase project, open the **SQL Editor** (left sidebar).
2. Click **New Query**.
3. Open `supabase-schema.sql` (included in this project's root folder),
   copy its entire contents, paste into the SQL editor, and click **Run**.
4. This creates all 8 tables (borrowers, properties, loans, documents,
   applicants, permissions, roles, users), enables Row Level Security with
   permissive POC policies, creates 2 storage buckets (`documents`,
   `applicant-photos`), and seeds the Administration data you need to log
   in for the first time (see step 5 below).

## 3. Get your API credentials

1. In Supabase, go to **Project Settings -> API**.
2. Copy the **Project URL** and the **anon public** key.
   (The anon key is safe to use client-side - it's designed for this,
   and access is controlled by the RLS policies from step 2.)

## 4. Add credentials to the app

Open `src/environments/environment.ts` and `src/environments/environment.prod.ts`,
and replace the placeholder values:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR-PROJECT-REF.supabase.co',
  supabaseAnonKey: 'YOUR-ANON-PUBLIC-KEY'
};
```

## 5. Run the app

```bash
npm install
npm start
```

Open http://localhost:4200 and log in with the seeded administrator account
(created by the schema script in step 2):

```
Email:    admin@outamation.com
Password: Admin@123
```

From there, use **Administration -> Manage Users** to create real accounts
for everyone else (each with their own email/password and an assigned
Role). Try creating a Borrower, Property, Loan, Document, or Applicant
Profile record too - refresh the page and the data will still be there,
because it's stored in Supabase instead of the browser.

## Notes

- **RLS policies are intentionally permissive** for this POC (anyone with
  the anon key can read/write all rows). This is fine for a local POC with
  no real users, but should be tightened (e.g. scoped to an authenticated
  user) before any wider deployment.
- **File uploads** (Document Details file, Applicant Profile photo) go to
  Supabase Storage buckets, not the database - the DB just stores the file's
  path/name.
- **Login is backed by the `users` table** (Administration -> Manage Users),
  not Supabase Auth. Passwords are stored as **plain text** - there's no
  backend server here to hash them against, so this is POC-only, same
  spirit as the permissive RLS policies above. Don't reuse real passwords
  when creating users, and don't carry this pattern into anything beyond a
  proof-of-concept.
- **You can't deactivate or delete your own account** (Manage Users blocks
  this for whichever user is currently logged in), so there's always at
  least one way back in.
