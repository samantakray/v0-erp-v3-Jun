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

// Job status colors and styling
export const JOB_STATUS_STYLES = {
  [JOB_STATUS.NEW]: {
    className: "bg-gray-500 hover:bg-gray-600 text-white",
    color: "gray",
    description: "New job"
  },
  [JOB_STATUS.BAG_CREATED]: {
    className: "bg-blue-500 hover:bg-blue-600 text-white",
    color: "blue", 
    description: "Bag created"
  },
  [JOB_STATUS.STONE_SELECTED]: {
    className: "bg-amber-500 hover:bg-amber-600 text-white",
    color: "amber",
    description: "Stone selected"
  },
  [JOB_STATUS.DIAMOND_SELECTED]: {
    className: "bg-purple-500 hover:bg-purple-600 text-white",
    color: "purple",
    description: "Diamond selected"
  },
  [JOB_STATUS.SENT_TO_MANUFACTURER]: {
    className: "bg-orange-500 hover:bg-orange-600 text-white",
    color: "orange",
    description: "Sent to manufacturer"
  },
  [JOB_STATUS.IN_PRODUCTION]: {
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
    color: "yellow",
    description: "In production"
  },
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: {
    className: "bg-indigo-500 hover:bg-indigo-600 text-white",
    color: "indigo",
    description: "Received from manufacturer"
  },
  [JOB_STATUS.QC_PASSED]: {
    className: "bg-cyan-500 hover:bg-cyan-600 text-white",
    color: "cyan",
    description: "QC passed"
  },
  [JOB_STATUS.QC_FAILED]: {
    className: "bg-red-500 hover:bg-red-600 text-white",
    color: "red",
    description: "QC failed"
  },
  [JOB_STATUS.COMPLETED]: {
    className: "bg-green-500 hover:bg-green-600 text-white",
    color: "green",
    description: "Job completed"
  }
} as const

// Helper function to get job status style
export const getJobStatusStyle = (status: JobStatus) => {
  return JOB_STATUS_STYLES[status] || JOB_STATUS_STYLES[JOB_STATUS.NEW]
}

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
