import { Loader2 } from "lucide-react";

interface LoadingStepProps {
  currentStep: number;
  step: number;
  label: string;
}
const LoadingStep: React.FC<LoadingStepProps> = ({
  currentStep,
  step,
  label,
}) => (
  <div className="flex items-center gap-2 mb-2">
    <div
      className={`rounded-full p-1 ${
        currentStep === step
          ? "bg-primary/10"
          : currentStep > step
          ? "bg-green-100"
          : "bg-muted"
      }`}
    >
      {currentStep > step ? (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : currentStep === step ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      ) : (
        <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />
      )}
    </div>
    <span
      className={`text-sm ${
        currentStep === step
          ? "text-primary font-medium"
          : currentStep > step
          ? "text-green-600"
          : "text-muted-foreground"
      }`}
    >
      {label}
    </span>
  </div>
);

export default LoadingStep;