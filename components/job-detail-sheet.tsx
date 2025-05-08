// ./components/job-detail-sheet.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, CheckCircle2, Factory, Package, AlertTriangle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Stepper, type Step } from "@/components/ui/stepper"
import { StickerPreview } from "@/components/sticker-preview"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updateJobPhase } from "@/app/actions/job-actions"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"
import { logger } from "@/lib/logger"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

// Mock stone lots
const STONE_LOTS = ["LOT-S001", "LOT-S002", "LOT-S003", "LOT-S004"]

// Mock diamond lots
const DIAMOND_LOTS = ["LOT-D001", "LOT-D002", "LOT-D003", "LOT-D004"]

// LotRow Component
interface LotRowProps {
  value: {
    lot: string
    qty: number
    wt: string
  }
  onChange: (key: string, value: string | number) => void
  onDelete: () => void
}

function LotRow({ value, onChange, onDelete }: LotRowProps) {
  logger.debug("Rendering LotRow component", { value })
  return (
    <div className="lot-row">
      <input value={value.lot} onChange={(e) => onChange("lot", e.target.value)} placeholder="LOT-001" required />
      <input
        type="number"
        value={value.qty || ""}
        onChange={(e) => onChange("qty", +e.target.value)}
        min={1}
        required
      />
      <input value={value.wt} onChange={(e) => onChange("wt", e.target.value)} placeholder="0.00" required />
      <button type="button" onClick={onDelete}>
        —
      </button>
    </div>
  )
}

// Stone Selection View Component
interface Allocation {
  lot: string
  qty: number
  wt: string
}

function StoneSelectionView({ job, onClose }) {
  logger.debug("Rendering StoneSelectionView component", { jobId: job.id })
  const [allocs, setAllocs] = useState<Allocation[]>([{ lot: "", qty: 0, wt: "" }])
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus first input when component mounts
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [])

  const add = () => {
    logger.debug("Adding new allocation row")
    setAllocs([...allocs, { lot: "", qty: 0, wt: "" }])
  }

  const del = (i: number) => {
    logger.debug("Deleting allocation row", { index: i })
    setAllocs(allocs.filter((_, idx) => idx !== i))
  }

  const edit = (i: number, k: string, v: string | number) => {
    logger.debug("Editing allocation row", { index: i, key: k, value: v })
    setAllocs(allocs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))
  }

  const isValid = allocs.every((a) => a.lot && a.qty > 0 && +a.wt > 0)

  async function submit(e) {
    e.preventDefault()
    logger.debug("Stone allocation form submitted", { isValid, isSubmitting })

    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Format allocation data
      const allocationsData = allocs.map((a) => ({
        lotNumber: a.lot,
        quantity: a.qty,
        weight: Number.parseFloat(a.wt),
      }))

      // Log before calling the server action
      logger.debug("Calling updateJobPhase from StoneSelectionView", {
        jobId: job.id,
        phase: JOB_PHASE.STONE,
        allocationsData,
      })

      // Call the server action
      const result = await updateJobPhase(job.id, JOB_PHASE.STONE, {
        allocations: allocationsData,
        timestamp: new Date().toISOString(),
      })

      // Log the result
      logger.info("updateJobPhase response in StoneSelectionView", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Set sticker data and show preview
      setStickerData(
        Object.fromEntries(allocs.map((a, i) => [`Lot ${i + 1}`, `${a.lot} (${a.qty} stones, ${a.wt} ct)`])),
      )
      setPreview(true)
    } catch (error) {
      logger.error("Error submitting stone allocation:", {
        data: { jobId: job.id, allocations: allocs },
        error,
      })
      setError("Failed to submit allocation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e, index) => {
    // If Enter is pressed on the last row's weight field and form is valid, submit
    if (e.key === "Enter" && index === allocs.length - 1 && isValid) {
      submit(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="w-24 h-24 rounded-md overflow-hidden">
          <img src={job.image || "/placeholder.svg"} alt={job.skuId} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{job.skuId}</h3>
          <p className="text-sm text-muted-foreground">Stone type(s): {job.stoneType || "N/A"}</p>
          <p className="text-sm text-muted-foreground">Job #{job.id}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* allocation form */}
      <form onSubmit={submit} className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-semibold mb-4">Allocate Stones</h3>
          <div className="grid grid-cols-4 gap-4 mb-2 font-medium text-sm">
            <div>Lot #</div>
            <div># Stones</div>
            <div>Total Wt (ct)</div>
            <div></div>
          </div>
          {allocs.map((row, i) => (
            <div key={i} className="mb-2">
              <LotRow value={row} onChange={(k, v) => edit(i, k, v)} onDelete={() => allocs.length > 1 && del(i)} />
              {i === allocs.length - 1 && (
                <input
                  type="text"
                  className="hidden-submit-trigger"
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  tabIndex={-1}
                  style={{ position: "absolute", opacity: 0 }}
                />
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={add} className="mt-2">
            + Add Lot
          </Button>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Allocation"
            )}
          </Button>
        </div>
      </form>

      {/* sticker */}
      <StickerPreview
        open={preview}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(false)
            onClose()
          }
        }}
        jobId={job.id}
        phase={JOB_PHASE.STONE}
        data={stickerData}
      />
    </div>
  )
}

export function JobDetailSheet({ job, open, onOpenChange }) {
  logger.debug("Rendering JobDetailSheet component", { jobId: job?.id, open })

  const [currentPhase, setCurrentPhase] = useState(JOB_PHASE.STONE)
  const [jobStatus, setJobStatus] = useState(job?.status || JOB_STATUS.NEW)
  const [manufacturer, setManufacturer] = useState(job?.manufacturer || "Pending")
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [stickerOpen, setStickerOpen] = useState(false)
  const [stickerData, setStickerData] = useState({})

  // Loading states
  const [isSubmittingStone, setIsSubmittingStone] = useState(false)
  const [isSubmittingDiamond, setIsSubmittingDiamond] = useState(false)
  const [isSubmittingManufacturer, setIsSubmittingManufacturer] = useState(false)
  const [isSubmittingQC, setIsSubmittingQC] = useState(false)
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false)

  // Error states
  const [stoneError, setStoneError] = useState<string | null>(null)
  const [diamondError, setDiamondError] = useState<string | null>(null)
  const [manufacturerError, setManufacturerError] = useState<string | null>(null)
  const [qcError, setQCError] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)

  // Form states for each phase
  const [stoneData, setStoneData] = useState({
    lotNumber: "",
    stoneCount: "",
    totalWeight: "",
  })

  const [diamondData, setDiamondData] = useState({
    lotNumber: "",
    karat: "",
    clarity: "",
    diamondCount: "",
    totalWeight: "",
  })

  const [manufacturerData, setManufacturerData] = useState({
    manufacturerId: "",
    expectedCompletion: "",
  })

  const [qcData, setQcData] = useState({
    measuredWeight: "",
    notes: "",
    passed: null,
  })

  // Determine the current phase based on job status
  useEffect(() => {
    logger.debug("Determining current phase based on job status", { status: job?.status })
    if (job) {
      switch (job.status) {
        case JOB_STATUS.NEW:
        case "New Job": // For backward compatibility
          setCurrentPhase(JOB_PHASE.STONE)
          break
        case JOB_STATUS.STONE_SELECTED:
        case "Stone Selected": // For backward compatibility
          setCurrentPhase(JOB_PHASE.DIAMOND)
          break
        case JOB_STATUS.DIAMOND_SELECTED:
        case "Diamond Selected": // For backward compatibility
          setCurrentPhase(JOB_PHASE.MANUFACTURER)
          break
        case JOB_STATUS.SENT_TO_MANUFACTURER:
        case JOB_STATUS.IN_PRODUCTION:
        case "In Production": // For backward compatibility
        case "Sent to Manufacturer": // For backward compatibility
          setCurrentPhase(JOB_PHASE.QUALITY_CHECK)
          break
        case JOB_STATUS.QC_PASSED:
        case JOB_STATUS.QC_FAILED:
        case JOB_STATUS.COMPLETED:
        case "Quality Check": // For backward compatibility
        case "Completed": // For backward compatibility
          setCurrentPhase(JOB_PHASE.COMPLETE)
          break
        default:
          setCurrentPhase(JOB_PHASE.STONE)
      }
    }
  }, [job])

  // Generate steps for the stepper
  const getSteps = (): Step[] => {
    logger.debug("Generating steps for stepper", { currentPhase })

    const phases = [
      { id: JOB_PHASE.STONE, label: "Stone" },
      { id: JOB_PHASE.DIAMOND, label: "Diamond" },
      { id: JOB_PHASE.MANUFACTURER, label: "Manufacturer" },
      { id: JOB_PHASE.QUALITY_CHECK, label: "QC" },
      { id: JOB_PHASE.COMPLETE, label: "Complete" },
    ]

    return phases.map((phase) => {
      if (phase.id === currentPhase) {
        return { ...phase, status: "current" as const }
      } else if (
        (currentPhase === JOB_PHASE.DIAMOND && phase.id === JOB_PHASE.STONE) ||
        (currentPhase === JOB_PHASE.MANUFACTURER && (phase.id === JOB_PHASE.STONE || phase.id === JOB_PHASE.DIAMOND)) ||
        (currentPhase === JOB_PHASE.QUALITY_CHECK &&
          (phase.id === JOB_PHASE.STONE || phase.id === JOB_PHASE.DIAMOND || phase.id === JOB_PHASE.MANUFACTURER)) ||
        currentPhase === JOB_PHASE.COMPLETE
      ) {
        return { ...phase, status: "completed" as const }
      }
      return { ...phase, status: "upcoming" as const }
    })
  }

  const handleStepClick = (stepId: string) => {
    logger.debug("Step clicked", { stepId })
    // Only allow clicking on completed steps or the current step
    const steps = getSteps()
    const step = steps.find((s) => s.id === stepId)
    if (step && (step.status === "completed" || step.status === "current")) {
      setCurrentPhase(stepId)
    }
  }

  const openImageDialog = (image) => {
    logger.debug("Opening image dialog", { image })
    setSelectedImage(image)
    setImageDialogOpen(true)
  }

  const handleCompleteStoneSelection = async () => {
    logger.debug("handleCompleteStoneSelection called", { stoneData })

    if (!stoneData.lotNumber || !stoneData.stoneCount || !stoneData.totalWeight) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmittingStone(true)
    setStoneError(null)

    try {
      // Log before calling the server action
      logger.debug("Calling updateJobPhase from job-detail-sheet", {
        jobId: job.id,
        phase: JOB_PHASE.STONE,
        data: {
          lotNumber: stoneData.lotNumber,
          quantity: Number.parseInt(stoneData.stoneCount),
          weight: Number.parseFloat(stoneData.totalWeight),
        },
      })

      // Call the server action
      const result = await updateJobPhase(job.id, JOB_PHASE.STONE, {
        lotNumber: stoneData.lotNumber,
        quantity: Number.parseInt(stoneData.stoneCount),
        weight: Number.parseFloat(stoneData.totalWeight),
      })

      // Log the result
      logger.info("updateJobPhase response in job-detail-sheet", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Update local state after successful API call
      setJobStatus(JOB_STATUS.STONE_SELECTED)
      setStickerData({
        "Lot Number": stoneData.lotNumber,
        "Stone Count": stoneData.stoneCount,
        "Total Weight": `${stoneData.totalWeight}g`,
      })
      setStickerOpen(true)
      setCurrentPhase(JOB_PHASE.DIAMOND)
    } catch (error) {
      logger.error("Error completing stone selection:", {
        data: { jobId: job.id, stoneData },
        error,
      })
      setStoneError("Failed to complete stone selection. Please try again.")
    } finally {
      setIsSubmittingStone(false)
    }
  }

  const handleCompleteDiamondSelection = async () => {
    logger.debug("handleCompleteDiamondSelection called", { diamondData })

    if (
      !diamondData.lotNumber ||
      !diamondData.karat ||
      !diamondData.clarity ||
      !diamondData.diamondCount ||
      !diamondData.totalWeight
    ) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmittingDiamond(true)
    setDiamondError(null)

    try {
      // Log before calling the server action
      logger.debug("Calling updateJobPhase from job-detail-sheet", {
        jobId: job.id,
        phase: JOB_PHASE.DIAMOND,
        data: {
          lotNumber: diamondData.lotNumber,
          karat: diamondData.karat,
          clarity: diamondData.clarity,
          quantity: Number.parseInt(diamondData.diamondCount),
          weight: Number.parseFloat(diamondData.totalWeight),
        },
      })

      // Call the server action
      const result = await updateJobPhase(job.id, JOB_PHASE.DIAMOND, {
        lotNumber: diamondData.lotNumber,
        karat: diamondData.karat,
        clarity: diamondData.clarity,
        quantity: Number.parseInt(diamondData.diamondCount),
        weight: Number.parseFloat(diamondData.totalWeight),
      })

      // Log the result
      logger.info("updateJobPhase response in job-detail-sheet", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Update local state after successful API call
      setJobStatus(JOB_STATUS.DIAMOND_SELECTED)
      setStickerData({
        "Lot Number": diamondData.lotNumber,
        Karat: diamondData.karat,
        Clarity: diamondData.clarity,
        "Diamond Count": diamondData.diamondCount,
        "Total Weight": `${diamondData.totalWeight}g`,
      })
      setStickerOpen(true)
      setCurrentPhase(JOB_PHASE.MANUFACTURER)
    } catch (error) {
      logger.error("Error completing diamond selection:", {
        data: { jobId: job.id, diamondData },
        error,
      })
      setDiamondError("Failed to complete diamond selection. Please try again.")
    } finally {
      setIsSubmittingDiamond(false)
    }
  }

  const handleAssignManufacturer = async () => {
    logger.debug("handleAssignManufacturer called", { manufacturerData })

    if (!manufacturerData.manufacturerId || !manufacturerData.expectedCompletion) {
      alert("Please select a manufacturer and expected completion date")
      return
    }

    setIsSubmittingManufacturer(true)
    setManufacturerError(null)

    try {
      const selectedManufacturer = MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)

      // Log before calling the server action
      logger.debug("Calling updateJobPhase from job-detail-sheet", {
        jobId: job.id,
        phase: JOB_PHASE.MANUFACTURER,
        data: {
          name: selectedManufacturer?.name || "Unknown",
          expectedCompletionDate: manufacturerData.expectedCompletion,
        },
      })

      // Call the server action
      const result = await updateJobPhase(job.id, JOB_PHASE.MANUFACTURER, {
        name: selectedManufacturer?.name || "Unknown",
        expectedCompletionDate: manufacturerData.expectedCompletion,
      })

      // Log the result
      logger.info("updateJobPhase response in job-detail-sheet", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Update local state after successful API call
      setJobStatus(JOB_STATUS.SENT_TO_MANUFACTURER)
      setManufacturer(selectedManufacturer?.name || "Unknown")
      setStickerData({
        Manufacturer: selectedManufacturer?.name || "Unknown",
        "Expected Completion": new Date(manufacturerData.expectedCompletion).toLocaleDateString(),
      })
      setStickerOpen(true)
      setCurrentPhase(JOB_PHASE.QUALITY_CHECK)
    } catch (error) {
      logger.error("Error assigning manufacturer:", {
        data: { jobId: job.id, manufacturerData },
        error,
      })
      setManufacturerError("Failed to assign manufacturer. Please try again.")
    } finally {
      setIsSubmittingManufacturer(false)
    }
  }

  const handleCompleteQC = async (passed: boolean) => {
    logger.debug("handleCompleteQC called", { passed, qcData })

    if (!qcData.measuredWeight) {
      alert("Please enter the measured weight")
      return
    }

    setIsSubmittingQC(true)
    setQCError(null)

    try {
      // Log before calling the server action
      logger.debug("Calling updateJobPhase from job-detail-sheet", {
        jobId: job.id,
        phase: JOB_PHASE.QUALITY_CHECK,
        data: {
          weight: Number.parseFloat(qcData.measuredWeight),
          passed: passed,
          notes: qcData.notes || "",
        },
      })

      // Call the server action
      const result = await updateJobPhase(job.id, JOB_PHASE.QUALITY_CHECK, {
        weight: Number.parseFloat(qcData.measuredWeight),
        passed: passed,
        notes: qcData.notes || "",
      })

      // Log the result
      logger.info("updateJobPhase response in job-detail-sheet", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Update local state after successful API call
      setJobStatus(passed ? JOB_STATUS.QC_PASSED : JOB_STATUS.QC_FAILED)
      setStickerData({
        "QC Result": passed ? "PASSED" : "FAILED",
        "Measured Weight": `${qcData.measuredWeight}g`,
        Notes: qcData.notes || "None",
      })
      setStickerOpen(true)

      if (passed) {
        // Move to next phase
        setCurrentPhase(JOB_PHASE.COMPLETE)
      }
    } catch (error) {
      logger.error("Error completing quality check:", {
        data: { jobId: job.id, passed, qcData },
        error,
      })
      setQCError(`Failed to ${passed ? "pass" : "fail"} quality check. Please try again.`)
    } finally {
      setIsSubmittingQC(false)
    }
  }

  const handleCompleteJob = async () => {
    logger.debug("handleCompleteJob called")

    setIsSubmittingComplete(true)
    setCompleteError(null)

    try {
      // Log before calling the server action
      logger.debug("Calling updateJobPhase from job-detail-sheet", {
        jobId: job.id,
        phase: JOB_PHASE.COMPLETE,
        data: {
          completionDate: new Date().toISOString(),
        },
      })

      // Call the server action
      const result = await updateJobPhase(job.id, JOB_PHASE.COMPLETE, {
        completionDate: new Date().toISOString(),
      })

      // Log the result
      logger.info("updateJobPhase response in job-detail-sheet", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Update local state after successful API call
      setJobStatus(JOB_STATUS.COMPLETED)
      setStickerData({
        "Completion Date": new Date().toLocaleDateString(),
        "Final Status": "Completed",
      })
      setStickerOpen(true)
    } catch (error) {
      logger.error("Error completing job:", {
        data: { jobId: job.id },
        error,
      })
      setCompleteError("Failed to complete job. Please try again.")
    } finally {
      setIsSubmittingComplete(false)
    }
  }

  if (!job) {
    logger.debug("No job data provided, returning null")
    return null
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex flex-col h-full">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-lg font-semibold">Job {job.id}</h1>
            <Badge variant="secondary" className="ml-2">
              {jobStatus}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                disabled={jobStatus === JOB_STATUS.COMPLETED || isSubmittingComplete}
                onClick={handleCompleteJob}
              >
                {isSubmittingComplete ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Complete Job
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-md overflow-hidden cursor-pointer"
                  onClick={() => openImageDialog(job.image)}
                >
                  <img src={job.image || "/placeholder.svg"} alt={job.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{job.name}</h2>
                  <p className="text-sm text-muted-foreground">SKU: {job.skuId}</p>
                </div>
              </div>

              {completeError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{completeError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Job Status</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge className="w-full justify-center py-1.5 text-sm">{jobStatus}</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Production Date</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">{new Date(job.productionDate).toLocaleDateString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Manufacturer</CardTitle>
                    <Factory className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">{manufacturer}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Stepper UI */}
              <div className="mb-4">
                <Stepper steps={getSteps()} onStepClick={handleStepClick} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Job Work Stickers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentPhase}>
                    <TabsList className="grid grid-cols-5 mb-8">
                      <TabsTrigger
                        value={JOB_PHASE.STONE}
                        onClick={() => handleStepClick(JOB_PHASE.STONE)}
                        disabled={getSteps().find((s) => s.id === JOB_PHASE.STONE)?.status === "upcoming"}
                      >
                        Stone Selection
                      </TabsTrigger>
                      <TabsTrigger
                        value={JOB_PHASE.DIAMOND}
                        onClick={() => handleStepClick(JOB_PHASE.DIAMOND)}
                        disabled={getSteps().find((s) => s.id === JOB_PHASE.DIAMOND)?.status === "upcoming"}
                      >
                        Diamond Selection
                      </TabsTrigger>
                      <TabsTrigger
                        value={JOB_PHASE.MANUFACTURER}
                        onClick={() => handleStepClick(JOB_PHASE.MANUFACTURER)}
                        disabled={getSteps().find((s) => s.id === JOB_PHASE.MANUFACTURER)?.status === "upcoming"}
                      >
                        Manufacturer
                      </TabsTrigger>
                      <TabsTrigger
                        value={JOB_PHASE.QUALITY_CHECK}
                        onClick={() => handleStepClick(JOB_PHASE.QUALITY_CHECK)}
                        disabled={getSteps().find((s) => s.id === JOB_PHASE.QUALITY_CHECK)?.status === "upcoming"}
                      >
                        Quality Check
                      </TabsTrigger>
                      <TabsTrigger
                        value={JOB_PHASE.COMPLETE}
                        onClick={() => handleStepClick(JOB_PHASE.COMPLETE)}
                        disabled={getSteps().find((s) => s.id === JOB_PHASE.COMPLETE)?.status === "upcoming"}
                      >
                        Complete
                      </TabsTrigger>
                    </TabsList>

                    {/* Stone Selection Tab */}
                    <TabsContent value={JOB_PHASE.STONE} className="space-y-4">
                      {stoneError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{stoneError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stoneLot">Stone Lot Number</Label>
                          <Select
                            value={stoneData.lotNumber}
                            onValueChange={(value) => setStoneData({ ...stoneData, lotNumber: value })}
                            disabled={currentPhase !== JOB_PHASE.STONE || isSubmittingStone}
                          >
                            <SelectTrigger id="stoneLot">
                              <SelectValue placeholder="Select stone lot" />
                            </SelectTrigger>
                            <SelectContent>
                              {STONE_LOTS.map((lot) => (
                                <SelectItem key={lot} value={lot}>
                                  {lot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stoneType">Stone Type</Label>
                          <Input id="stoneType" value={job.stoneType === "None" ? "-" : job.stoneType} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stoneCount">Number of Stones</Label>
                          <Input
                            id="stoneCount"
                            type="number"
                            value={stoneData.stoneCount}
                            onChange={(e) => setStoneData({ ...stoneData, stoneCount: e.target.value })}
                            disabled={currentPhase !== JOB_PHASE.STONE || isSubmittingStone}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stoneTotalWeight">Total Weight (g)</Label>
                          <Input
                            id="stoneTotalWeight"
                            type="number"
                            step="0.01"
                            value={stoneData.totalWeight}
                            onChange={(e) => setStoneData({ ...stoneData, totalWeight: e.target.value })}
                            disabled={currentPhase !== JOB_PHASE.STONE || isSubmittingStone}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCompleteStoneSelection}
                          disabled={currentPhase !== JOB_PHASE.STONE || isSubmittingStone}
                        >
                          {isSubmittingStone ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Complete Stone Selection"
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Diamond Selection Tab */}
                    <TabsContent value={JOB_PHASE.DIAMOND} className="space-y-4">
                      {diamondError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{diamondError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="diamondLot">Diamond Lot Number</Label>
                          <Select
                            value={diamondData.lotNumber}
                            onValueChange={(value) => setDiamondData({ ...diamondData, lotNumber: value })}
                            disabled={currentPhase !== JOB_PHASE.DIAMOND || isSubmittingDiamond}
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
                            disabled={currentPhase !== JOB_PHASE.DIAMOND || isSubmittingDiamond}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="diamondClarity">Clarity</Label>
                          <Select
                            value={diamondData.clarity}
                            onValueChange={(value) => setDiamondData({ ...diamondData, clarity: value })}
                            disabled={currentPhase !== JOB_PHASE.DIAMOND || isSubmittingDiamond}
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
                            disabled={currentPhase !== JOB_PHASE.DIAMOND || isSubmittingDiamond}
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
                            disabled={currentPhase !== JOB_PHASE.DIAMOND || isSubmittingDiamond}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCompleteDiamondSelection}
                          disabled={currentPhase !== JOB_PHASE.DIAMOND || isSubmittingDiamond}
                        >
                          {isSubmittingDiamond ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Complete Diamond Selection"
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Manufacturer Tab */}
                    <TabsContent value={JOB_PHASE.MANUFACTURER} className="space-y-4">
                      {manufacturerError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{manufacturerError}</AlertDescription>
                        </Alert>
                      )}

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
                                      disabled={currentPhase !== JOB_PHASE.MANUFACTURER || isSubmittingManufacturer}
                                      className={
                                        manufacturerData.manufacturerId === m.id
                                          ? "bg-primary text-primary-foreground"
                                          : ""
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
                            onChange={(e) =>
                              setManufacturerData({ ...manufacturerData, expectedCompletion: e.target.value })
                            }
                            disabled={currentPhase !== JOB_PHASE.MANUFACTURER || isSubmittingManufacturer}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAssignManufacturer}
                          disabled={currentPhase !== JOB_PHASE.MANUFACTURER || isSubmittingManufacturer}
                        >
                          {isSubmittingManufacturer ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Assign Manufacturer"
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Quality Check Tab */}
                    <TabsContent value={JOB_PHASE.QUALITY_CHECK} className="space-y-4">
                      {qcError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{qcError}</AlertDescription>
                        </Alert>
                      )}

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
                            disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="qcNotes">Quality Check Notes</Label>
                          <Textarea
                            id="qcNotes"
                            value={qcData.notes}
                            onChange={(e) => setQcData({ ...qcData, notes: e.target.value })}
                            disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
                            placeholder="Enter any notes about the quality check..."
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <Button
                          variant="destructive"
                          onClick={() => handleCompleteQC(false)}
                          disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
                        >
                          {isSubmittingQC ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <AlertTriangle className="mr-2 h-4 w-4" />
                          )}
                          Fail QC
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => handleCompleteQC(true)}
                          disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
                        >
                          {isSubmittingQC ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Pass QC
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Complete Tab */}
                    <TabsContent value={JOB_PHASE.COMPLETE} className="space-y-4">
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
                              {manufacturer !== "Pending" ? (
                                <>
                                  <p>Selected: {manufacturer}</p>
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
                                  <p>
                                    Result: {qcData.passed === null ? "Pending" : qcData.passed ? "PASSED" : "FAILED"}
                                  </p>
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
                      <Separator />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCompleteJob}
                          disabled={
                            currentPhase !== JOB_PHASE.COMPLETE ||
                            jobStatus === JOB_STATUS.COMPLETED ||
                            isSubmittingComplete
                          }
                        >
                          {isSubmittingComplete ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Mark Job as Complete
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SKU Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {selectedImage && (
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="SKU"
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
