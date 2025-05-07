"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"

// Type definitions for action parameters
type StoneSelectionData = {
  lotNumber: string
  quantity: number
  weight: number
  remarks?: string
}

type DiamondSelectionData = {
  lotNumber: string
  karat: number
  clarity: string
  quantity: number
  weight: number
  remarks?: string
}

type ManufacturerData = {
  name: string
  expectedCompletionDate: string
  remarks?: string
}

type QCData = {
  weight: number
  passed: boolean
  notes: string
}

export async function updateJobPhase(jobId: string, phase: string, data: any) {
  const startTime = performance.now()
  logger.info(`updateJobPhase called`, { data: { jobId, phase } })

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Get job UUID from job_id
    logger.debug(`Fetching job UUID from Supabase`, { data: { jobId } })
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id, order_id")
      .eq("job_id", jobId)
      .single()

    // Add detailed logging to see if jobData is null or undefined
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

    // Determine new status and phase based on current phase
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
        newPhase = data.passed ? JOB_PHASE.COMPLETE : JOB_PHASE.MANUFACTURER
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

    // Update job with new status, phase and data
    const updateData: any = {
      status: newStatus,
      current_phase: newPhase,
      updated_at: new Date().toISOString(),
    }

    // Add phase-specific data
    if (phase === JOB_PHASE.STONE) {
      updateData.stone_data = data
    } else if (phase === JOB_PHASE.DIAMOND) {
      updateData.diamond_data = data
    } else if (phase === JOB_PHASE.MANUFACTURER) {
      updateData.manufacturer_data = data
    } else if (phase === JOB_PHASE.QUALITY_CHECK) {
      updateData.qc_data = data
    }

    // Update job
    logger.debug(`Updating job in Supabase`, {
      data: {
        jobId: jobData.id,
        newStatus,
        newPhase,
        updateData,
      },
    })

    // 1. Wrap in try/catch to catch thrown exceptions
    try {
      // 2. Ask Supabase to return the updated rows
      const { data: updatedRows, error: updateError } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobData.id)
        .select() // ← new

      if (updateError) {
        // 3. Log full error object
        logger.error("Failed to write to jobs table", {
          jobId: jobData.id,
          updateData,
          error: updateError,
        })
        return { success: false, error: "Failed to update job" }
      } else {
        // 4. Log the returned rows to confirm what was written
        logger.info("Wrote to jobs table successfully", {
          jobId: jobData.id,
          updatedRows, // ← new
        })
      }
    } catch (err) {
      // 5. Catch and log any unexpected exception
      logger.error("Supabase.update() threw an exception", { err })
      throw err
    }

    // Add entry to job history
    logger.debug(`Adding job history entry in Supabase`, {
      data: { jobId: jobData.id, newStatus },
    })

    const { error: historyError } = await supabase.from("job_history").insert({
      job_id: jobData.id,
      status: newStatus,
      action: `Completed ${phase}`,
      data: data,
      created_at: new Date().toISOString(),
    })

    if (historyError) {
      logger.warn(`Error adding job history in Supabase`, {
        data: { jobId: jobData.id },
        error: historyError,
      })
    }

    // Get order_id for revalidation
    logger.debug(`Fetching order_id for revalidation`, {
      data: { orderId: jobData.order_id },
    })

    const { data: orderData } = await supabase.from("orders").select("order_id").eq("id", jobData.order_id).single()

    // Revalidate paths
    revalidatePath(`/orders/${orderData.order_id}/jobs/${jobId}`)
    revalidatePath(`/orders/${orderData.order_id}/jobs`)

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

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Get order UUID from order_id
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

    // Get SKU UUID from sku_id
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

    // Get count of existing jobs for this order to generate sequence number
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

    // Generate job ID: J[Order Number]-[Sequence]
    const sequence = (count || 0) + 1
    const jobId = `J${orderId.substring(1)}-${sequence}`

    // Insert new job
    logger.debug(`Creating new job in Supabase`, {
      data: {
        jobId,
        orderId: orderData.id,
        skuId: skuData.id,
        size,
      },
    })

    const { data: newJob, error: insertError } = await supabase
      .from("jobs")
      .insert({
        job_id: jobId,
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
        data: { jobId },
        error: insertError,
        duration,
      })
      return { success: false, error: "Failed to create job" }
    }

    // Add entry to job history
    logger.debug(`Adding job history entry in Supabase`, {
      data: { jobId: newJob[0].id },
    })

    await supabase.from("job_history").insert({
      job_id: newJob[0].id,
      status: JOB_STATUS.NEW,
      action: "Job created",
      created_at: new Date().toISOString(),
    })

    // Revalidate paths
    revalidatePath(`/orders/${orderId}/jobs`)

    const duration = performance.now() - startTime
    logger.info(`createJob completed successfully`, {
      data: { orderId, skuId, jobId },
      duration,
    })

    return { success: true, jobId }
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
