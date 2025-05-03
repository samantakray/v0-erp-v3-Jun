"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { JOB_STATUS } from "@/constants/job-workflow"

// Define the phases and their display names using our constants
const PHASES = [
  { id: JOB_STATUS.NEW, label: "New jobs" },
  { id: JOB_STATUS.BAG_CREATED, label: "Bag created" },
  { id: JOB_STATUS.STONE_SELECTED, label: "Stone selected" },
  { id: JOB_STATUS.DIAMOND_SELECTED, label: "Diamond selected" },
  { id: JOB_STATUS.IN_PRODUCTION, label: "Production work" },
  { id: JOB_STATUS.QC_PASSED, label: "Quality Checking" },
  { id: JOB_STATUS.COMPLETED, label: "Complete" },
]

// Static style map for phase colors
const PHASE_STYLES: Record<string, { active: string; inactive: string }> = {
  [JOB_STATUS.NEW]: {
    active: "bg-blue-400 border-blue-400 text-white",
    inactive: "border-blue-400 bg-background text-foreground",
  },
  [JOB_STATUS.BAG_CREATED]: {
    active: "bg-[#6593F5] border-[#6593F5] text-white",
    inactive: "border-[#6593F5] bg-background text-foreground",
  },
  [JOB_STATUS.STONE_SELECTED]: {
    active: "bg-indigo-500 border-indigo-500 text-white",
    inactive: "border-indigo-500 bg-background text-foreground",
  },
  [JOB_STATUS.DIAMOND_SELECTED]: {
    active: "bg-purple-500 border-purple-500 text-white",
    inactive: "border-purple-500 bg-background text-foreground",
  },
  [JOB_STATUS.IN_PRODUCTION]: {
    active: "bg-amber-500 border-amber-500 text-white",
    inactive: "border-amber-500 bg-background text-foreground",
  },
  [JOB_STATUS.QC_PASSED]: {
    active: "bg-orange-500 border-orange-500 text-white",
    inactive: "border-orange-500 bg-background text-foreground",
  },
  [JOB_STATUS.COMPLETED]: {
    active: "bg-green-500 border-green-500 text-white",
    inactive: "border-green-500 bg-background text-foreground",
  },
}

interface PhaseSummaryTrackerProps {
  jobs: any[]
  activeFilter: string | null
  onFilter: (phase: string | null) => void
}

export function PhaseSummaryTracker({ jobs, activeFilter, onFilter }: PhaseSummaryTrackerProps) {
  // Memoize calculations with single-pass counting for better performance
  const { phaseCounts, totalJobs } = useMemo(() => {
    const counts = Object.fromEntries(PHASES.map((p) => [p.id, 0]))
    for (const job of jobs) {
      if (counts[job.status] != null) counts[job.status]++
    }
    return {
      phaseCounts: counts,
      totalJobs: jobs.length,
    }
  }, [jobs])

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Order Progress Summary</h3>
        {activeFilter && (
          <button
            onClick={() => onFilter(null)}
            className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 h-0.5 bg-muted" />

        {/* All Jobs node */}
        <div className="relative z-10">
          <button
            onClick={() => onFilter(null)}
            className={cn(
              "flex flex-col items-center gap-1 p-1 rounded-md transition-colors",
              activeFilter === null ? "bg-primary/10" : "hover:bg-muted",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                activeFilter === null
                  ? "border-gray-500 bg-gray-500 text-white"
                  : "border-muted-foreground bg-background",
              )}
            >
              <span className="text-xs font-medium">{totalJobs}</span>
            </div>
            <span className="text-xs font-medium">All jobs</span>
          </button>
        </div>

        {/* Phase nodes */}
        {PHASES.map((phase) => (
          <div key={phase.id} className="relative z-10">
            <button
              onClick={() => onFilter(phase.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-1 rounded-md transition-colors",
                activeFilter === phase.id ? "bg-primary/10" : "hover:bg-muted",
              )}
              disabled={phaseCounts[phase.id] === 0}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  activeFilter === phase.id
                    ? PHASE_STYLES[phase.id]?.active
                    : phaseCounts[phase.id] > 0
                      ? PHASE_STYLES[phase.id]?.inactive
                      : "border-muted bg-muted text-muted-foreground",
                )}
              >
                <span className="text-xs font-medium">{phaseCounts[phase.id]}</span>
              </div>
              <span className="text-xs font-medium">{phase.label}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
        <span>Job Created</span>
        <span>Job Completed</span>
      </div>
    </div>
  )
}
