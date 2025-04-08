
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the provided URL and key
const supabaseUrl = 'https://ndmzmfozxuchgzehcvhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbXptZm96eHVjaGd6ZWhjdmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTU3MTYsImV4cCI6MjA1ODQ3MTcxNn0.rQnSCQOMmLIGlZkeS5h9VErG8chvdQUorpBzgfGgmHw';

// AWS Configuration (would typically come from environment variables)
export const AWS_REGION = "us-east-1";
export const AWS_ACCESS_KEY = "AKIAST6S7LIAJGJNEDOW"; 
export const AWS_SECRET_KEY = "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";

// Create Supabase client with retries and longer timeouts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-app-version': '1.0.0' },
    fetch: (url, options) => {
      // Add custom fetch with timeout
      return fetch(url, {
        ...options,
        // Set longer timeout to help with network issues
        signal: options?.signal || AbortSignal.timeout(30000) // 30 second timeout
      });
    }
  }
});

// Helper function to check if user is online
export const isOnline = () => navigator.onLine;
