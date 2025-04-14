
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the provided URL and key
const supabaseUrl = 'https://ndmzmfozxuchgzehcvhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kbXptZm96eHVjaGd6ZWhjdmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4OTU3MTYsImV4cCI6MjA1ODQ3MTcxNn0.rQnSCQOMmLIGlZkeS5h9VErG8chvdQUorpBzgfGgmHw';

// AWS Configuration (would typically come from environment variables)
export const AWS_REGION = "us-east-1";
export const AWS_ACCESS_KEY = "AKIAST6S7LIAJGJNEDOW"; 
export const AWS_SECRET_KEY = "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";

// For diagnostic purposes
export const checkSupabaseConnection = async () => {
  try {
    // Make a simple request to check if Supabase is reachable
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      method: 'GET'
    });
    
    if (!response.ok) {
      console.warn(`Supabase connection check failed with status: ${response.status}`);
      return {
        success: false, 
        status: response.status,
        statusText: response.statusText
      };
    }
    
    console.log('Supabase connection check successful');
    return { success: true };
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)  
    };
  }
};

// Create Supabase client with enhanced retries and longer timeouts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use more secure PKCE flow
  },
  global: {
    headers: { 'x-app-version': '1.0.0' },
    // Enhanced fetch with retry logic
    fetch: async (url, options = {}) => {
      // Maximum number of retry attempts
      const maxRetries = 3;
      let attempts = 0;
      let lastError;

      while (attempts < maxRetries) {
        try {
          attempts++;
          console.log(`Supabase API request attempt ${attempts} to ${url}`);
          
          // Set longer timeout to help with network issues
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const text = await response.text();
            console.warn(`Supabase API request failed (${response.status}): ${text}`);
          } else {
            console.log(`Supabase API request succeeded: ${url}`);
          }
          
          return response;
        } catch (error) {
          lastError = error;
          console.warn(`Supabase API request attempt ${attempts} failed:`, error);
          
          // Don't retry if it was aborted intentionally
          if (error instanceof DOMException && error.name === "AbortError") {
            console.error("Request timed out");
            break;
          }
          
          // Wait before retrying (exponential backoff)
          if (attempts < maxRetries) {
            const delay = Math.min(1000 * 2 ** attempts, 10000);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If all attempts failed, throw the last error
      throw lastError || new Error("Request failed after multiple attempts");
    }
  }
});

// Helper function to check if user is online
export const isOnline = () => navigator.onLine;

// Export the original URL and key for diagnostic purposes
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_KEY = supabaseAnonKey;
