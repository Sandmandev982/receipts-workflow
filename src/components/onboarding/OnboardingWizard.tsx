
import React from 'react';

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
  step: number;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ step }) => {
  const currentStep = step - 1; // Convert from 1-based to 0-based index
  
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">{steps[currentStep].title}</h2>
      <p className="text-muted-foreground">{steps[currentStep].content}</p>
      
      {currentStep === 0 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm">You can complete this setup in under 4 minutes!</p>
        </div>
      )}
    </div>
  );
};

export default OnboardingWizard;
