"use client"

import { useState, use, useEffect } from "react"
import { useJob } from "@/components/job-context-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { StickerPreview } from "@/components/sticker-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, CheckCircle2, PlusCircle } from "lucide-react"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import GoldUsageRow from "@/components/gold-usage-row"
import DiamondUsageRow from "@/components/diamond-usage-row"
import ColoredStoneUsageRow from "@/components/colored-stone-usage-row"
import { fetchStoneLots, fetchDiamondLots } from "@/lib/api-service"
import { JOB_PHASE } from "@/constants/job-workflow"
import { updateJobPhase } from "@/app/actions/job-actions"
import { logger } from "@/lib/logger"
import type { QCData, GoldUsageDetail, DiamondUsageDetail, ColoredStoneUsageDetail, StoneLotData, DiamondLotData } from "@/types"

export default function QualityCheckPage({ params }: { params: Promise<{ jobId: string; orderId: string }> }) {
  const { jobId, orderId } = use(params)
  const job = useJob()
  const router = useRouter()

  const [qcData, setQcData] = useState<QCData>({
    measuredWeight: "",
    notes: "",
    passed: null,
    goldUsage: [],
    diamondUsage: [],
    coloredStoneUsage: [],
  })
  const [stoneLots, setStoneLots] = useState<StoneLotData[]>([])
  const [diamondLots, setDiamondLots] = useState<DiamondLotData[]>([])
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<any>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const [stones, diamonds] = await Promise.all([fetchStoneLots(), fetchDiamondLots()])
        setStoneLots(stones)
        setDiamondLots(diamonds)
      } catch (err) {
        setError("Failed to fetch master data for lots.")
        logger.error("Failed to fetch stone/diamond lots", { error: err })
      }
    }
    fetchData()
  }, [])

  const handleAddRow = (type: "gold" | "diamond" | "stone") => {
    const clientId = `new-${Date.now()}`
    if (type === "gold") {
      setQcData(prev => ({ ...prev, goldUsage: [...prev.goldUsage, { clientId, description: "", grossWeight: 0, scrapWeight: 0 }] }))
    } else if (type === "diamond") {
      setQcData(prev => ({ ...prev, diamondUsage: [...prev.diamondUsage, { clientId, type: "", returnQuantity: 0, returnWeight: 0, lossQuantity: 0, lossWeight: 0, breakQuantity: 0, breakWeight: 0 }] }))
    } else {
      setQcData(prev => ({ ...prev, coloredStoneUsage: [...prev.coloredStoneUsage, { clientId, type: "", returnQuantity: 0, returnWeight: 0, lossQuantity: 0, lossWeight: 0, breakQuantity: 0, breakWeight: 0 }] }))
    }
  }

  const handleDeleteRow = (type: "gold" | "diamond" | "stone", index: number) => {
    if (type === "gold") {
      setQcData(prev => ({ ...prev, goldUsage: prev.goldUsage.filter((_, i) => i !== index) }))
    } else if (type === "diamond") {
      setQcData(prev => ({ ...prev, diamondUsage: prev.diamondUsage.filter((_, i) => i !== index) }))
    } else {
      setQcData(prev => ({ ...prev, coloredStoneUsage: prev.coloredStoneUsage.filter((_, i) => i !== index) }))
    }
  }

  const handleRowChange = (type: "gold" | "diamond" | "stone", index: number, field: string, value: any) => {
    if (type === "gold") {
      const updatedRows = [...qcData.goldUsage]
      updatedRows[index] = { ...updatedRows[index], [field]: value }
      setQcData(prev => ({ ...prev, goldUsage: updatedRows }))
    } else if (type === "diamond") {
      const updatedRows = [...qcData.diamondUsage]
      updatedRows[index] = { ...updatedRows[index], [field]: value }
      setQcData(prev => ({ ...prev, diamondUsage: updatedRows }))
    } else {
      const updatedRows = [...qcData.coloredStoneUsage]
      updatedRows[index] = { ...updatedRows[index], [field]: value }
      setQcData(prev => ({ ...prev, coloredStoneUsage: updatedRows }))
    }
  }

  const handleCompleteQC = async (passed: boolean) => {
    if (!qcData.measuredWeight || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setValidationErrors({})

    try {
      const phaseData = {
        ...qcData,
        measuredWeight: Number.parseFloat(qcData.measuredWeight as string),
        passed: passed,
      }

      const result = await updateJobPhase(job.id, JOB_PHASE.QUALITY_CHECK, phaseData)

      if (!result.success) {
        if (result.details) {
          setValidationErrors(result.details)
          throw new Error("Validation failed. Please check the fields.")
        } else {
          throw new Error(result.error || "Failed to complete quality check")
        }
      }

      setStickerData({
        "QC Result": passed ? "PASSED" : "FAILED",
        "Measured Weight": `${qcData.measuredWeight}g`,
        Notes: qcData.notes || "None",
      })
      setPreview(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
      logger.error("Error completing quality check", { error })
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    if (qcData.passed) {
      router.push(`/orders/${orderId}/jobs/${jobId}/${JOB_PHASE.COMPLETE}`)
    }
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
        <CardHeader><CardTitle>Quality Check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
                value={qcData.measuredWeight as string}
                onChange={(e) => setQcData({ ...qcData, measuredWeight: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="qcNotes">Quality Check Notes</Label>
              <Textarea id="qcNotes" value={qcData.notes} onChange={(e) => setQcData({ ...qcData, notes: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gold Usage</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddRow("gold")}><PlusCircle className="mr-2 h-4 w-4" />Add Row</Button>
        </CardHeader>
        <CardContent>
          {qcData.goldUsage.map((row, index) => (
            <GoldUsageRow key={row.clientId} index={index} usage={row} onChange={(...args) => handleRowChange("gold", ...args)} onDelete={() => handleDeleteRow("gold", index)} isSubmitting={isSubmitting} validationErrors={validationErrors.goldUsage?.[index] || {}} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diamond Usage</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddRow("diamond")}><PlusCircle className="mr-2 h-4 w-4" />Add Row</Button>
        </CardHeader>
        <CardContent>
          {qcData.diamondUsage.map((row, index) => (
            <DiamondUsageRow key={row.clientId} index={index} usage={row} diamondLots={diamondLots} onChange={(...args) => handleRowChange("diamond", ...args)} onDelete={() => handleDeleteRow("diamond", index)} isSubmitting={isSubmitting} validationErrors={validationErrors.diamondUsage?.[index] || {}} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Colored Stone Usage</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleAddRow("stone")}><PlusCircle className="mr-2 h-4 w-4" />Add Row</Button>
        </CardHeader>
        <CardContent>
          {qcData.coloredStoneUsage.map((row, index) => (
            <ColoredStoneUsageRow key={row.clientId} index={index} usage={row} stoneLots={stoneLots} onChange={(...args) => handleRowChange("stone", ...args)} onDelete={() => handleDeleteRow("stone", index)} isSubmitting={isSubmitting} validationErrors={validationErrors.coloredStoneUsage?.[index] || {}} />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="destructive" onClick={() => handleCompleteQC(false)} disabled={!qcData.measuredWeight || isSubmitting}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Fail QC"}
        </Button>
        <Button onClick={() => handleCompleteQC(true)} disabled={!qcData.measuredWeight || isSubmitting}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Pass QC"}
        </Button>
      </div>

      <StickerPreview open={preview} onOpenChange={setPreview} jobId={job.id} phase="quality-check" data={stickerData} />
    </div>
  )
}