import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Single shared Supabase client instance for the whole app.
 * Uses the public anon key - safe to ship client-side as long as
 * Row Level Security (RLS) policies on each table constrain what
 * the anon role can do (see supabase-schema.sql).
 */
export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
