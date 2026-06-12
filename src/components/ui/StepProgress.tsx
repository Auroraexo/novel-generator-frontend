'use client';

interface Step {
  key: string;
  label: string;
  done: boolean;
  active: boolean;
}

interface Props {
  steps: Step[];
  progress?: number;
  progressLabel?: string;
  className?: string;
}

export default function StepProgress({
  steps,
  progress,
  progressLabel,
  className = '',
}: Props) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step.done
                    ? 'bg-green-500 text-white'
                    : step.active
                      ? 'bg-gold text-ink'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.done ? '✓' : i + 1}
              </div>
              <span
                className={`text-sm truncate ${
                  step.active ? 'text-ink font-medium' : step.done ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 min-w-[12px] ${
                  step.done ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{progressLabel || '整体进度'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
