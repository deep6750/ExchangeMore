// API Configuration
// Replace these with your actual API keys and URLs

export const API_CONFIG = {
  // Twelve Data API - Get your free API key from https://twelvedata.com/
  TWELVE_DATA_API_KEY: '8c01754c71074264b44d9a30925b5a39',
  TWELVE_DATA_BASE_URL: 'https://api.twelvedata.com',
  
  // Supabase Configuration - Get from your Supabase project dashboard
  SUPABASE_URL: 'https://yhspwriqgamrnjncderf.supabase.co',
  SUPABASE_ANON_KEY: 'yhspwriqgamrnjncderf',
  
  // App Configuration
  APP_NAME: 'Grover Forex',
  APP_VERSION: '1.0.0',
  
  // Demo mode (set to true to use mock data instead of real API calls)
  DEMO_MODE: true,
  
  // Internal mock data configuration for development
  USE_DUMMY_API: true, // Use internal mock service (no external dependencies)
  USE_INTERNAL_MOCK: false, // Enable internal mock data service
  // Dummy API URLs (not used when USE_INTERNAL_MOCK is true)
  DUMMY_API_URL: 'http://localhost:3001',
  DUMMY_API_WS_URL: 'ws://localhost:3001',
};

// Validation function to check if API keys are configured
export const validateApiConfig = () => {
  const warnings = [];
  
  if (API_CONFIG.TWELVE_DATA_API_KEY === 'YOUR_TWELVE_DATA_API_KEY') {
    warnings.push('Twelve Data API key not configured. Using demo mode.');
  }
  
  if (API_CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL') {
    warnings.push('Supabase URL not configured. Authentication will not work.');
  }
  
  if (API_CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    warnings.push('Supabase anon key not configured. Authentication will not work.');
  }
  
  return warnings;
};

// API endpoints configuration
export const API_ENDPOINTS = {
  TWELVE_DATA: {
    QUOTE: '/quote',
    TIME_SERIES: '/time_series',
    EXCHANGE_RATE: '/exchange_rate',
    CURRENCY_CONVERSION: '/currency_conversion',
    MARKET_STATE: '/market_state',
    FOREX_PAIRS: '/forex_pairs',
  },
  
  SUPABASE: {
    PROFILES: 'profiles',
    WATCHLISTS: 'watchlists',
    POSITIONS: 'positions',
    TRANSACTIONS: 'transactions',
  },
};

// Rate limiting configuration
export const RATE_LIMITS = {
  TWELVE_DATA_FREE_TIER: {
    REQUESTS_PER_MINUTE: 8,
    REQUESTS_PER_DAY: 800,
  },
};
