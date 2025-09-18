// Centralized configuration for API URLs and environment variables
export const config = {
  // API URLs - Use localhost in development
  API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" 
    ? "https://your-backend-url.com" 
    : "http://localhost:8000"),
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "production"
    ? "https://your-frontend-url.com"
    : "http://localhost:3000"),
  
  // Supabase Configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vkappuaapscvteexogtp.supabase.co",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXBwdWFhcHNjdnRlZXhvZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNTQwOTIsImV4cCI6MjA2MTgzMDA5Mn0.ILq6Aho_0xGW3JtbhXWpB-0AkJAN70-3q2abplZ3fbA",
  
  // Authentication
  ALLOWED_DOMAIN: "christuniversity.in",
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

// Helper function to get API endpoint
export const getApiUrl = (endpoint: string) => {
  return `${config.API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper function to get app URL
export const getAppUrl = (path: string = '') => {
  return `${config.APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
