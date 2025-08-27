import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    // Check if it's first time opening the app
    checkFirstTime();
    
    // Check current auth session
    checkAuthSession();
    
    // Listen for auth changes
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setIsFirstTime(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking first time status:', error);
    }
  };

  const checkAuthSession = async () => {
    try {
      const {data: {session}} = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };

  const signIn = async (email, password) => {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return {success: true, data};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };

  const signOut = async () => {
    try {
      const {error} = await supabase.auth.signOut();
      if (error) throw error;
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    user,
    loading,
    isFirstTime,
    signUp,
    signIn,
    signOut,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
