"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { JOB_STATUS, PHASE_INFO } from "@/constants/job-workflow"

interface NextTaskModuleProps {
  selectedTeam: string
  jobs: any[]
  onProcessJob: (job: any) => void
}

export function NextTaskModule({ selectedTeam, jobs, onProcessJob }: NextTaskModuleProps) {
  // Memoize the next task calculation
  const nextTask = useMemo(() => {
    // Map team to the job status it should work on
    const teamStatusMap = {
      bag: JOB_STATUS.NEW,
      stone: JOB_STATUS.BAG_CREATED,
      diamond: JOB_STATUS.STONE_SELECTED,
      manufacturer: JOB_STATUS.DIAMOND_SELECTED,
      qc: JOB_STATUS.IN_PRODUCTION,
    }

    // Filter jobs based on team
    const filteredJobs = jobs.filter((job) => job.status === teamStatusMap[selectedTeam])

    // Find the earliest due job without mutating the original array
    return filteredJobs.reduce(
      (soonest, job) => {
        if (!soonest) return job
        return new Date(job.dueDate).getTime() < new Date(soonest.dueDate).getTime() ? job : soonest
      },
      null as (typeof filteredJobs)[0] | null,
    )
  }, [jobs, selectedTeam])

  // Get badge color based on job status
  const getBadgeColor = (status: string) => {
    return PHASE_INFO[status]?.color || "bg-gray-500"
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4 border">
      {nextTask ? (
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-16 h-16 rounded-md overflow-hidden">
            <img
              src={nextTask.image || "/placeholder.svg"}
              alt={nextTask.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div>
                <h4 className="font-medium">
                  {nextTask.id} - {nextTask.name}
                </h4>
                <p className="text-sm text-muted-foreground">SKU: {nextTask.skuId}</p>
              </div>
              <Badge className={cn("text-white md:ml-auto", getBadgeColor(nextTask.status))}>{nextTask.status}</Badge>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:items-center text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Due: {new Date(nextTask.dueDate).toLocaleDateString()}</span>
              </div>
              <Separator className="hidden md:block h-4 w-[1px] mx-2" orientation="vertical" />
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Production: {new Date(nextTask.productionDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => onProcessJob(nextTask)}>Process Now</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p>No pending tasks for your team at this time.</p>
        </div>
      )}
    </div>
  )
}
