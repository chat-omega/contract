/**
 * Stepper Component
 * Horizontal progress indicator for multi-step workflows
 */

import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

export interface Step {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number; // 1-based index
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const isClickable = (stepIndex: number): boolean => {
    return !!onStepClick && stepIndex <= currentStep;
  };

  const handleStepClick = (stepIndex: number) => {
    if (isClickable(stepIndex)) {
      onStepClick?.(stepIndex);
    }
  };

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const clickable = isClickable(stepNumber);

          return (
            <li
              key={stepNumber}
              className={cn(
                'relative flex-1',
                index !== steps.length - 1 && 'pr-8 sm:pr-20'
              )}
            >
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-0 w-full h-0.5 -z-10"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full transition-colors duration-300',
                      status === 'completed' ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}

              {/* Step button/div */}
              <button
                type="button"
                onClick={() => handleStepClick(stepNumber)}
                disabled={!clickable}
                className={cn(
                  'group flex flex-col items-start w-full text-left',
                  clickable && 'cursor-pointer',
                  !clickable && 'cursor-default'
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                <span className="flex items-center">
                  {/* Step circle */}
                  <span
                    className={cn(
                      'relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                      'transition-colors duration-300',
                      status === 'completed' &&
                        'bg-primary-600 group-hover:bg-primary-700',
                      status === 'current' &&
                        'border-2 border-primary-600 bg-white',
                      status === 'upcoming' && 'border-2 border-gray-300 bg-white'
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-medium',
                          status === 'current' && 'text-primary-600',
                          status === 'upcoming' && 'text-gray-500'
                        )}
                      >
                        {stepNumber}
                      </span>
                    )}
                  </span>
                </span>

                {/* Step label */}
                <span className="mt-2 flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      status === 'completed' && 'text-primary-600',
                      status === 'current' && 'text-primary-600',
                      status === 'upcoming' && 'text-gray-500',
                      clickable && 'group-hover:text-primary-700'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Vertical stepper variant
export interface VerticalStepperProps {
  steps: Step[];
  currentStep: number; // 1-based index
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const VerticalStepper: React.FC<VerticalStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const isClickable = (stepIndex: number): boolean => {
    return !!onStepClick && stepIndex <= currentStep;
  };

  const handleStepClick = (stepIndex: number) => {
    if (isClickable(stepIndex)) {
      onStepClick?.(stepIndex);
    }
  };

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="space-y-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const clickable = isClickable(stepNumber);

          return (
            <li key={stepNumber} className="relative">
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute top-8 left-4 w-0.5 h-full -z-10"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'w-full transition-colors duration-300',
                      status === 'completed' ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                    style={{ height: 'calc(100% + 1.5rem)' }}
                  />
                </div>
              )}

              {/* Step button/div */}
              <button
                type="button"
                onClick={() => handleStepClick(stepNumber)}
                disabled={!clickable}
                className={cn(
                  'group flex items-start w-full text-left',
                  clickable && 'cursor-pointer',
                  !clickable && 'cursor-default'
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    'relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    'transition-colors duration-300',
                    status === 'completed' &&
                      'bg-primary-600 group-hover:bg-primary-700',
                    status === 'current' && 'border-2 border-primary-600 bg-white',
                    status === 'upcoming' && 'border-2 border-gray-300 bg-white'
                  )}
                >
                  {status === 'completed' ? (
                    <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        status === 'current' && 'text-primary-600',
                        status === 'upcoming' && 'text-gray-500'
                      )}
                    >
                      {stepNumber}
                    </span>
                  )}
                </span>

                {/* Step content */}
                <span className="ml-4 flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      status === 'completed' && 'text-primary-600',
                      status === 'current' && 'text-primary-600',
                      status === 'upcoming' && 'text-gray-500',
                      clickable && 'group-hover:text-primary-700'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-sm text-gray-500 mt-0.5">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
