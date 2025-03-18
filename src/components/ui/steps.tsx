
import React from 'react';
import { cn } from '@/lib/utils';

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({ children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
};

interface StepItemProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const StepItem: React.FC<StepItemProps> = ({ title, children, className }) => {
  return (
    <div className={cn("border-l-2 border-muted pl-4 pb-2 relative", className)}>
      <div className="h-5 w-5 rounded-full bg-primary absolute -left-2.5 flex items-center justify-center text-xs text-primary-foreground">
        <span>•</span>
      </div>
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="text-sm">{children}</div>
    </div>
  );
};
