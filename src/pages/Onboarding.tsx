
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useOnboarding } from '@/hooks/useOnboarding';

const Onboarding = () => {
  const { 
    currentStep, 
    setCurrentStep, 
    totalSteps, 
    completeOnboarding, 
    skipOnboarding 
  } = useOnboarding();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Welcome to Receipts</span>
            <Button variant="ghost" onClick={skipOnboarding}>
              Skip
            </Button>
          </CardTitle>
          <div className="flex space-x-1 mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <OnboardingWizard step={currentStep} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button onClick={handleNext}>
            {currentStep === totalSteps ? 'Get Started' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
