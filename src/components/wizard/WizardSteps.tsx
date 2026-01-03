import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardStepsProps {
  steps: Step[];
  currentStep: number;
}

const WizardSteps = ({ steps, currentStep }: WizardStepsProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                currentStep > step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "border-primary text-primary bg-primary/10"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{step.id}</span>
              )}
            </div>
            <div className="mt-2 text-center hidden sm:block">
              <p className={cn(
                "text-sm font-medium",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground hidden md:block">
                {step.description}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2",
                currentStep > step.id ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default WizardSteps;
