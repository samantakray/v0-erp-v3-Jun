"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StickerPreview } from "@/components/sticker-preview"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"

const STATUS_COLORS = {
  [JOB_STATUS.NEW]: "secondary",
  [JOB_STATUS.BAG_CREATED]: "default",
  [JOB_STATUS.STONE_SELECTED]: "primary",
  [JOB_STATUS.DIAMOND_SELECTED]: "primary",
  [JOB_STATUS.IN_PRODUCTION]: "warning",
  [JOB_STATUS.SENT_TO_MANUFACTURER]: "warning",
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: "warning",
  [JOB_STATUS.QC_PASSED]: "success",
  [JOB_STATUS.QC_FAILED]: "destructive",
  [JOB_STATUS.COMPLETED]: "success",
}

export function JobDetailSheet({ job, open, onOpenChange }) {
  const [jobStatus, setJobStatus] = useState(job?.status || JOB_STATUS.NEW)
  const [currentPhase, setCurrentPhase] = useState(JOB_PHASE.STONE)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [stickerOpen, setStickerOpen] = useState(false)
  const [stickerData, setStickerData] = useState<Record<string, any>>({})

  // Determine the current phase based on job status
  useEffect(() => {
    if (!job) return
    switch (job.status) {
      case JOB_STATUS.NEW:
      case JOB_STATUS.BAG_CREATED:
        setCurrentPhase(JOB_PHASE.STONE)
        break
      case JOB_STATUS.STONE_SELECTED:
        setCurrentPhase(JOB_PHASE.DIAMOND)
        break
      case JOB_STATUS.DIAMOND_SELECTED:
        setCurrentPhase(JOB_PHASE.MANUFACTURER)
        break
      case JOB_STATUS.IN_PRODUCTION:
      case JOB_STATUS.SENT_TO_MANUFACTURER:
      case JOB_STATUS.RECEIVED_FROM_MANUFACTURER:
        setCurrentPhase(JOB_PHASE.MANUFACTURER)
        break
      case JOB_STATUS.QC_PASSED:
      case JOB_STATUS.QC_FAILED:
        setCurrentPhase(JOB_PHASE.QC)
        break
      case JOB_STATUS.COMPLETED:
        setCurrentPhase(JOB_PHASE.COMPLETE)
        break
      default:
        setCurrentPhase(JOB_PHASE.STONE)
    }
  }, [job])

  useEffect(() => {
    if (job) setJobStatus(job.status)
  }, [job])

  const openImageDialog = (image: string | null) => {
    setSelectedImage(image)
    setImageDialogOpen(true)
  }

  const handleCompleteWork = (data: any) => {
    /* existing handlers */
  }

  if (!job || !open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background">{/* ... other UI elements remain unchanged ... */}</div>

      {/* Updated Image Dialog with Job ID and Status */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Job {job.id} <Badge variant={STATUS_COLORS[jobStatus]}>{jobStatus}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {selectedImage && (
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={`Job ${job.id}`}
                className="max-w-full max-h-[500px] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <StickerPreview
        open={stickerOpen}
        onOpenChange={setStickerOpen}
        jobId={job.id}
        phase={currentPhase}
        data={stickerData}
      />
    </>
  )
}
