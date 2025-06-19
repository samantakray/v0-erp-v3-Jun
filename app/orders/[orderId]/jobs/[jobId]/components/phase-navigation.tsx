"use client"

import { useJob } from "@/components/job-context-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function PhaseNavigation({ orderId, jobId }: { orderId: string; jobId: string }) {
  const job = useJob()
  const pathname = usePathname()

  // Console logging for phase navigation debugging - Root Cause #4
  console.log("🔍 Phase Navigation - Component rendered")
  console.log("🔍 Phase Navigation - Current pathname:", pathname)
  console.log("🔍 Phase Navigation - orderId:", orderId, "jobId:", jobId)
  console.log("🔍 Phase Navigation - Job data:", job)

  const phases = [
    { name: "Stone Selection", path: "stone-selection", status: "stone" },
    { name: "Diamond Selection", path: "diamond-selection", status: "diamond" },
    { name: "Manufacturer", path: "manufacturer", status: "manufacturer" },
    { name: "Quality Check", path: "quality-check", status: "quality-check" },
    { name: "Complete", path: "complete", status: "complete" },
  ]

  // Determine which phases are accessible based on job status
  const isPhaseAccessible = (phaseStatus: string) => {
    const accessible = (() => {
    switch (job.status) {
      case "New Job":
        return phaseStatus === "stone"
      case "Stone Selected":
        return phaseStatus === "stone" || phaseStatus === "diamond"
      case "Diamond Selected":
        return phaseStatus === "stone" || phaseStatus === "diamond" || phaseStatus === "manufacturer"
      case "Sent to Manufacturer":
      case "In Production":
        return (
          phaseStatus === "stone" ||
          phaseStatus === "diamond" ||
          phaseStatus === "manufacturer" ||
          phaseStatus === "quality-check"
        )
      case "Quality Check Passed":
      case "Quality Check Failed":
      case "Completed":
        return true
      default:
        return phaseStatus === "stone"
    }
    })()

    // Console logging for phase accessibility
    console.log(`🔍 Phase Navigation - Phase "${phaseStatus}" accessibility:`, accessible)
    console.log(`🔍 Phase Navigation - Job status "${job.status}" allows access to phase "${phaseStatus}":`, accessible)
    
    return accessible
  }

  return (
    <div className="flex border-b mb-6">
      {phases.map((phase) => {
        const href = `/orders/${orderId}/jobs/${jobId}/${phase.path}`
        const isCurrentPhase = pathname.includes(phase.path)
        const isAccessible = isPhaseAccessible(phase.status)
        
        // Console logging for each phase link
        console.log(`🔍 Phase Navigation - Phase "${phase.name}":`)
        console.log(`🔍 Phase Navigation - - href:`, href)
        console.log(`🔍 Phase Navigation - - isCurrentPhase:`, isCurrentPhase)
        console.log(`🔍 Phase Navigation - - isAccessible:`, isAccessible)
        console.log(`🔍 Phase Navigation - - will be clickable:`, isAccessible)

        return (
        <Link
          key={phase.path}
            href={href}
          className={cn(
            "px-4 py-2 text-sm font-medium",
              isCurrentPhase ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
              !isAccessible && "opacity-50 pointer-events-none",
            )}
            onClick={(e) => {
              // Console logging for navigation attempts - Root Cause #4
              console.log(`🔍 Phase Navigation - CLICK EVENT: User clicked on "${phase.name}"`)
              console.log(`🔍 Phase Navigation - CLICK EVENT: Attempting navigation to:`, href)
              console.log(`🔍 Phase Navigation - CLICK EVENT: Phase accessible:`, isAccessible)
              console.log(`🔍 Phase Navigation - CLICK EVENT: Current pathname:`, pathname)
              
              if (!isAccessible) {
                console.log(`🔍 Phase Navigation - CLICK EVENT: Navigation blocked due to inaccessible phase`)
                e.preventDefault()
                return
              }
              
              console.log(`🔍 Phase Navigation - CLICK EVENT: Navigation proceeding to:`, href)
            }}
        >
          {phase.name}
        </Link>
        )
      })}
    </div>
  )
}
