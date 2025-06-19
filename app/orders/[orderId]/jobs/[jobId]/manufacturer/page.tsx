"use client"

import { useState, use } from "react"
import { useJob } from "@/components/job-context-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StickerPreview } from "@/components/sticker-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { JOB_PHASE } from "@/constants/job-workflow"
import { updateJobPhase } from "@/app/actions/job-actions"
import { logger } from "@/lib/logger"

// Mock manufacturers data
const MANUFACTURERS = [
  {
    id: "m1",
    name: "Elegant Creations Ltd.",
    currentLoad: 12,
    pastJobCount: 156,
    rating: 4.8,
  },
  {
    id: "m2",
    name: "Precision Jewelry Co.",
    currentLoad: 8,
    pastJobCount: 98,
    rating: 4.5,
  },
  {
    id: "m3",
    name: "Golden Touch Manufacturers",
    currentLoad: 15,
    pastJobCount: 203,
    rating: 4.7,
  },
  {
    id: "m4",
    name: "Diamond Craft Industries",
    currentLoad: 5,
    pastJobCount: 87,
    rating: 4.9,
  },
]

export default function ManufacturerPage({ params }: { params: Promise<{ jobId: string; orderId: string }> }) {
  // Console log for debugging - unwrap params using React.use()
  const { jobId, orderId } = use(params)
  console.log("🔍 ManufacturerPage - Client Component executing")
  console.log("🔍 ManufacturerPage - jobId:", jobId, "orderId:", orderId)

  const job = useJob()
  const router = useRouter()
  const [manufacturerData, setManufacturerData] = useState({
    manufacturerId: "",
    expectedCompletion: "",
  })
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssignManufacturer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manufacturerData.manufacturerId || !manufacturerData.expectedCompletion || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const selectedManufacturer = MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)

      if (!selectedManufacturer) {
        throw new Error("Selected manufacturer not found")
      }

      // Prepare the data for the server action
      const phaseData = {
        manufacturerId: manufacturerData.manufacturerId,
        manufacturerName: selectedManufacturer.name,
        expectedCompletion: manufacturerData.expectedCompletion,
      }

      // Call the server action to update the job phase
      const result = await updateJobPhase(job.id, JOB_PHASE.MANUFACTURER, phaseData)

      if (!result.success) {
        throw new Error(result.error || "Failed to assign manufacturer")
      }

      // Set the sticker data for preview
      setStickerData({
        Manufacturer: selectedManufacturer.name,
        "Expected Completion": new Date(manufacturerData.expectedCompletion).toLocaleDateString(),
      })
      setPreview(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign manufacturer. Please try again."
      logger.error("Error assigning manufacturer:", { error })
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    // Navigate to the next phase
    router.push(`/orders/${orderId}/jobs/${jobId}/${JOB_PHASE.QUALITY_CHECK}`)
  }

  return (
    <div className="space-y-6">
      <JobHeader orderId={orderId} />
      <PhaseNavigation orderId={orderId} jobId={jobId} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manufacturer Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignManufacturer} className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Current Load</TableHead>
                      <TableHead>Past Jobs</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Select</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MANUFACTURERS.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>{m.currentLoad} jobs</TableCell>
                        <TableCell>{m.pastJobCount} jobs</TableCell>
                        <TableCell>{m.rating}/5</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManufacturerData({ ...manufacturerData, manufacturerId: m.id })}
                            className={
                              manufacturerData.manufacturerId === m.id ? "bg-primary text-primary-foreground" : ""
                            }
                          >
                            {manufacturerData.manufacturerId === m.id ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCompletion">Expected Completion Date</Label>
                <Input
                  id="expectedCompletion"
                  type="date"
                  value={manufacturerData.expectedCompletion}
                  onChange={(e) => setManufacturerData({ ...manufacturerData, expectedCompletion: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Assign Manufacturer"}
              </Button>
            </div>
          </form>
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
        phase="manufacturer"
        data={stickerData}
      />
    </div>
  )
}
