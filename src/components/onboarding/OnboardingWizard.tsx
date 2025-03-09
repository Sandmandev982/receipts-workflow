
import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    title: 'Welcome to Receipts',
    content: 'Receipts helps you organize tasks, schedule them accurately, and collaborate with your team. Let\'s get you set up in just a few steps!',
  },
  {
    title: 'Creating Tasks',
    content: 'Click the "Add Task" button to create a new task. You can set its priority, due date, and add a detailed description.',
  },
  {
    title: 'Organizing Tasks',
    content: 'Drag and drop tasks to reorder them by importance. Mark tasks as complete when finished, or reschedule them if needed.',
  },
  {
    title: 'Team Collaboration',
    content: 'Invite team members to collaborate on tasks. You can assign tasks, send messages, and track progress together.',
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2" 
            onClick={onComplete}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="mb-8">{steps[currentStep].content}</p>
          
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                className="focus:outline-none"
                onClick={() => setCurrentStep(index)}
              >
                {index === currentStep ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'} {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
