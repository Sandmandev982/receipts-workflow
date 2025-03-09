
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnboardingContextProps {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('completed_onboarding')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setHasCompletedOnboarding(data?.completed_onboarding || false);
      
      // Redirect to onboarding if not completed and not already there
      if (!data?.completed_onboarding && window.location.pathname !== '/onboarding' && window.location.pathname !== '/auth') {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ completed_onboarding: true })
        .eq('id', user.id);

      if (error) throw error;
      
      setHasCompletedOnboarding(true);
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const skipOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ completed_onboarding: true })
        .eq('id', user.id);

      if (error) throw error;
      
      setHasCompletedOnboarding(true);
      navigate('/');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        currentStep,
        setCurrentStep,
        totalSteps,
        completeOnboarding,
        skipOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextProps => {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
};
