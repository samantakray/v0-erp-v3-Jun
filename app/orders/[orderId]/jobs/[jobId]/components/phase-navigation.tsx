"use client"

import { useJob } from "../layout"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function PhaseNavigation({ orderId, jobId }: { orderId: string; jobId: string }) {
  const job = useJob()
  const pathname = usePathname()

  const phases = [
    { name: "Stone Selection", path: "stone-selection", status: "stone" },
    { name: "Diamond Selection", path: "diamond-selection", status: "diamond" },
    { name: "Manufacturer", path: "manufacturer", status: "manufacturer" },
    { name: "Quality Check", path: "quality-check", status: "quality-check" },
    { name: "Complete", path: "complete", status: "complete" },
  ]

  // Determine which phases are accessible based on job status
  const isPhaseAccessible = (phaseStatus: string) => {
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
  }

  return (
    <div className="flex border-b mb-6">
      {phases.map((phase) => (
        <Link
          key={phase.path}
          href={`/orders/${orderId}/jobs/${jobId}/${phase.path}`}
          className={cn(
            "px-4 py-2 text-sm font-medium",
            pathname.includes(phase.path) ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
            !isPhaseAccessible(phase.status) && "opacity-50 pointer-events-none",
          )}
        >
          {phase.name}
        </Link>
      ))}
    </div>
  )
}
