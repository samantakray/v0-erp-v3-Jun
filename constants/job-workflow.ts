// Job statuses
export const JOB_STATUS = {
  NEW: "New Job",
  BAG_CREATED: "Bag Created",
  STONE_SELECTED: "Stone Selected",
  DIAMOND_SELECTED: "Diamond Selected",
  SENT_TO_MANUFACTURER: "Sent to Manufacturer",
  IN_PRODUCTION: "In Production",
  RECEIVED_FROM_MANUFACTURER: "Received from Manufacturer",
  QC_PASSED: "Quality Check Passed",
  QC_FAILED: "Quality Check Failed",
  COMPLETED: "Completed",
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]

// Job phases
export const JOB_PHASE = {
  BAG_CREATION: "bag-creation",
  STONE: "stone",
  DIAMOND: "diamond",
  MANUFACTURER: "manufacturer",
  QC: "quality-check",
  COMPLETE: "complete",
} as const

export type JobPhase = (typeof JOB_PHASE)[keyof typeof JOB_PHASE]

// Mapping from status to phase
export const STATUS_TO_PHASE: Record<JobStatus, JobPhase> = {
  [JOB_STATUS.NEW]: JOB_PHASE.BAG_CREATION,
  [JOB_STATUS.BAG_CREATED]: JOB_PHASE.STONE, // Updated to reflect phase transition
  [JOB_STATUS.STONE_SELECTED]: JOB_PHASE.STONE, // Corrected
  [JOB_STATUS.DIAMOND_SELECTED]: JOB_PHASE.DIAMOND, // Corrected
  [JOB_STATUS.SENT_TO_MANUFACTURER]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.IN_PRODUCTION]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: JOB_PHASE.QC, // Corrected
  [JOB_STATUS.QC_PASSED]: JOB_PHASE.COMPLETE,
  [JOB_STATUS.QC_FAILED]: JOB_PHASE.QC,
  [JOB_STATUS.COMPLETED]: JOB_PHASE.COMPLETE,
}

// Get the next phase based on current phase
export function getNextPhase(currentPhase: JobPhase): JobPhase | null {
  switch (currentPhase) {
    case JOB_PHASE.BAG_CREATION:
      return JOB_PHASE.STONE
    case JOB_PHASE.STONE:
      return JOB_PHASE.DIAMOND
    case JOB_PHASE.DIAMOND:
      return JOB_PHASE.MANUFACTURER
    case JOB_PHASE.MANUFACTURER:
      return JOB_PHASE.QC
    case JOB_PHASE.QC:
      return JOB_PHASE.COMPLETE
    case JOB_PHASE.COMPLETE:
      return null
    default:
      return null
  }
}

// Get the next status based on current phase and current status
export function getNextStatus(currentPhase: JobPhase, currentStatus: JobStatus, success = true): JobStatus {
  // Validate current status belongs to the current phase
  if (STATUS_TO_PHASE[currentStatus] !== currentPhase) {
    throw new Error(`Status ${currentStatus} does not belong to phase ${currentPhase}`)
  }

  switch (currentPhase) {
    case JOB_PHASE.BAG_CREATION:
      return JOB_STATUS.BAG_CREATED
    case JOB_PHASE.STONE:
      return JOB_STATUS.STONE_SELECTED
    case JOB_PHASE.DIAMOND:
      return JOB_STATUS.DIAMOND_SELECTED
    case JOB_PHASE.MANUFACTURER:
      return getNextManufacturerStatus(currentStatus) ?? JOB_STATUS.RECEIVED_FROM_MANUFACTURER
    case JOB_PHASE.QC:
      return success ? JOB_STATUS.QC_PASSED : JOB_STATUS.QC_FAILED
    case JOB_PHASE.COMPLETE:
      return JOB_STATUS.COMPLETED
    default:
      throw new Error(`Invalid phase: ${currentPhase}`)
  }
}

// Handle sub-status transitions within manufacturer phase
export function getNextManufacturerStatus(currentStatus: JobStatus): JobStatus | null {
  switch (currentStatus) {
    case JOB_STATUS.SENT_TO_MANUFACTURER:
      return JOB_STATUS.IN_PRODUCTION
    case JOB_STATUS.IN_PRODUCTION:
      return JOB_STATUS.RECEIVED_FROM_MANUFACTURER
    case JOB_STATUS.RECEIVED_FROM_MANUFACTURER:
      return null // End of manufacturer phase statuses
    default:
      return null
  }
}

// Handle QC failure
export function handleQCFailure(currentStatus: JobStatus): JobStatus | null {
  if (currentStatus === JOB_STATUS.QC_FAILED) {
    return JOB_STATUS.IN_PRODUCTION // Return to manufacturing for rework
  }
  return null
}

// Phase display information
export const PHASE_INFO = {
  [JOB_PHASE.BAG_CREATION]: {
    label: "Bag Creation",
    description: "Create bag for job materials",
    color: "#6593F5",
  },
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
  [JOB_PHASE.QC]: {
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

// Teams responsible for each phase
export const PHASE_TEAMS = {
  [JOB_PHASE.BAG_CREATION]: "Bag Creation Team",
  [JOB_PHASE.STONE]: "Stone Selection Team",
  [JOB_PHASE.DIAMOND]: "Diamond Selection Team",
  [JOB_PHASE.MANUFACTURER]: "Manufacturing Team",
  [JOB_PHASE.QC]: "Quality Control Team",
  [JOB_PHASE.COMPLETE]: "Delivery Team",
}

export const STATUS_INFO = {
  [JOB_STATUS.NEW]: {
    label: "New Job",
    color: "bg-blue-400",
  },
  [JOB_STATUS.BAG_CREATED]: {
    label: "Bag Created",
    color: "bg-[#6593F5]",
  },
  [JOB_STATUS.STONE_SELECTED]: {
    label: "Stone Selected",
    color: "bg-indigo-500",
  },
  [JOB_STATUS.DIAMOND_SELECTED]: {
    label: "Diamond Selected",
    color: "bg-purple-500",
  },
  [JOB_STATUS.SENT_TO_MANUFACTURER]: {
    label: "Sent to Manufacturer",
    color: "bg-yellow-500",
  },
  [JOB_STATUS.IN_PRODUCTION]: {
    label: "In Production",
    color: "bg-amber-500",
  },
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: {
    label: "Received from Manufacturer",
    color: "bg-teal-500",
  },
  [JOB_STATUS.QC_PASSED]: {
    label: "Quality Check Passed",
    color: "bg-orange-500",
  },
  [JOB_STATUS.QC_FAILED]: {
    label: "Quality Check Failed",
    color: "bg-red-500",
  },
  [JOB_STATUS.COMPLETED]: {
    label: "Completed",
    color: "bg-green-500",
  },
}
