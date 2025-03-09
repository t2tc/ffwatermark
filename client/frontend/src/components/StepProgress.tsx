
interface Step {
  id: string
  title: string
}

interface StepProgressProps {
  steps: Step[]
  activeStep: string
  onStepClick?: (stepId: string) => void
  className?: string
}

function generateWidthPercentages(current: number, of: number) {
    // 给一点点额外的宽度
    if ((current / of) * 100 + 2 > 100) return "100%";
    return `${(current / of) * 100 + 2}%`;
}

export function StepProgress({
  steps,
  activeStep,
  onStepClick,
  className = '',
}: StepProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === activeStep);

  const handlePrevStep = () => {
    if (currentIndex > 0) {
      onStepClick?.(steps[currentIndex - 1].id);
    }
  };

  const handleNextStep = () => {
    if (currentIndex < steps.length - 1) {
      onStepClick?.(steps[currentIndex + 1].id);
    }
  };

  return (
    <div className={className}>
      <div className="flex justify-between mb-4">
        {currentIndex > 0 && (
          <button
            onClick={handlePrevStep}
            className="px-4 py-2 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors"
          >
            上一步
          </button>
        )}
        {currentIndex < steps.length - 1 && (
          <button
            onClick={handleNextStep}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors ml-auto"
          >
            下一步
          </button>
        )}
      </div>
      <div className="relative mb-8">
        {/* 进度条背景 */}
        <div className="h-2 bg-gray-200 rounded-full" />
        {/* 进度条前景 */}
        <div
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{
            width: generateWidthPercentages(currentIndex, steps.length - 1),
          }}
        />
        {/* 步骤按钮 */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between">
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={`
                w-8 h-8 rounded-full border-2 transition-colors relative
                ${activeStep === step.id
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : index <= currentIndex
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }
              `}
              onClick={() => onStepClick?.(step.id)}
              disabled={index > currentIndex + 1}
            >
              {index + 1}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-gray-600">
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}