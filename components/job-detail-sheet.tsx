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
import { GOLD_TYPE } from "@/constants/categories"
import { logger } from "@/lib/logger"
import { fetchStoneLots, fetchDiamondLots } from "@/lib/api-service" // Added fetchDiamondLots
import { generateAllocationClientID } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StoneAllocationRow from "@/components/stone-allocation-row"
import DiamondAllocationRow from "@/components/diamond-allocation-row" // Import the new component
import GoldUsageRow from "@/components/gold-usage-row"
import DiamondUsageRow from "@/components/diamond-usage-row"
import ColoredStoneUsageRow from "@/components/colored-stone-usage-row"
import type { Job, StoneLotData, StoneAllocation, DiamondLotData, DiamondAllocation } from "@/types" // Added Diamond types
import type { JobPhase } from "@/constants/job-workflow" // Declare the JobPhase variable
//import { generateClientId } from "@/lib/client-id-generator"

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
  // Console logging for modal-based job navigation - Root Cause #2
  console.log("🔍 Job Detail Sheet - Component rendered")
  console.log("🔍 Job Detail Sheet - job:", job?.id, "open:", open)
  console.log("🔍 Job Detail Sheet - Current URL:", typeof window !== 'undefined' ? window.location.href : 'SSR')
  console.log("🔍 Job Detail Sheet - MODAL CONTEXT: This job detail is shown in a modal/sheet")
  console.log("🔍 Job Detail Sheet - MODAL CONTEXT: Any phase navigation here will NOT update browser URL")
  console.log("🔍 Job Detail Sheet - MODAL CONTEXT: URL remains unchanged during job workflow")
  
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
    { clientId: generateAllocationClientID(), lot_number: "", stone_type: "", size: "", quantity: 0, weight: 0 },
  ])
  const [stoneAllocationErrors, setStoneAllocationErrors] = useState<{ [key: string]: { [field: string]: string } }>({})
  const [stonePhaseError, setStonePhaseError] = useState<string | null>(null)
  const [isSubmittingStone, setIsSubmittingStone] = useState(false)

  // Diamond Allocation State
  const [diamondLots, setDiamondLots] = useState<DiamondLotData[]>([])
  const [diamondLotsLoading, setDiamondLotsLoading] = useState(true)
  const [diamondAllocations, setDiamondAllocations] = useState<DiamondAllocation[]>([
    { clientId: generateAllocationClientID(), lot_number: "", size: "", shape: "", quality: "", quantity: 0, weight: 0 },
  ])
  const [diamondAllocationErrors, setDiamondAllocationErrors] = useState<{
    [key: string]: { [field: string]: string }
  }>({})
  const [diamondPhaseError, setDiamondPhaseError] = useState<string | null>(null)
  const [isSubmittingDiamond, setIsSubmittingDiamond] = useState(false)

  // Other Phases State
  const [manufacturerData, setManufacturerData] = useState({
    manufacturerId: job?.manufacturerData?.id || "",
    expectedCompletion: job?.manufacturerData?.expectedCompletionDate || job?.productionDate || "",
  })
  const [qcData, setQcData] = useState({
    notes: job?.qcData?.notes || "",
    passed: job?.qcData?.passed === undefined ? null : job.qcData.passed,
  })

  // QC Usage Details State
  const [goldUsageDetails, setGoldUsageDetails] = useState([
    { 
      clientId: generateAllocationClientID(), 
      description: "", 
      grossWeight: 0, 
      scrapWeight: 0 
    }
  ])
  const [goldUsageErrors, setGoldUsageErrors] = useState({})

  const [diamondUsageDetails, setDiamondUsageDetails] = useState([
    { 
      clientId: generateAllocationClientID(), 
      type: "", 
      returnQuantity: 0, 
      returnWeight: 0, 
      lossQuantity: 0, 
      lossWeight: 0, 
      breakQuantity: 0, 
      breakWeight: 0 
    }
  ])
  const [diamondUsageErrors, setDiamondUsageErrors] = useState({})

  const [coloredStoneUsageDetails, setColoredStoneUsageDetails] = useState([
    { 
      clientId: generateAllocationClientID(), 
      type: "", 
      returnQuantity: 0, 
      returnWeight: 0, 
      lossQuantity: 0, 
      lossWeight: 0, 
      breakQuantity: 0, 
      breakWeight: 0 
    }
  ])
  const [coloredStoneUsageErrors, setColoredStoneUsageErrors] = useState({})
  

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
        setStoneAllocations(job.stoneData.allocations.map((alloc) => ({ ...alloc, clientId: generateAllocationClientID() })))
      } else {
        setStoneAllocations([
          { clientId: generateAllocationClientID(), lot_number: "", stone_type: "", size: "", quantity: 0, weight: 0 },
        ])
      }

      // Pre-populate diamond allocations
      if (job.diamondData?.allocations && job.diamondData.allocations.length > 0) {
        setDiamondAllocations(job.diamondData.allocations.map((alloc) => ({ ...alloc, clientId: generateAllocationClientID() })))
      } else {
        setDiamondAllocations([
          { clientId: generateAllocationClientID(), lot_number: "", size: "", shape: "", quality: "", quantity: 0, weight: 0 },
        ])
      }

      setManufacturerData({
        manufacturerId: job.manufacturerData?.id || "",
        expectedCompletion: job.manufacturerData?.expectedCompletionDate || job?.productionDate || "",
      })
      setQcData({
        notes: job.qcData?.notes || "",
        passed: job.qcData?.passed === undefined ? null : job.qcData.passed,
      })
    }
  }, [job])

  // Fetch Stone Lots
  useEffect(() => {
    async function loadStoneLots() {
      if (!open || (currentPhase !== JOB_PHASE.STONE && currentPhase !== JOB_PHASE.QUALITY_CHECK && !job?.stoneData)) return // Fetch if stone phase, QC phase, or if stone data exists for review
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
      if (!open || (currentPhase !== JOB_PHASE.DIAMOND && currentPhase !== JOB_PHASE.QUALITY_CHECK && !job?.diamondData)) return
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
    
    // Check if "None" already exists
    const hasNone = stoneAllocations.some(alloc => alloc.lot_number === "None")
    
    setStoneAllocations([
      ...stoneAllocations,
      { 
        clientId: generateAllocationClientID(), 
        lot_number: "", // Always start with empty, user can choose "None" if needed
        stone_type: "", 
        size: "", 
        quantity: 0, 
        weight: 0 
      },
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
    () => stoneAllocations
      .filter(alloc => alloc.lot_number !== "None")
      .reduce((sum, alloc) => sum + (Number(alloc.quantity) || 0), 0),
    [stoneAllocations],
  )
  const totalStoneWeight = useMemo(
    () => stoneAllocations
      .filter(alloc => alloc.lot_number !== "None")
      .reduce((sum, alloc) => sum + (Number(alloc.weight) || 0), 0),
    [stoneAllocations],
  )

  const validateStoneAllocations = () => {
    logger.debug("JobDetailSheet: Validating stone allocations", { stoneAllocations })
    const errors: { [key: string]: { [field: string]: string } } = {}
    let isValid = true
    const usedLotNumbers = new Set<string>()

    stoneAllocations.forEach((alloc, index) => {
      const rowErrors: { [field: string]: string } = {}
      
      // Skip validation for "None" selections
      if (alloc.lot_number === "None") {
        return // Skip all validation for "None" rows
      }
      
      if (!alloc.lot_number) {
        rowErrors.lot_number = "Lot number is required. If no stones required for this job then select the None option"
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
      const allocationsData = stoneAllocations
        .filter(alloc => alloc.lot_number !== "None") // Filter out "None" allocations
        .map(({ clientId, available_quantity, available_weight, ...rest }) => rest)
      
      const result = await updateJobPhase(job!.id, JOB_PHASE.STONE, {
        allocations: allocationsData,
        total_quantity: totalStoneQuantity,
        total_weight: totalStoneWeight,
        timestamp: new Date().toISOString(),
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      
      // Update sticker data based on whether stones were allocated
      const actualAllocations = stoneAllocations.filter(alloc => alloc.lot_number !== "None")
      setStickerData({
        "Total Stones": totalStoneQuantity,
        "Total Weight": totalStoneQuantity > 0 ? `${totalStoneWeight.toFixed(2)} ct` : "No stones allocated",
        "Allocated Lots": actualAllocations.length > 0 
          ? actualAllocations.map((a) => a.lot_number).join(", ")
          : "None",
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
      { clientId: generateAllocationClientID(), lot_number: "", size: "", shape: "", quality: "", quantity: 0, weight: 0 },
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
    () => diamondAllocations
      .filter(alloc => alloc.lot_number !== "None")
      .reduce((sum, alloc) => sum + (Number(alloc.quantity) || 0), 0),
    [diamondAllocations],
  )
  const totalDiamondWeight = useMemo(
    () => diamondAllocations
      .filter(alloc => alloc.lot_number !== "None")
      .reduce((sum, alloc) => sum + (Number(alloc.weight) || 0), 0),
    [diamondAllocations],
  )

  // QC Usage Details Totals
  const totalGoldGrossWeight = useMemo(
    () => goldUsageDetails.reduce((sum, item) => sum + (Number(item.grossWeight) || 0), 0),
    [goldUsageDetails]
  )

  const totalGoldScrapWeight = useMemo(
    () => goldUsageDetails.reduce((sum, item) => sum + (Number(item.scrapWeight) || 0), 0),
    [goldUsageDetails]
  )

  const totalDiamondReturn = useMemo(() => ({
    quantity: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.returnQuantity) || 0), 0),
    weight: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.returnWeight) || 0), 0)
  }), [diamondUsageDetails])

  const totalDiamondLoss = useMemo(() => ({
    quantity: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.lossQuantity) || 0), 0),
    weight: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.lossWeight) || 0), 0)
  }), [diamondUsageDetails])

  const totalDiamondBreak = useMemo(() => ({
    quantity: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.breakQuantity) || 0), 0),
    weight: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.breakWeight) || 0), 0)
  }), [diamondUsageDetails])

  const totalColoredStoneReturn = useMemo(() => ({
    quantity: coloredStoneUsageDetails.reduce((sum, item) => sum + (Number(item.returnQuantity) || 0), 0),
    weight: coloredStoneUsageDetails.reduce((sum, item) => sum + (Number(item.returnWeight) || 0), 0)
  }), [coloredStoneUsageDetails])

  const totalColoredStoneLoss = useMemo(() => ({
    quantity: coloredStoneUsageDetails.reduce((sum, item) => sum + (Number(item.lossQuantity) || 0), 0),
    weight: coloredStoneUsageDetails.reduce((sum, item) => sum + (Number(item.lossWeight) || 0), 0)
  }), [coloredStoneUsageDetails])

  const totalColoredStoneBreak = useMemo(() => ({
    quantity: coloredStoneUsageDetails.reduce((sum, item) => sum + (Number(item.breakQuantity) || 0), 0),
    weight: coloredStoneUsageDetails.reduce((sum, item) => sum + (Number(item.breakWeight) || 0), 0)
  }), [coloredStoneUsageDetails])

  const validateDiamondAllocations = (): boolean => {
    logger.debug("JobDetailSheet: Validating diamond allocations", { diamondAllocations })
    const errors: { [key: string]: { [field: string]: string } } = {}
    let isValid = true
    const usedLotNumbers = new Set<string>()

    diamondAllocations.forEach((alloc, index) => {
      const rowErrors: { [field: string]: string } = {}
      
      // Skip validation for "None" selections
      if (alloc.lot_number === "None") {
        return // Skip all validation for "None" rows
      }
      
      if (!alloc.lot_number) {
        rowErrors.lot_number = "Lot number is required. If no diamonds required for this job then select the None option"
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
      const allocationsData = diamondAllocations
        .filter(alloc => alloc.lot_number !== "None") // Filter out "None" allocations
        .map(({ clientId, available_quantity, ...rest }) => rest)
      
      const result = await updateJobPhase(job!.id, JOB_PHASE.DIAMOND, {
        allocations: allocationsData,
        total_quantity: totalDiamondQuantity,
        total_weight: totalDiamondWeight,
        timestamp: new Date().toISOString(),
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      
      // Update sticker data based on whether diamonds were allocated
      const actualAllocations = diamondAllocations.filter(alloc => alloc.lot_number !== "None")
      setStickerData({
        "Total Diamonds": totalDiamondQuantity,
        "Total Weight": totalDiamondQuantity > 0 ? `${totalDiamondWeight.toFixed(2)} carat` : "No diamonds allocated",
        "Allocated Lots": actualAllocations.length > 0 
          ? actualAllocations.map((a) => a.lot_number).join(", ")
          : "None",
      })
      setStickerOpen(true)
    } catch (error: any) {
      logger.error("JobDetailSheet: Error completing diamond selection", { error: error.message })
      setDiamondPhaseError(error.message || "Failed to complete diamond selection.")
    } finally {
      setIsSubmittingDiamond(false)
    }
  }

  // QC Usage Details Handlers
  const addGoldUsageRow = () => {
    setGoldUsageDetails([
      ...goldUsageDetails,
      { 
        clientId: generateAllocationClientID(), 
        description: "", 
        grossWeight: 0, 
        scrapWeight: 0 
      }
    ])
  }

  const deleteGoldUsageRow = (index: number) => {
    if (goldUsageDetails.length > 1) {
      setGoldUsageDetails(goldUsageDetails.filter((_, i) => i !== index))
      setGoldUsageErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const handleGoldUsageChange = (index: number, field: string, value: any) => {
    setGoldUsageDetails((prev) => 
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
    setGoldUsageErrors((prev) => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: "" } 
    }))
  }

  const addDiamondUsageRow = () => {
    setDiamondUsageDetails([
      ...diamondUsageDetails,
      { 
        clientId: generateAllocationClientID(), 
        type: "", 
        returnQuantity: 0, 
        returnWeight: 0, 
        lossQuantity: 0, 
        lossWeight: 0, 
        breakQuantity: 0, 
        breakWeight: 0 
      }
    ])
  }

  const deleteDiamondUsageRow = (index: number) => {
    if (diamondUsageDetails.length > 1) {
      setDiamondUsageDetails(diamondUsageDetails.filter((_, i) => i !== index))
      setDiamondUsageErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const handleDiamondUsageChange = (index: number, field: string, value: any) => {
    setDiamondUsageDetails((prev) => 
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
    setDiamondUsageErrors((prev) => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: "" } 
    }))
  }

  const addColoredStoneUsageRow = () => {
    setColoredStoneUsageDetails([
      ...coloredStoneUsageDetails,
      { 
        clientId: generateAllocationClientID(), 
        type: "", 
        returnQuantity: 0, 
        returnWeight: 0, 
        lossQuantity: 0, 
        lossWeight: 0, 
        breakQuantity: 0, 
        breakWeight: 0 
      }
    ])
  }

  const deleteColoredStoneUsageRow = (index: number) => {
    if (coloredStoneUsageDetails.length > 1) {
      setColoredStoneUsageDetails(coloredStoneUsageDetails.filter((_, i) => i !== index))
      setColoredStoneUsageErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const handleColoredStoneUsageChange = (index: number, field: string, value: any) => {
    setColoredStoneUsageDetails((prev) => 
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
    setColoredStoneUsageErrors((prev) => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: "" } 
    }))
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
    setQCError(null)
    setIsSubmittingQC(true)
    try {
      const result = await updateJobPhase(job!.id, JOB_PHASE.QUALITY_CHECK, {
        passed: passed,
        notes: qcData.notes || "",
      })
      if (!result.success) throw new Error(result.error || "Failed to update job phase")
      setJobStatus(result.newStatus!)
      setCurrentPhase(result.newPhase!)
      setQcData((prev) => ({ ...prev, passed })) // Update local QC passed state
      setStickerData({
        "QC Result": passed ? "PASSED" : "FAILED",
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
      { id: JOB_PHASE.QUALITY_CHECK, label: "QC + Received" },
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
                  <CardTitle>Job Work Phase</CardTitle>
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

                      {/* Gold Usage Details Section */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-md font-semibold mb-4">Gold Usage Details</h3>
                        <div className="grid grid-cols-[0.5fr_3fr_2fr_2fr_0.5fr] gap-4 mb-2 font-medium text-sm">
                          <div>No.</div>
                          <div>Gold Type</div>
                          <div>Gross Weight (gm)</div>
                          <div>Scrap Weight (gm)</div>
                          <div></div>
                        </div>
                        {goldUsageDetails.map((usage, index) => (
                          <GoldUsageRow
                            key={usage.clientId}
                            index={index}
                            usage={usage}
                            onChange={handleGoldUsageChange}
                            onDelete={deleteGoldUsageRow}
                            isSubmitting={isSubmittingQC}
                            validationErrors={goldUsageErrors[index] || {}}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addGoldUsageRow}
                          className="mt-4"
                          disabled={isSubmittingQC}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Gold Usage Details
                        </Button>
                        <Separator className="my-4" />
                        <div className="flex justify-end gap-8 text-sm font-semibold">
                          <div>Total Gross Weight: {totalGoldGrossWeight.toFixed(2)} gm</div>
                          <div>Total Scrap Weight: {totalGoldScrapWeight.toFixed(2)} gm</div>
                        </div>
                      </div>

                      {/* Diamond Usage Details Section */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-md font-semibold mb-4">Diamond Usage Details</h3>
                        <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 font-medium text-sm">
                          <div>No.</div>
                          <div>Type</div>
                          <div>Return Qty (Pcs)</div>
                          <div>Return Wt (Cts)</div>
                          <div>Loss Qty (Pcs)</div>
                          <div>Loss Wt (Cts)</div>
                          <div>Break Qty (Pcs)</div>
                          <div>Break Wt (Cts)</div>
                          <div></div>
                        </div>
                        {diamondUsageDetails.map((usage, index) => (
                          <DiamondUsageRow
                            key={usage.clientId}
                            index={index}
                            usage={usage}
                            diamondLots={diamondLots}
                            onChange={handleDiamondUsageChange}
                            onDelete={deleteDiamondUsageRow}
                            isSubmitting={isSubmittingQC}
                            validationErrors={diamondUsageErrors[index] || {}}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addDiamondUsageRow}
                          className="mt-4"
                          disabled={isSubmittingQC}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Diamond Usage Details
                        </Button>
                        <Separator className="my-4" />
                        <div className="flex justify-end gap-8 text-sm font-semibold">
                          <div>Return: {totalDiamondReturn.quantity} Pcs, {totalDiamondReturn.weight.toFixed(2)} Cts</div>
                          <div>Loss: {totalDiamondLoss.quantity} Pcs, {totalDiamondLoss.weight.toFixed(2)} Cts</div>
                          <div>Break: {totalDiamondBreak.quantity} Pcs, {totalDiamondBreak.weight.toFixed(2)} Cts</div>
                        </div>
                      </div>

                      {/* Colored Stone Usage Details Section */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-md font-semibold mb-4">Colored Stone Usage Details</h3>
                        <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 font-medium text-sm">
                          <div>No.</div>
                          <div>Type</div>
                          <div>Return Qty (Pcs)</div>
                          <div>Return Wt (Cts)</div>
                          <div>Loss Qty (Pcs)</div>
                          <div>Loss Wt (Cts)</div>
                          <div>Break Qty (Pcs)</div>
                          <div>Break Wt (Cts)</div>
                          <div></div>
                        </div>
                        {coloredStoneUsageDetails.map((usage, index) => (
                          <ColoredStoneUsageRow
                            key={usage.clientId}
                            index={index}
                            usage={usage}
                            stoneLots={stoneLots}
                            onChange={handleColoredStoneUsageChange}
                            onDelete={deleteColoredStoneUsageRow}
                            isSubmitting={isSubmittingQC}
                            validationErrors={coloredStoneUsageErrors[index] || {}}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addColoredStoneUsageRow}
                          className="mt-4"
                          disabled={isSubmittingQC}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Colored Stone Usage Details
                        </Button>
                        <Separator className="my-4" />
                        <div className="flex justify-end gap-8 text-sm font-semibold">
                          <div>Return: {totalColoredStoneReturn.quantity} Pcs, {totalColoredStoneReturn.weight.toFixed(2)} Cts</div>
                          <div>Loss: {totalColoredStoneLoss.quantity} Pcs, {totalColoredStoneLoss.weight.toFixed(2)} Cts</div>
                          <div>Break: {totalColoredStoneBreak.quantity} Pcs, {totalColoredStoneBreak.weight.toFixed(2)} Cts</div>
                        </div>
                      </div>

                      {/* Quality Check Notes Section */}
                      <div className="space-y-2">
                        <Label htmlFor="qcNotes">Quality Check Notes</Label>
                        <Textarea
                          id="qcNotes"
                          value={qcData.notes}
                          onChange={(e) => setQcData({ ...qcData, notes: e.target.value })}
                          disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
                          placeholder="Enter any notes about the quality check..."
                        />
                      </div>

                      {/* Actions */}
                      <Separator />
                      <div className="flex justify-between">
                        <Button
                          variant="destructive"
                          onClick={() => handleCompleteQC(false)}
                          disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
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
                          disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
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
