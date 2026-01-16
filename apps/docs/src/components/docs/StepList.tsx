interface Step {
  title: string
  description: string
}

interface StepListProps {
  steps: Step[]
}

export function StepList({ steps }: StepListProps) {
  return (
    <div className="space-y-4 my-6">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="step-number">{index + 1}</div>
          <div className="flex-1 pt-1">
            <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
