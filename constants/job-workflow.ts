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

// Order statuses - Adding this new section
export const ORDER_STATUS = {
  NEW: "New",
  PENDING: "Pending",
  COMPLETED: "Completed",
  DRAFT: "Draft",
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

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

// NEW: Job status to order status mapping
export const JOB_STATUS_TO_ORDER_STATUS: Record<JobStatus, OrderStatus> = {
  [JOB_STATUS.NEW]: ORDER_STATUS.NEW,
  [JOB_STATUS.BAG_CREATED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.STONE_SELECTED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.DIAMOND_SELECTED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.SENT_TO_MANUFACTURER]: ORDER_STATUS.PENDING,
  [JOB_STATUS.IN_PRODUCTION]: ORDER_STATUS.PENDING,
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: ORDER_STATUS.PENDING,
  [JOB_STATUS.QC_PASSED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.QC_FAILED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.COMPLETED]: ORDER_STATUS.COMPLETED,
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
