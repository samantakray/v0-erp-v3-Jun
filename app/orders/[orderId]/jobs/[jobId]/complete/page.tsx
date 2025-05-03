"use client"

import { useState } from "react"
import { useJob } from "../layout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StickerPreview } from "@/components/sticker-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { updateJobPhase } from "@/app/actions/job-actions"
import { JOB_PHASE } from "@/constants/job-workflow"
import { logger } from "@/lib/logger"

export default function CompletePage({ params }: { params: { jobId: string; orderId: string } }) {
  const job = useJob()
  const router = useRouter()
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompleteJob = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare the data for the server action
      const phaseData = {
        completionDate: new Date().toISOString(),
        finalStatus: "Completed",
      }

      // Call the server action to update the job phase
      const result = await updateJobPhase(job.id, JOB_PHASE.COMPLETE, phaseData)

      if (!result.success) {
        throw new Error(result.error || "Failed to complete job")
      }

      // Set the sticker data for preview
      setStickerData({
        "Completion Date": new Date().toLocaleDateString(),
        "Final Status": "Completed",
      })
      setPreview(true)
    } catch (error) {
      logger.error("Error completing job:", error)
      setError(error.message || "Failed to complete job. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    // Navigate back to the order
    router.push(`/orders/${params.orderId}`)
  }

  // Mock data for summary
  const stoneData = { lotNumber: "LOT-S001", stoneCount: "12", totalWeight: "24.5" }
  const diamondData = { lotNumber: "LOT-D002", karat: "18K", clarity: "VS1", diamondCount: "8", totalWeight: "3.2" }
  const manufacturerData = { name: "Elegant Creations Ltd.", expectedCompletion: "2023-12-15" }
  const qcData = { measuredWeight: "27.8", notes: "Excellent finish", passed: true }

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
          <CardTitle>Job Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">Stone Selection</h3>
                <div className="text-sm text-muted-foreground">
                  {stoneData.lotNumber ? (
                    <>
                      <p>Lot: {stoneData.lotNumber}</p>
                      <p>Count: {stoneData.stoneCount}</p>
                      <p>Weight: {stoneData.totalWeight}g</p>
                    </>
                  ) : (
                    <p>Not completed</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Diamond Selection</h3>
                <div className="text-sm text-muted-foreground">
                  {diamondData.lotNumber ? (
                    <>
                      <p>Lot: {diamondData.lotNumber}</p>
                      <p>Karat: {diamondData.karat}</p>
                      <p>Clarity: {diamondData.clarity}</p>
                      <p>Count: {diamondData.diamondCount}</p>
                      <p>Weight: {diamondData.totalWeight}g</p>
                    </>
                  ) : (
                    <p>Not completed</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Manufacturer</h3>
                <div className="text-sm text-muted-foreground">
                  {manufacturerData.name ? (
                    <>
                      <p>Selected: {manufacturerData.name}</p>
                      <p>
                        Expected Completion:{" "}
                        {manufacturerData.expectedCompletion
                          ? new Date(manufacturerData.expectedCompletion).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </>
                  ) : (
                    <p>Not assigned</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Quality Check</h3>
                <div className="text-sm text-muted-foreground">
                  {qcData.measuredWeight ? (
                    <>
                      <p>Result: {qcData.passed === null ? "Pending" : qcData.passed ? "PASSED" : "FAILED"}</p>
                      <p>Measured Weight: {qcData.measuredWeight}g</p>
                      {qcData.notes && <p>Notes: {qcData.notes}</p>}
                    </>
                  ) : (
                    <p>Not completed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <Button onClick={handleCompleteJob} disabled={job.status === "Completed" || isSubmitting}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Mark Job as Complete"}
            </Button>
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
        phase="complete"
        data={stickerData}
      />
    </div>
  )
}
