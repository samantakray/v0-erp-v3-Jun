// Job statuses
export const JOB_STATUS = {
  NEW: "New",
  BAG_CREATED: "Bag Created",
  STONE_SELECTED: "Stone Selected",
  DIAMOND_SELECTED: "Diamond Selected",
  SENT_TO_MANUFACTURER: "Sent to Manufacturer",
  IN_PRODUCTION: "In Production",
  RECEIVED_FROM_MANUFACTURER: "Received from Manufacturer",
  QC_PASSED: "QC Passed",
  QC_FAILED: "QC Failed",
  COMPLETED: "Completed",
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]

// Job phases
export const JOB_PHASE = {
  STONE: "stone",
  DIAMOND: "diamond",
  MANUFACTURER: "manufacturer",
  QUALITY_CHECK: "qc",
  COMPLETE: "complete",
} as const

export type JobPhase = (typeof JOB_PHASE)[keyof typeof JOB_PHASE]

// Status to phase mapping
export const STATUS_TO_PHASE: Record<JobStatus, JobPhase> = {
  [JOB_STATUS.NEW]: JOB_PHASE.STONE,
  [JOB_STATUS.BAG_CREATED]: JOB_PHASE.STONE,
  [JOB_STATUS.STONE_SELECTED]: JOB_PHASE.DIAMOND,
  [JOB_STATUS.DIAMOND_SELECTED]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.SENT_TO_MANUFACTURER]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.IN_PRODUCTION]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: JOB_PHASE.QUALITY_CHECK,
  [JOB_STATUS.QC_PASSED]: JOB_PHASE.COMPLETE,
  [JOB_STATUS.QC_FAILED]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.COMPLETED]: JOB_PHASE.COMPLETE,
}

// Phase display information
export const PHASE_INFO = {
  [JOB_PHASE.STONE]: {
    label: "Stone Selection",
    description: "Select stones for the job",
    color: "#F59E0B",
  },
  [JOB_PHASE.DIAMOND]: {
    label: "Diamond Selection",
    description: "Select diamonds for the job",
    color: "#3B82F6",
  },
  [JOB_PHASE.MANUFACTURER]: {
    label: "Manufacturer",
    description: "Manage manufacturing process",
    color: "#10B981",
  },
  [JOB_PHASE.QUALITY_CHECK]: {
    label: "Quality Check",
    description: "Perform quality check",
    color: "#8B5CF6",
  },
  [JOB_PHASE.COMPLETE]: {
    label: "Complete",
    description: "Job completed",
    color: "#6B7280",
  },
}
