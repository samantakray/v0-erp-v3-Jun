"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, CheckCircle2, Factory, Package, AlertTriangle, Loader2, PlusCircle } from "lucide-react" // Added XCircle
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
import { fetchStoneLots, fetchDiamondLots } from "@/lib/api-service" // Added fetchDiamondLots
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StoneAllocationRow from "@/components/stone-allocation-row"
import DiamondAllocationRow from "@/components/diamond-allocation-row" // Import the new component
import type { Job, StoneLotData, StoneAllocation, DiamondLotData, DiamondAllocation } from "@/types" // Added Diamond types
import type { JobPhase } from "@/constants/job-workflow" // Declare the JobPhase variable

// Mock manufacturers data (can be replaced by fetchManufacturers if available)
const MANUFACTURERS = [
  { id: "m1", name: "Elegant Creations Ltd.", currentLoad: 12, pastJobCount: 156, rating: 4.8 },
  { id: "m2", name: "Precision Jewelry Co.", currentLoad: 8, pastJobCount: 98, rating: 4.5 },
]

export function JobDetailSheet({
  job,
  open,
  onOpenChange,
}: { job: Job | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  logger.debug("Rendering JobDetailSheet component", { jobId: job?.id, open })

  const [currentPhase, setCurrentPhase] = useState(job?.currentPhase || JOB_PHASE.STONE)
  const [jobStatus, setJobStatus] = useState(job?.status || JOB_STATUS.NEW)
  const [manufacturer, setManufacturer] = useState(job?.manufacturerData?.name || "Pending")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [stickerOpen, setStickerOpen] = useState(false)
  const [stickerData, setStickerData] = useState<Record<string, string | number>>({})

  // Stone Allocation State
  const [stoneLots, setStoneLots] = useState<StoneLotData[]>([])
  const [stoneLotsLoading, setStoneLotsLoading] = useState(true)
  const [stoneAllocations, setStoneAllocations] = useState<StoneAllocation[]>([
    { clientId: crypto.randomUUID(), lot_number: "", stone_type: "", size: "", quantity: 0, weight: 0 },
  ])
  const [stoneAllocationErrors, setStoneAllocationErrors] = useState<{ [key: string]: { [field: string]: string } }>({})
  const [stonePhaseError, setStonePhaseError] = useState<string | null>(null)
  const [isSubmittingStone, setIsSubmittingStone] = useState(false)

  // Diamond Allocation State
  const [diamondLots, setDiamondLots] = useState<DiamondLotData[]>([])
  const [diamondLotsLoading, setDiamondLotsLoading] = useState(true)
  const [diamondAllocations, setDiamondAllocations] = useState<DiamondAllocation[]>([
    { clientId: crypto.randomUUID(), lot_number: "", size: "", shape: "", quality: "", quantity: 0, weight: 0 },
  ])
  const [diamondAllocationErrors, setDiamondAllocationErrors] = useState<{
    [key: string]: { [field: string]: string }
  }>({})
  const [diamondPhaseError, setDiamondPhaseError] = useState<string | null>(null)
  const [isSubmittingDiamond, setIsSubmittingDiamond] = useState(false)

  // Other Phases State
  const [manufacturerData, setManufacturerData] = useState({
    manufacturerId: job?.manufacturerData?.id || "",
    expectedCompletion: job?.manufacturerData?.expectedCompletionDate || "",
  })
  const [qcData, setQcData] = useState({
    measuredWeight: job?.qcData?.weight || "",
    notes: job?.qcData?.notes || "",
    passed: job?.qcData?.passed === undefined ? null : job.qcData.passed,
  })
  const [manufacturerError, setManufacturerError] = useState<string | null>(null)
  const [qcError, setQCError] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [isSubmittingManufacturer, setIsSubmittingManufacturer] = useState(false)
  const [isSubmittingQC, setIsSubmittingQC] = useState(false)
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false)

  useEffect(() => {
    if (job) {
      logger.debug("JobDetailSheet: Job data updated, resetting states", { job })
      setCurrentPhase(job.currentPhase || JOB_PHASE.STONE)
      setJobStatus(job.status || JOB_STATUS.NEW)
      setManufacturer(job.manufacturerData?.name || "Pending")

      // Pre-populate stone allocations
      if (job.stoneData?.allocations && job.stoneData.allocations.length > 0) {
        setStoneAllocations(job.stoneData.allocations.map((alloc) => ({ ...alloc, clientId: crypto.randomUUID() })))
      } else {
        setStoneAllocations([
          { clientId: crypto.randomUUID(), lot_number: "", stone_type: "", size: "", quantity: 0, weight: 0 },
        ])
      }

      // Pre-populate diamond allocations
      if (job.diamondData?.allocations && job.diamondData.allocations.length > 0) {
        setDiamondAllocations(job.diamondData.allocations.map((alloc) => ({ ...alloc, clientId: crypto.randomUUID() })))
      } else {
        setDiamondAllocations([
          { clientId: crypto.randomUUID(), lot_number: "", size: "", shape: "", quality: "", quantity: 0, weight: 0 },
        ])
      }

      setManufacturerData({
        manufacturerId: job.manufacturerData?.id || "",
        expectedCompletion: job.manufacturerData?.expectedCompletionDate || "",
      })
      setQcData({
        measuredWeight: job.qcData?.weight || "",
        notes: job.qcData?.notes || "",
        passed: job.qcData?.passed === undefined ? null : job.qcData.passed,
      })
    }
  }, [job])

  // Fetch Stone Lots
  useEffect(() => {
    async function loadStoneLots() {
      if (!open || (currentPhase !== JOB_PHASE.STONE && !job?.stoneData)) return // Fetch if stone phase or if stone data exists for review
      logger.debug("JobDetailSheet: loadStoneLots called", { open, currentPhase, jobId: job?.id })
      setStoneLotsLoading(true)
      try {
        const lots = await fetchStoneLots()
        logger.debug("JobDetailSheet: fetchStoneLots returned", { count: lots?.length, sample: lots?.[0] })
        setStoneLots(lots || [])

        // Pre-populate available quantities for existing stone allocations
        if (job?.stoneData?.allocations && lots) {
          setStoneAllocations((prevAllocations) =>
            prevAllocations.map((alloc) => {
              const matchingLot = lots.find((l) => l.lot_number === alloc.lot_number)
              return {
                ...alloc,
                available_quantity: matchingLot?.quantity,
                available_weight: matchingLot?.weight,
              }
            }),
          )
        }
      } catch (error: any) {
        logger.error("JobDetailSheet: Error fetching stone lots", { error: error.message, stack: error.stack })
        setStonePhaseError("Failed to load stone lots. Please try refreshing.")
      } finally {
        setStoneLotsLoading(false)
      }
    }
    loadStoneLots()
  }, [open, job?.id, job?.stoneData, currentPhase]) // Added currentPhase

  // Fetch Diamond Lots
  useEffect(() => {
    async function loadDiamondLots() {
      if (!open || (currentPhase !== JOB_PHASE.DIAMOND && !job?.diamondData)) return
      logger.debug("JobDetailSheet: loadDiamondLots called", { open, currentPhase, jobId: job?.id })
      setDiamondLotsLoading(true)
      try {
        const lots = await fetchDiamondLots()
        logger.debug("JobDetailSheet: fetchDiamondLots returned detailed analysis", {
          count: lots?.length || 0,
          sample: lots?.[0] || null,
          isArray: Array.isArray(lots),
          allLots:
            lots?.map((lot) => ({
              id: lot.id,
              lot_number: lot.lot_number,
              lot_number_type: typeof lot.lot_number,
              lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
              size: lot.size,
              shape: lot.shape,
              quality: lot.quality,
              quantity: lot.quantity,
              status: lot.status,
            })) || [],
        })

        // Validate the lots data before setting state
        if (lots && lots.length > 0) {
          const invalidLots = lots.filter((lot) => !lot.lot_number || lot.lot_number.trim() === "")
          if (invalidLots.length > 0) {
            logger.warn("JobDetailSheet: Found diamond lots with invalid lot_number", {
              invalidCount: invalidLots.length,
              invalidLots: invalidLots.map((lot) => ({
                id: lot.id,
                lot_number: lot.lot_number,
                lot_number_raw: JSON.stringify(lot.lot_number),
              })),
            })
          }

          const validLots = lots.filter((lot) => lot.lot_number && lot.lot_number.trim() !== "")
          logger.debug("JobDetailSheet: Setting diamond lots state", {
            totalLots: lots.length,
            validLots: validLots.length,
            invalidLots: invalidLots.length,
            validLotNumbers: validLots.map((lot) => lot.lot_number),
          })
          setDiamondLots(validLots) // Only set valid lots
        } else {
          logger.warn("JobDetailSheet: No diamond lots returned or empty array")
          setDiamondLots([])
        }

        // Pre-populate available quantities for existing diamond allocations
        if (job?.diamondData?.allocations && lots) {
          logger.debug("JobDetailSheet: Pre-populating diamond allocation data", {
            existingAllocations: job.diamondData.allocations.length,
            availableLots: lots.length,
          })
          setDiamondAllocations((prevAllocations) =>
            prevAllocations.map((alloc) => {
              const matchingLot = lots.find((l) => l.lot_number === alloc.lot_number)
              logger.debug("JobDetailSheet: Matching lot for allocation", {
                allocationLotNumber: alloc.lot_number,
                matchingLot: matchingLot
                  ? {
                      id: matchingLot.id,
                      lot_number: matchingLot.lot_number,
                      quantity: matchingLot.quantity,
                    }
                  : null,
              })
              return {
                ...alloc,
                available_quantity: matchingLot?.quantity,
              }
            }),
          )
        }
      } catch (error: any) {
        logger.error("JobDetailSheet: Error fetching diamond lots", {
          error: error.message,
          stack: error.stack,
          errorType: error.constructor.name,
        })
        setDiamondPhaseError("Failed to load diamond lots. Please try refreshing.")
      } finally {
        setDiamondLotsLoading(false)
      }
    }
    loadDiamondLots()
  }, [open, job?.id, job?.diamondData, currentPhase])

  // Stone Allocation Handlers
  const addStoneAllocationRow = () => {
    logger.debug("JobDetailSheet: Adding new stone allocation row")
    setStoneAllocations([
      ...stoneAllocations,
      { clientId: crypto.randomUUID(), lot_number: "", stone_type: "", size: "", quantity: 0, weight: 0 },
    ])
  }

  const deleteStoneAllocationRow = (index: number) => {
    logger.debug("JobDetailSheet: Deleting stone allocation row", { index })
    if (stoneAllocations.length > 1) {
      setStoneAllocations(stoneAllocations.filter((_, i) => i !== index))
      setStoneAllocationErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const handleStoneAllocationChange = (index: number, field: string, value: any) => {
    logger.debug("JobDetailSheet: Stone allocation change", { index, field, value })
    setStoneAllocations((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
    if (field === "lot_number" && value) {
      const duplicate = stoneAllocations.some((alloc, i) => i !== index && alloc.lot_number === value)
      setStoneAllocationErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], lot_number: duplicate ? "This lot is already selected." : "" },
      }))
    } else if (field === "quantity" || field === "weight") {
      setStoneAllocationErrors((prev) => ({ ...prev, [index]: { ...prev[index], [field]: "" } }))
    }
  }

  const totalStoneQuantity = useMemo(
    () => stoneAllocations.reduce((sum, alloc) => sum + (Number(alloc.quantity) || 0), 0),
    [stoneAllocations],
  )
  const totalStoneWeight = useMemo(
    () => stoneAllocations.reduce((sum, alloc) => sum + (Number(alloc.weight) || 0), 0),
    [stoneAllocations],
  )

  const validateStoneAllocations = () => {
    logger.debug("JobDetailSheet: Validating stone allocations", { stoneAllocations })
    const errors: { [key: string]: { [field: string]: string } } = {}
    let isValid = true
    const usedLotNumbers = new Set<string>()

    stoneAllocations.forEach((alloc, index) => {
      const rowErrors: { [field: string]: string } = {}
      if (!alloc.lot_number) {
        rowErrors.lot_number = "Lot number is required."
        isValid = false
      } else if (usedLotNumbers.has(alloc.lot_number)) {
        rowErrors.lot_number = "This lot is already selected."
        isValid = false
      } else {
        usedLotNumbers.add(alloc.lot_number)
      }

      if (Number(alloc.quantity) <= 0) {
        rowErrors.quantity = "Quantity must be > 0."
        isValid = false
      } else if (alloc.available_quantity !== undefined && Number(alloc.quantity) > alloc.available_quantity) {
        rowErrors.quantity = `Exceeds available (${alloc.available_quantity}) stones in ${alloc.lot_number}.`
        isValid = false
        logger.warn(
          `Stone Allocation Validation: Quantity for lot ${alloc.lot_number} exceeds available. Requested: ${alloc.quantity}, Available: ${alloc.available_quantity}`,
        )
      }

      if (Number(alloc.weight) <= 0) {
        rowErrors.weight = "Weight must be > 0."
        isValid = false
      }
      // Add more weight validation if needed (e.g., against alloc.available_weight)

      if (Object.keys(rowErrors).length > 0) errors[index] = rowErrors
    })
    setStoneAllocationErrors(errors)
    logger.debug("JobDetailSheet: Stone validation result", { isValid, errors })
    return isValid
  }

  const handleCompleteStoneSelection = async () => {
    logger.info("JobDetailSheet: handleCompleteStoneSelection called")
    setStonePhaseError(null)
    if (!validateStoneAllocations()) {
      setStonePhaseError("Please correct the errors in stone allocations.")
      return
    }
    setIsSubmittingStone(true)
    try {
      const allocationsData = stoneAllocations.map(
        ({ clientId, available_quantity, available_weight, ...rest }) => rest,
      )
      const result = await updateJobPhase(job!.id, JOB_PHASE.STONE, {
        allocations: allocationsData,
        total_quantity: totalStoneQuantity,
        total_weight: totalStoneWeight,
        timestamp: new Date().toISOString(),
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      setStickerData({
        "Total Stones": totalStoneQuantity,
        "Total Weight": `${totalStoneWeight.toFixed(2)} ct`,
        "Allocated Lots": allocationsData.map((a) => a.lot_number).join(", "),
      })
      setStickerOpen(true)
    } catch (error: any) {
      logger.error("JobDetailSheet: Error completing stone selection", { error: error.message })
      setStonePhaseError(error.message || "Failed to complete stone selection.")
    } finally {
      setIsSubmittingStone(false)
    }
  }

  // Diamond Allocation Handlers
  const addDiamondAllocationRow = () => {
    logger.debug("JobDetailSheet: Adding new diamond allocation row")
    setDiamondAllocations([
      ...diamondAllocations,
      { clientId: crypto.randomUUID(), lot_number: "", size: "", shape: "", quality: "", quantity: 0, weight: 0 },
    ])
  }

  const deleteDiamondAllocationRow = (index: number) => {
    logger.debug("JobDetailSheet: Deleting diamond allocation row", { index })
    if (diamondAllocations.length > 1) {
      setDiamondAllocations(diamondAllocations.filter((_, i) => i !== index))
      setDiamondAllocationErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const handleDiamondAllocationChange = (index: number, field: string, value: any) => {
    logger.debug("JobDetailSheet: Diamond allocation change", { index, field, value })
    setDiamondAllocations((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          if (field === "lot_number") {
            const selectedLot = diamondLots.find((lot) => lot.lot_number === value)
            if (selectedLot) {
              updatedItem.size = selectedLot.size
              updatedItem.shape = selectedLot.shape
              updatedItem.quality = selectedLot.quality
              updatedItem.available_quantity = selectedLot.quantity
            } else {
              // Clear dependent fields if lot is deselected
              updatedItem.size = ""
              updatedItem.shape = ""
              updatedItem.quality = ""
              updatedItem.available_quantity = undefined
            }
          }
          return updatedItem
        }
        return item
      }),
    )

    if (field === "lot_number" && value) {
      // Real-time duplicate check
      const duplicate = diamondAllocations.some((alloc, i) => i !== index && alloc.lot_number === value)
      setDiamondAllocationErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], lot_number: duplicate ? "This lot is already selected." : "" },
      }))
    } else if (field === "quantity" || field === "weight") {
      // Clear specific error on modification
      setDiamondAllocationErrors((prev) => ({ ...prev, [index]: { ...prev[index], [field]: "" } }))
    }
  }

  const totalDiamondQuantity = useMemo(
    () => diamondAllocations.reduce((sum, alloc) => sum + (Number(alloc.quantity) || 0), 0),
    [diamondAllocations],
  )
  const totalDiamondWeight = useMemo(
    () => diamondAllocations.reduce((sum, alloc) => sum + (Number(alloc.weight) || 0), 0),
    [diamondAllocations],
  )

  const validateDiamondAllocations = (): boolean => {
    logger.debug("JobDetailSheet: Validating diamond allocations", { diamondAllocations })
    const errors: { [key: string]: { [field: string]: string } } = {}
    let isValid = true
    const usedLotNumbers = new Set<string>()

    diamondAllocations.forEach((alloc, index) => {
      const rowErrors: { [field: string]: string } = {}
      if (!alloc.lot_number) {
        rowErrors.lot_number = "Lot number is required."
        isValid = false
      } else if (usedLotNumbers.has(alloc.lot_number)) {
        rowErrors.lot_number = "This lot is already selected."
        isValid = false
      } else {
        usedLotNumbers.add(alloc.lot_number)
      }

      if (Number(alloc.quantity) <= 0) {
        rowErrors.quantity = "Quantity must be > 0."
        isValid = false
      } else if (alloc.available_quantity !== undefined && Number(alloc.quantity) > alloc.available_quantity) {
        rowErrors.quantity = `Exceeds available (${alloc.available_quantity}) diamonds in ${alloc.lot_number}.`
        isValid = false
        logger.warn(
          `Diamond Allocation Validation: Quantity for lot ${alloc.lot_number} exceeds available. Requested: ${alloc.quantity}, Available: ${alloc.available_quantity}`,
        )
      }

      if (Number(alloc.weight) <= 0) {
        rowErrors.weight = "Weight must be > 0."
        isValid = false
      }

      if (Object.keys(rowErrors).length > 0) errors[index] = rowErrors
    })
    setDiamondAllocationErrors(errors)
    logger.debug("JobDetailSheet: Diamond validation result", { isValid, errors })
    return isValid
  }

  const handleCompleteDiamondSelection = async () => {
    logger.info("JobDetailSheet: handleCompleteDiamondSelection called")
    setDiamondPhaseError(null)
    if (!validateDiamondAllocations()) {
      setDiamondPhaseError("Please correct the errors in diamond allocations.")
      return
    }
    setIsSubmittingDiamond(true)
    try {
      const allocationsData = diamondAllocations.map(({ clientId, available_quantity, ...rest }) => rest)
      const result = await updateJobPhase(job!.id, JOB_PHASE.DIAMOND, {
        allocations: allocationsData,
        total_quantity: totalDiamondQuantity,
        total_weight: totalDiamondWeight,
        timestamp: new Date().toISOString(),
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      setStickerData({
        "Total Diamonds": totalDiamondQuantity,
        "Total Weight": `${totalDiamondWeight.toFixed(2)} carat`,
        "Allocated Lots": allocationsData.map((a) => a.lot_number).join(", "),
      })
      setStickerOpen(true)
    } catch (error: any) {
      logger.error("JobDetailSheet: Error completing diamond selection", { error: error.message })
      setDiamondPhaseError(error.message || "Failed to complete diamond selection.")
    } finally {
      setIsSubmittingDiamond(false)
    }
  }

  // Other Phase Handlers (Manufacturer, QC, Complete Job) - Largely unchanged but ensure they use job!.id
  const handleAssignManufacturer = async () => {
    logger.info("JobDetailSheet: handleAssignManufacturer called", { manufacturerData })
    if (!manufacturerData.manufacturerId || !manufacturerData.expectedCompletion) {
      setManufacturerError("Please select a manufacturer and expected completion date.")
      return
    }
    setManufacturerError(null)
    setIsSubmittingManufacturer(true)
    try {
      const selectedMan = MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)
      const result = await updateJobPhase(job!.id, JOB_PHASE.MANUFACTURER, {
        name: selectedMan?.name || "Unknown",
        expectedCompletionDate: manufacturerData.expectedCompletion,
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      setManufacturer(selectedMan?.name || "Unknown")
      setStickerData({
        Manufacturer: selectedMan?.name || "Unknown",
        "Expected Completion": new Date(manufacturerData.expectedCompletion).toLocaleDateString(),
      })
      setStickerOpen(true)
    } catch (error: any) {
      logger.error("JobDetailSheet: Error assigning manufacturer", { error: error.message })
      setManufacturerError(error.message || "Failed to assign manufacturer.")
    } finally {
      setIsSubmittingManufacturer(false)
    }
  }

  const handleCompleteQC = async (passed: boolean) => {
    logger.info("JobDetailSheet: handleCompleteQC called", { passed, qcData })
    if (!qcData.measuredWeight) {
      setQCError("Please enter the measured weight.")
      return
    }
    setQCError(null)
    setIsSubmittingQC(true)
    try {
      const result = await updateJobPhase(job!.id, JOB_PHASE.QUALITY_CHECK, {
        weight: Number.parseFloat(qcData.measuredWeight),
        passed: passed,
        notes: qcData.notes || "",
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      setQcData((prev) => ({ ...prev, passed })) // Update local QC passed state
      setStickerData({
        "QC Result": passed ? "PASSED" : "FAILED",
        "Measured Weight": `${qcData.measuredWeight}g`,
        Notes: qcData.notes || "None",
      })
      setStickerOpen(true)
      if (!passed) {
        // If QC failed, might stay in QC phase or move to a specific "failed" phase
        setCurrentPhase(JOB_PHASE.MANUFACTURER) // Example: go back to manufacturer
      }
    } catch (error: any) {
      logger.error("JobDetailSheet: Error completing QC", { error: error.message })
      setQCError(error.message || `Failed to ${passed ? "pass" : "fail"} QC.`)
    } finally {
      setIsSubmittingQC(false)
    }
  }

  const handleCompleteJob = async () => {
    logger.info("JobDetailSheet: handleCompleteJob called")
    setCompleteError(null)
    setIsSubmittingComplete(true)
    try {
      const result = await updateJobPhase(job!.id, JOB_PHASE.COMPLETE, {
        completionDate: new Date().toISOString(),
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      setStickerData({ "Completion Date": new Date().toLocaleDateString(), "Final Status": "Completed" })
      setStickerOpen(true)
    } catch (error: any) {
      logger.error("JobDetailSheet: Error completing job", { error: error.message })
      setCompleteError(error.message || "Failed to complete job.")
    } finally {
      setIsSubmittingComplete(false)
    }
  }

  // Stepper Logic
  const getSteps = (): Step[] => {
    const phases = [
      { id: JOB_PHASE.STONE, label: "Stone" },
      { id: JOB_PHASE.DIAMOND, label: "Diamond" },
      { id: JOB_PHASE.MANUFACTURER, label: "Manufacturer" },
      { id: JOB_PHASE.QUALITY_CHECK, label: "QC" },
      { id: JOB_PHASE.COMPLETE, label: "Complete" },
    ]
    const currentIndex = phases.findIndex((p) => p.id === currentPhase)
    return phases.map((phase, index) => ({
      ...phase,
      status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
    }))
  }

  const handleStepClick = (stepId: string) => {
    logger.debug("JobDetailSheet: Step clicked", { stepId })
    const step = getSteps().find((s) => s.id === stepId)
    if (step && (step.status === "completed" || step.status === "current")) {
      setCurrentPhase(stepId as JobPhase)
    }
  }

  const openImageDialog = (image: string) => {
    setSelectedImage(image)
    setImageDialogOpen(true)
  }

  if (!job) {
    logger.warn("JobDetailSheet: No job data provided, returning null.")
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
                disabled={
                  jobStatus === JOB_STATUS.COMPLETED || isSubmittingComplete || currentPhase !== JOB_PHASE.COMPLETE
                }
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
                  <img
                    src={job.image || "/placeholder.svg?width=64&height=64&text=No+Image"}
                    alt={job.name}
                    className="w-full h-full object-cover"
                  />
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

              <div className="mb-4">
                <Stepper steps={getSteps()} onStepClick={handleStepClick} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Job Work Stickers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentPhase} onValueChange={(value) => setCurrentPhase(value as JobPhase)}>
                    <TabsList className="grid grid-cols-5 mb-8">
                      {getSteps().map((step) => (
                        <TabsTrigger key={step.id} value={step.id} disabled={step.status === "upcoming"}>
                          {step.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Stone Selection Tab */}
                    <TabsContent value={JOB_PHASE.STONE} className="space-y-4">
                      {stonePhaseError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{stonePhaseError}</AlertDescription>
                        </Alert>
                      )}
                      {stoneLotsLoading ? (
                        <div className="flex justify-center items-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />{" "}
                          <span className="ml-2">Loading Stone Lots...</span>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4">
                          <h3 className="text-md font-semibold mb-4">Allocate Stones</h3>
                          <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 font-medium text-sm">
                            <div>No.</div>
                            <div>Lot Number</div>
                            <div>Stone Type</div>
                            <div>Size</div>
                            <div>Quantity</div>
                            <div>Weight (ct)</div>
                            <div></div>
                          </div>
                          {stoneAllocations.map((allocation, index) => (
                            <StoneAllocationRow
                              key={allocation.clientId}
                              index={index}
                              allocation={allocation}
                              stoneLots={stoneLots}
                              onChange={handleStoneAllocationChange}
                              onDelete={deleteStoneAllocationRow}
                              isSubmitting={isSubmittingStone}
                              validationErrors={stoneAllocationErrors[index] || {}}
                              stoneAllocations={stoneAllocations}
                            />
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addStoneAllocationRow}
                            className="mt-4"
                            disabled={isSubmittingStone}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Stone Lot
                          </Button>
                          <Separator className="my-4" />
                          <div className="flex justify-end gap-8 text-sm font-semibold">
                            <div>Total Quantity: {totalStoneQuantity}</div>
                            <div>Total Weight: {totalStoneWeight.toFixed(2)} ct</div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCompleteStoneSelection}
                          disabled={
                            currentPhase !== JOB_PHASE.STONE ||
                            isSubmittingStone ||
                            stoneAllocations.length === 0 ||
                            stoneLotsLoading
                          }
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
                      {diamondPhaseError && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{diamondPhaseError}</AlertDescription>
                        </Alert>
                      )}
                      {diamondLotsLoading ? (
                        <div className="flex justify-center items-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />{" "}
                          <span className="ml-2">Loading Diamond Lots...</span>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4">
                          <h3 className="text-md font-semibold mb-4">Allocate Diamonds</h3>
                          <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 font-medium text-sm text-muted-foreground">
                            <div>No.</div>
                            <div>Lot Number</div>
                            <div>Size</div>
                            <div>Shape</div>
                            <div>Quality</div>
                            <div>Quantity</div>
                            <div>Weight (carat)</div>
                            <div>Action</div>
                          </div>
                          {diamondAllocations.map((allocation, index) => (
                            <DiamondAllocationRow
                              key={allocation.clientId}
                              index={index}
                              allocation={allocation}
                              diamondLots={diamondLots}
                              onChange={handleDiamondAllocationChange}
                              onDelete={deleteDiamondAllocationRow}
                              isSubmitting={isSubmittingDiamond}
                              validationErrors={diamondAllocationErrors[index] || {}}
                              diamondAllocations={diamondAllocations}
                            />
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addDiamondAllocationRow}
                            className="mt-4"
                            disabled={isSubmittingDiamond}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Diamond Lot
                          </Button>
                          <Separator className="my-4" />
                          <div className="flex justify-end gap-8 text-sm font-semibold">
                            <div>Total Quantity: {totalDiamondQuantity}</div>
                            <div>Total Weight: {totalDiamondWeight.toFixed(2)} carat</div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCompleteDiamondSelection}
                          disabled={
                            currentPhase !== JOB_PHASE.DIAMOND ||
                            isSubmittingDiamond ||
                            diamondAllocations.length === 0 ||
                            diamondLotsLoading
                          }
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
                          disabled={
                            currentPhase !== JOB_PHASE.MANUFACTURER ||
                            isSubmittingManufacturer ||
                            !manufacturerData.manufacturerId ||
                            !manufacturerData.expectedCompletion
                          }
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
                          disabled={
                            currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC || !qcData.measuredWeight
                          }
                        >
                          {isSubmittingQC && qcData.passed === false ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <AlertTriangle className="mr-2 h-4 w-4" />
                          )}
                          Fail QC
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => handleCompleteQC(true)}
                          disabled={
                            currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC || !qcData.measuredWeight
                          }
                        >
                          {isSubmittingQC && qcData.passed === true ? (
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
                              {job.stoneData?.allocations && job.stoneData.allocations.length > 0 ? (
                                <>
                                  {job.stoneData.allocations.map((alloc, idx) => (
                                    <p key={idx}>
                                      Lot {alloc.lot_number}: {alloc.quantity} stones, {alloc.weight} ct
                                    </p>
                                  ))}
                                  <p>
                                    Total: {job.stoneData.total_quantity} stones, {job.stoneData.total_weight} ct
                                  </p>
                                </>
                              ) : (
                                <p>Not completed</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Diamond Selection</h3>
                            <div className="text-sm text-muted-foreground">
                              {job.diamondData?.allocations && job.diamondData.allocations.length > 0 ? (
                                <>
                                  {job.diamondData.allocations.map((alloc, idx) => (
                                    <p key={idx}>
                                      Lot {alloc.lot_number}: {alloc.quantity} diamonds, {alloc.weight} carat (
                                      {alloc.shape}, {alloc.quality})
                                    </p>
                                  ))}
                                  <p>
                                    Total: {job.diamondData.total_quantity} diamonds, {job.diamondData.total_weight}{" "}
                                    carat
                                  </p>
                                </>
                              ) : (
                                <p>Not completed</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Manufacturer</h3>
                            <div className="text-sm text-muted-foreground">
                              {job.manufacturerData?.name && job.manufacturerData.name !== "Pending" ? (
                                <>
                                  <p>Selected: {job.manufacturerData.name}</p>
                                  <p>
                                    Expected Completion:{" "}
                                    {job.manufacturerData.expectedCompletionDate
                                      ? new Date(job.manufacturerData.expectedCompletionDate).toLocaleDateString()
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
                              {job.qcData?.weight ? (
                                <>
                                  <p>
                                    Result:{" "}
                                    {job.qcData.passed === null ? "Pending" : job.qcData.passed ? "PASSED" : "FAILED"}
                                  </p>
                                  <p>Measured Weight: {job.qcData.weight}g</p>
                                  {job.qcData.notes && <p>Notes: {job.qcData.notes}</p>}
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
