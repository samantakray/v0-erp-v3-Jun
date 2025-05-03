"use client"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

export type StepStatus = "completed" | "current" | "upcoming"

export interface Step {
  id: string
  label: string
  status: StepStatus
  description?: string
}

interface StepperProps {
  steps: Step[]
  className?: string
  onStepClick?: (stepId: string) => void
}

export function Stepper({ steps, className, onStepClick }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center",
              index < steps.length - 1 ? "w-full" : "",
              step.status === "current" ? "text-primary" : "",
              step.status === "completed" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={step.status === "upcoming"}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0 border transition-colors",
                  step.status === "completed" ? "bg-primary border-primary" : "",
                  step.status === "current" ? "border-primary" : "",
                  step.status === "upcoming" ? "border-muted-foreground" : "",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                )}
                aria-current={step.status === "current" ? "step" : undefined}
              >
                {step.status === "completed" ? (
                  <CheckIcon className="w-4 h-4 text-background" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </button>
              <span className="text-xs mt-1 text-center">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("w-full h-0.5 mx-2", step.status === "completed" ? "bg-primary" : "bg-muted")}></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
