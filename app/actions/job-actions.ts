"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import { JOB_STATUS, JOB_PHASE, JOB_STATUS_TO_ORDER_STATUS, ORDER_STATUS } from "@/constants/job-workflow"
import type { StoneAllocation, DiamondAllocation, GoldUsageDetail, DiamondUsageDetail, ColoredStoneUsageDetail } from "@/types" // Added DiamondAllocation and QC usage detail types

// Type definitions for action parameters
type StoneSelectionData = {
  allocations: StoneAllocation[]
  total_quantity: number
  total_weight: number
  timestamp: string
}

type DiamondSelectionData = {
  // Updated structure
  allocations: DiamondAllocation[]
  total_quantity: number
  total_weight: number
  timestamp: string
}

type ManufacturerData = {
  name: string
  expectedCompletionDate: string
  remarks?: string
}

type QCData = {
  weight?: number // Keep for backward compatibility
  passed: boolean
  notes?: string
  goldUsageDetails?: GoldUsageDetail[]
  diamondUsageDetails?: DiamondUsageDetail[]
  coloredStoneUsageDetails?: ColoredStoneUsageDetail[]
}

export async function updateJobPhase(jobId: string, phase: string, data: any) {
  const startTime = performance.now()
  logger.info(`updateJobPhase called`, { data: { jobId, phase, payloadSize: JSON.stringify(data).length } })

  const supabase = createServiceClient()

  try {
    logger.debug(`Fetching job UUID from Supabase`, { data: { jobId } })
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id, order_id")
      .eq("job_id", jobId)
      .single()

    logger.debug("Job data from query", {
      jobData: jobData || "No job data found",
      jobId,
      error: jobError ? { message: jobError.message, code: jobError.code, details: jobError.details } : null,
    })

    if (jobError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching job from Supabase`, {
        data: { jobId, phase },
        error: jobError,
        duration,
      })
      return { success: false, error: "Job not found" }
    }

    let newStatus = ""
    let newPhase = ""

    switch (phase) {
      case JOB_PHASE.STONE:
        newStatus = JOB_STATUS.STONE_SELECTED
        newPhase = JOB_PHASE.DIAMOND
        break
      case JOB_PHASE.DIAMOND:
        newStatus = JOB_STATUS.DIAMOND_SELECTED
        newPhase = JOB_PHASE.MANUFACTURER
        break
      case JOB_PHASE.MANUFACTURER:
        newStatus = JOB_STATUS.SENT_TO_MANUFACTURER
        newPhase = JOB_PHASE.QUALITY_CHECK
        break
      case JOB_PHASE.QUALITY_CHECK:
        newStatus = data.passed ? JOB_STATUS.QC_PASSED : JOB_STATUS.QC_FAILED
        newPhase = data.passed ? JOB_PHASE.COMPLETE : JOB_PHASE.MANUFACTURER // Or QC_FAILED phase if exists
        break
      case JOB_PHASE.COMPLETE:
        newStatus = JOB_STATUS.COMPLETED
        newPhase = JOB_PHASE.COMPLETE
        break
      default:
        const duration = performance.now() - startTime
        logger.error(`Invalid phase provided`, {
          data: { jobId, phase },
          duration,
        })
        return { success: false, error: "Invalid phase" }
    }

    const updateData: any = {
      status: newStatus,
      current_phase: newPhase,
      updated_at: new Date().toISOString(),
    }

    if (phase === JOB_PHASE.STONE) {
      // Filter out "None" allocations before saving
      const filteredAllocations = (data as StoneSelectionData).allocations.filter(
        alloc => alloc.lot_number !== "None"
      )
      
      updateData.stone_data = {
        ...data,
        allocations: filteredAllocations
      } as StoneSelectionData
      logger.info("Stone data to be saved:", { stone_data: updateData.stone_data })
    } else if (phase === JOB_PHASE.DIAMOND) {
      // Filter out "None" allocations before saving
      const filteredAllocations = (data as DiamondSelectionData).allocations.filter(
        alloc => alloc.lot_number !== "None"
      )
      
      updateData.diamond_data = {
        ...data,
        allocations: filteredAllocations
      } as DiamondSelectionData
      logger.info("Diamond data to be saved:", { diamond_data: updateData.diamond_data })
    } else if (phase === JOB_PHASE.MANUFACTURER) {
      updateData.manufacturer_data = data
    } else if (phase === JOB_PHASE.QUALITY_CHECK) {
      // Console logging for QC data backend processing
      console.log("🔍 QC BACKEND - Backend received QC data:", data)
      console.log("🔍 QC BACKEND - QC data structure analysis:", {
        hasGoldUsage: !!data.goldUsageDetails,
        goldUsageCount: data.goldUsageDetails?.length || 0,
        hasDiamondUsage: !!data.diamondUsageDetails,
        diamondUsageCount: data.diamondUsageDetails?.length || 0,
        hasColoredStoneUsage: !!data.coloredStoneUsageDetails,
        coloredStoneUsageCount: data.coloredStoneUsageDetails?.length || 0,
        dataSize: JSON.stringify(data).length
      })
      updateData.qc_data = data
    }

    logger.debug(`Updating job in Supabase`, {
      data: {
        jobId: jobData.id,
        newStatus,
        newPhase,
        updateDataSummary: {
          ...updateData,
          stone_data: updateData.stone_data ? "PRESENT" : "ABSENT",
          diamond_data: updateData.diamond_data ? "PRESENT" : "ABSENT",
        },
      },
    })

    try {
      const { data: updatedRows, error: updateError } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobData.id)
        .select()

      if (updateError) {
        logger.error("Failed to write to jobs table", {
          jobId: jobData.id,
          updateDataAttempt: updateData, // Log the data that was attempted
          error: updateError,
        })
        return { success: false, error: "Failed to update job" }
      } else {
        logger.info("Wrote to jobs table successfully", {
          jobId: jobData.id,
          updatedRows,
        })
      }
    } catch (err) {
      logger.error("Supabase.update() threw an exception", { err })
      throw err
    }

    logger.debug(`Adding job history entry in Supabase`, {
      data: { jobId: jobData.id, newStatus },
    })

    const { error: historyError } = await supabase.from("job_history").insert({
      job_id: jobData.id,
      status: newStatus,
      action: `Completed ${phase}`,
      data: data, // Store the full phase data in history
      created_at: new Date().toISOString(),
    })

    if (historyError) {
      logger.warn(`Error adding job history in Supabase`, {
        data: { jobId: jobData.id },
        error: historyError,
      })
    }

    // Update parent order status
    logger.debug(`Updating parent order status`, {
      data: { orderId: jobData.order_id },
    })
    const { data: orderJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("status")
      .eq("order_id", jobData.order_id)

    if (jobsError) {
      logger.warn(`Error fetching jobs for order status update`, {
        data: { orderId: jobData.order_id },
        error: jobsError,
      })
    } else {
      let newOrderStatus = ORDER_STATUS.NEW
      const allJobsCompleted = orderJobs.every((job) => job.status === JOB_STATUS.COMPLETED)
      if (allJobsCompleted && orderJobs.length > 0) {
        newOrderStatus = ORDER_STATUS.COMPLETED
      } else if (orderJobs.some((job) => JOB_STATUS_TO_ORDER_STATUS[job.status] === ORDER_STATUS.PENDING)) {
        newOrderStatus = ORDER_STATUS.PENDING
      }

      logger.debug(`Setting order status to ${newOrderStatus}`, {
        data: { orderId: jobData.order_id, newOrderStatus },
      })
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          status: newOrderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobData.order_id)

      if (orderUpdateError) {
        logger.warn(`Error updating order status`, {
          data: { orderId: jobData.order_id },
          error: orderUpdateError,
        })
      } else {
        logger.info(`Order status updated successfully to ${newOrderStatus}`, {
          data: { orderId: jobData.order_id },
        })
      }
    }

    logger.debug(`Fetching order_id for revalidation`, {
      data: { orderId: jobData.order_id },
    })
    const { data: orderData } = await supabase.from("orders").select("order_id").eq("id", jobData.order_id).single()

    if (orderData?.order_id) {
      revalidatePath(`/orders/${orderData.order_id}/jobs/${jobId}`)
      revalidatePath(`/orders/${orderData.order_id}/jobs`)
      revalidatePath(`/orders`)
    } else {
      logger.warn("Could not get order_id for revalidation path", { orderIdInternal: jobData.order_id })
    }

    const duration = performance.now() - startTime
    logger.info(`updateJobPhase completed successfully`, {
      data: {
        jobId,
        phase,
        newStatus,
        newPhase,
      },
      duration,
    })

    return { success: true, newStatus, newPhase }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in updateJobPhase`, {
      data: { jobId, phase },
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Additional helper function to create a new job
export async function createJob(orderId: string, skuId: string, size?: string) {
  const startTime = performance.now()
  logger.info(`createJob called`, { data: { orderId, skuId, size } })

  const supabase = createServiceClient()

  try {
    logger.debug(`Fetching order UUID from Supabase`, { data: { orderId } })
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, production_date, delivery_date")
      .eq("order_id", orderId)
      .single()

    if (orderError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching order from Supabase`, {
        data: { orderId },
        error: orderError,
        duration,
      })
      return { success: false, error: "Order not found" }
    }

    logger.debug(`Fetching SKU UUID from Supabase`, { data: { skuId } })
    const { data: skuData, error: skuError } = await supabase.from("skus").select("id").eq("sku_id", skuId).single()

    if (skuError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching SKU from Supabase`, {
        data: { skuId },
        error: skuError,
        duration,
      })
      return { success: false, error: "SKU not found" }
    }

    logger.debug(`Counting existing jobs for order`, { data: { orderId: orderData.id } })
    const { count, error: countError } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("order_id", orderData.id)

    if (countError) {
      const duration = performance.now() - startTime
      logger.error(`Error counting jobs from Supabase`, {
        data: { orderId: orderData.id },
        error: countError,
        duration,
      })
      return { success: false, error: "Failed to generate job ID" }
    }

    const sequence = (count || 0) + 1
    const newJobId = `J${orderId.substring(1)}-${sequence}`

    logger.debug(`Creating new job in Supabase`, {
      data: {
        jobId: newJobId,
        orderId: orderData.id,
        skuId: skuData.id,
        size,
      },
    })

    const { data: newJob, error: insertError } = await supabase
      .from("jobs")
      .insert({
        job_id: newJobId,
        order_id: orderData.id,
        sku_id: skuData.id,
        size: size,
        status: JOB_STATUS.NEW,
        current_phase: JOB_PHASE.STONE,
        production_date: orderData.production_date,
        due_date: orderData.delivery_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      const duration = performance.now() - startTime
      logger.error(`Error creating job in Supabase`, {
        data: { jobId: newJobId },
        error: insertError,
        duration,
      })
      return { success: false, error: "Failed to create job" }
    }

    logger.debug(`Adding job history entry in Supabase`, {
      data: { jobId: newJob[0].id },
    })

    await supabase.from("job_history").insert({
      job_id: newJob[0].id,
      status: JOB_STATUS.NEW,
      action: "Job created",
      created_at: new Date().toISOString(),
    })

    revalidatePath(`/orders/${orderId}/jobs`)

    const duration = performance.now() - startTime
    logger.info(`createJob completed successfully`, {
      data: { orderId, skuId, jobId: newJobId },
      duration,
    })

    return { success: true, jobId: newJobId }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createJob`, {
      data: { orderId, skuId },
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}
