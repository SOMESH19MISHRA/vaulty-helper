
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the provided URL and key
const supabaseUrl = 'https://ndmzmfozxuchgzehcvhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbXptZm96eHVjaGd6ZWhjdmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTU3MTYsImV4cCI6MjA1ODQ3MTcxNn0.rQnSCQOMmLIGlZkeS5h9VErG8chvdQUorpBzgfGgmHw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
