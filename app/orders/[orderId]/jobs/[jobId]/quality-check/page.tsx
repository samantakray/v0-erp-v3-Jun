"use client"

import { useState } from "react"
import { useJob } from "../layout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { StickerPreview } from "@/components/sticker-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { JOB_PHASE } from "@/constants/job-workflow"
import { updateJobPhase } from "@/app/actions/job-actions"
import { logger } from "@/lib/logger"

export default function QualityCheckPage({ params }: { params: { jobId: string; orderId: string } }) {
  const job = useJob()
  const router = useRouter()
  const [qcData, setQcData] = useState({
    measuredWeight: "",
    notes: "",
    passed: null as boolean | null,
  })
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompleteQC = async (passed: boolean) => {
    if (!qcData.measuredWeight || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Update local state
      setQcData({ ...qcData, passed })

      // Prepare the data for the server action
      const phaseData = {
        measuredWeight: Number.parseFloat(qcData.measuredWeight),
        notes: qcData.notes,
        passed: passed,
      }

      // Call the server action to update the job phase
      const result = await updateJobPhase(job.id, JOB_PHASE.QC, phaseData)

      if (!result.success) {
        throw new Error(result.error || "Failed to complete quality check")
      }

      // Set the sticker data for preview
      setStickerData({
        "QC Result": passed ? "PASSED" : "FAILED",
        "Measured Weight": `${qcData.measuredWeight}g`,
        Notes: qcData.notes || "None",
      })
      setPreview(true)
    } catch (error) {
      logger.error("Error completing quality check:", error)
      setError(error.message || "Failed to complete quality check. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    // Navigate to the next phase if passed
    if (qcData.passed) {
      router.push(`/orders/${params.orderId}/jobs/${params.jobId}/${JOB_PHASE.COMPLETE}`)
    }
  }

  return (
    <div className="space-y-6">
      <JobHeader orderId={params.orderId} />
      <PhaseNavigation orderId={params.orderId} jobId={params.jobId} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quality Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedWeight">Expected Weight (g)</Label>
                <Input id="expectedWeight" value={job.stoneType === "None" ? "15.5" : "18.2"} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="measuredWeight">Measured Weight (g)</Label>
                <Input
                  id="measuredWeight"
                  type="number"
                  step="0.01"
                  value={qcData.measuredWeight}
                  onChange={(e) => setQcData({ ...qcData, measuredWeight: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="qcNotes">Quality Check Notes</Label>
                <Textarea
                  id="qcNotes"
                  value={qcData.notes}
                  onChange={(e) => setQcData({ ...qcData, notes: e.target.value })}
                  placeholder="Enter any notes about the quality check..."
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => handleCompleteQC(false)}
                disabled={!qcData.measuredWeight || isSubmitting}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Fail QC"}
              </Button>
              <Button
                variant="default"
                onClick={() => handleCompleteQC(true)}
                disabled={!qcData.measuredWeight || isSubmitting}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Pass QC"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StickerPreview
        open={preview}
        onOpenChange={(open) => {
          if (!open) {
            handleStickerClose()
          }
        }}
        jobId={job.id}
        phase="quality-check"
        data={stickerData}
      />
    </div>
  )
}
