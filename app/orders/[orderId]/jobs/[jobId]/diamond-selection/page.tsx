"use client"

import { useState, use } from "react"
import { useJob } from "@/components/job-context-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StickerPreview } from "@/components/sticker-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { JOB_PHASE } from "@/constants/job-workflow"
import { updateJobPhase } from "@/app/actions/job-actions"
import { logger } from "@/lib/logger"

// Mock diamond lots
const DIAMOND_LOTS = ["LOT-D001", "LOT-D002", "LOT-D003", "LOT-D004"]

export default function DiamondSelectionPage({ params }: { params: Promise<{ jobId: string; orderId: string }> }) {
  // Console log for debugging - unwrap params using React.use()
  const { jobId, orderId } = use(params)
  console.log("🔍 DiamondSelectionPage - Client Component executing")
  console.log("🔍 DiamondSelectionPage - jobId:", jobId, "orderId:", orderId)

  const job = useJob()
  const router = useRouter()
  const [diamondData, setDiamondData] = useState({
    lotNumber: "",
    karat: "",
    clarity: "",
    diamondCount: "",
    totalWeight: "",
  })
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompleteDiamondSelection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !diamondData.lotNumber ||
      !diamondData.karat ||
      !diamondData.clarity ||
      !diamondData.diamondCount ||
      !diamondData.totalWeight ||
      isSubmitting
    ) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare the data for the server action
      const phaseData = {
        lotNumber: diamondData.lotNumber,
        karat: diamondData.karat,
        clarity: diamondData.clarity,
        diamondCount: Number.parseInt(diamondData.diamondCount),
        totalWeight: Number.parseFloat(diamondData.totalWeight),
      }

      // Call the server action to update the job phase
      const result = await updateJobPhase(job.id, JOB_PHASE.DIAMOND, phaseData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update diamond selection")
      }

      // Set the sticker data for preview
      setStickerData({
        "Lot Number": diamondData.lotNumber,
        Karat: diamondData.karat,
        Clarity: diamondData.clarity,
        "Diamond Count": diamondData.diamondCount,
        "Total Weight": `${diamondData.totalWeight}g`,
      })
      setPreview(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete diamond selection. Please try again."
      logger.error("Error submitting diamond selection:", { error })
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    // Navigate to the next phase
    router.push(`/orders/${orderId}/jobs/${jobId}/${JOB_PHASE.MANUFACTURER}`)
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
          <CardTitle>Diamond Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCompleteDiamondSelection} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diamondLot">Diamond Lot Number</Label>
                <Select
                  value={diamondData.lotNumber}
                  onValueChange={(value) => setDiamondData({ ...diamondData, lotNumber: value })}
                >
                  <SelectTrigger id="diamondLot">
                    <SelectValue placeholder="Select diamond lot" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAMOND_LOTS.map((lot) => (
                      <SelectItem key={lot} value={lot}>
                        {lot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondKarat">Karat</Label>
                <Input
                  id="diamondKarat"
                  value={diamondData.karat}
                  onChange={(e) => setDiamondData({ ...diamondData, karat: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondClarity">Clarity</Label>
                <Select
                  value={diamondData.clarity}
                  onValueChange={(value) => setDiamondData({ ...diamondData, clarity: value })}
                >
                  <SelectTrigger id="diamondClarity">
                    <SelectValue placeholder="Select clarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IF">IF (Internally Flawless)</SelectItem>
                    <SelectItem value="VVS1">VVS1 (Very Very Slightly Included 1)</SelectItem>
                    <SelectItem value="VVS2">VVS2 (Very Very Slightly Included 2)</SelectItem>
                    <SelectItem value="VS1">VS1 (Very Slightly Included 1)</SelectItem>
                    <SelectItem value="VS2">VS2 (Very Slightly Included 2)</SelectItem>
                    <SelectItem value="SI1">SI1 (Slightly Included 1)</SelectItem>
                    <SelectItem value="SI2">SI2 (Slightly Included 2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondCount">Number of Diamonds</Label>
                <Input
                  id="diamondCount"
                  type="number"
                  value={diamondData.diamondCount}
                  onChange={(e) => setDiamondData({ ...diamondData, diamondCount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamondTotalWeight">Total Weight (g)</Label>
                <Input
                  id="diamondTotalWeight"
                  type="number"
                  step="0.01"
                  value={diamondData.totalWeight}
                  onChange={(e) => setDiamondData({ ...diamondData, totalWeight: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Complete Diamond Selection"}
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
        phase="diamond"
        data={stickerData}
      />
    </div>
  )
}
