
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These are public keys that are safe to be in the client
const supabaseUrl = 'https://supabase-url-placeholder.supabase.co';
const supabaseAnonKey = 'supabase-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
