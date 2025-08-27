import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, validateApiConfig} from '../config/apiConfig';

// Validate configuration
const warnings = validateApiConfig();
if (warnings.length > 0) {
  console.warn('Supabase Configuration Warnings:', warnings);
}

export const supabase = createClient(API_CONFIG.SUPABASE_URL, API_CONFIG.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for database operations
export const userService = {
  // Get user profile
  async getProfile(userId) {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  },

  // Get user watchlist
  async getWatchlist(userId) {
    try {
      const {data, error} = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false});
        
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  },

  // Add to watchlist
  async addToWatchlist(userId, symbol, name) {
    try {
      const {data, error} = await supabase
        .from('watchlists')
        .insert([
          {
            user_id: userId,
            symbol: symbol,
            name: name,
          }
        ]);
        
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  },

  // Remove from watchlist
  async removeFromWatchlist(userId, symbol) {
    try {
      const {data, error} = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', userId)
        .eq('symbol', symbol);
        
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  },
};
