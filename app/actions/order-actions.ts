// app/actions/order-actions.ts

"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { Order } from "@/types"
import { JOB_STATUS, JOB_PHASE, ORDER_STATUS } from "@/constants/job-workflow"

export async function createOrder(orderData: Omit<Order, "id">) {
  const startTime = performance.now()
  logger.info(`createOrder called`, { data: orderData })

  // Check if we're using mocks
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  if (useMocks) {
    // In mock mode, just log and return success
    const duration = performance.now() - startTime
    logger.info(`createOrder completed with mock data`, {
      data: { orderId: "mock-order-id" },
      duration,
    })
    return { success: true, orderId: "mock-order-id" }
  }

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Insert order - remove id field to let the database generate it
    logger.debug(`Creating order in Supabase`, { data: orderData })
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        // Remove order_id field to let the database trigger generate it
        order_type: orderData.orderType,
        customer_name: orderData.customerName,
        customer_id: orderData.customerId,
        production_date: orderData.productionDate,
        delivery_date: orderData.dueDate,
        status: orderData.status || ORDER_STATUS.NEW,
        action: orderData.action,
        remarks: orderData.remarks,
        created_at: orderData.createdAt || new Date().toISOString(),
      })
      .select("id, order_id")
      .single()

    if (orderError) {
      const duration = performance.now() - startTime
      logger.error(`Error creating order in Supabase`, {
        data: orderData,
        error: orderError,
        duration,
      })
      return { success: false, error: `Failed to create order: ${orderError.message}` }
    }

    // Fetch SKU data
    const skuIds = orderData.skus.map((sku) => sku.id)
    const { data: skuData, error: skuError } = await supabase.from("skus").select("id, sku_id").in("sku_id", skuIds)

    if (skuError || !skuData) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching SKU data from Supabase`, {
        data: { skuIds },
        error: skuError,
        duration,
      })
      return { success: false, error: `Failed to fetch SKU data: ${skuError?.message || "Unknown error"}` }
    }

    // Insert order items
    // Create a map of SKU ID to UUID
    const skuIdToUuid = Object.fromEntries(skuData.map((sku) => [sku.sku_id, sku.id]))

    // Prepare order items
    const orderItems = orderData.skus.map((sku) => ({
      order_id: newOrder.id,
      sku_id: skuIdToUuid[sku.id],
      quantity: sku.quantity,
      size: sku.size,
      remarks: sku.remarks,
      individual_production_date: sku.individualProductionDate || null,
      individual_delivery_date: sku.individualDeliveryDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // --- 1) bulk insert order_items AND return rows -----------------
    logger.debug(`Creating order items in Supabase`, {
      data: { orderId: newOrder.order_id, itemCount: orderItems.length },
    })
    const { data: insertedItems, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select("id, sku_id, quantity, size, remarks, individual_production_date, individual_delivery_date")

    if (itemsError) {
      const duration = performance.now() - startTime
      logger.error(`Error creating order items in Supabase`, {
        data: { orderId: newOrder.order_id, orderUuid: newOrder.id },
        error: itemsError,
        duration,
      })
      return { success: false, error: `Failed to create order items: ${itemsError.message}` }
    }
    // ----------------------------------------------------------------

    // ──────────────── JOB GENERATION START ────────────────
    logger.debug(`Starting job generation for order`, {
      data: { orderId: newOrder.order_id, itemCount: insertedItems.length },
    })

    // --- 2) build jobs in memory ------------------------------------
    const nowIso = new Date().toISOString()
    const jobs: any[] = []
    let seq = 1

    for (const item of insertedItems) {
      const prodDate = item.individual_production_date ?? orderData.productionDate
      const dueDate = item.individual_delivery_date ?? orderData.dueDate

      logger.debug(`Generating jobs for order item`, {
        data: {
          orderItemId: item.id,
          skuId: item.sku_id,
          quantity: item.quantity,
          prodDate,
          dueDate,
        },
      })

      for (let copy = 1; copy <= item.quantity; copy++) {
        jobs.push({
          job_id: `J${newOrder.order_id.substring(1)}-${seq++}`,
          order_id: newOrder.id,
          order_item_id: item.id,
          sku_id: item.sku_id,
          size: item.size,
          status: JOB_STATUS.NEW,
          current_phase: JOB_PHASE.STONE,
          production_date: prodDate,
          due_date: dueDate,
          created_at: nowIso,
          updated_at: nowIso,
        })
      }
    }
    // ----------------------------------------------------------------

    // --- 3) bulk insert jobs ----------------------------------------
    logger.debug(`Inserting ${jobs.length} jobs into Supabase`, {
      data: { orderId: newOrder.order_id },
    })
    const { data: jobRows, error: jobsError } = await supabase.from("jobs").insert(jobs).select("id")

    if (jobsError) {
      const duration = performance.now() - startTime
      logger.error(`Error creating jobs in Supabase`, {
        data: { orderId: newOrder.order_id, jobCount: jobs.length },
        error: jobsError,
        duration,
      })
      return { success: false, error: `Failed to create jobs: ${jobsError.message}` }
    }
    // ----------------------------------------------------------------

    // --- 4) optional initial history --------------------------------
    logger.debug(`Creating job history entries`, {
      data: { orderId: newOrder.order_id, jobCount: jobRows.length },
    })
    const history = jobRows.map((j) => ({
      job_id: j.id,
      status: JOB_STATUS.NEW,
      action: "Job created",
      created_at: nowIso,
    }))

    const { error: historyError } = await supabase.from("job_history").insert(history)

    if (historyError) {
      // Non-critical error - log but don't fail the order creation
      logger.warn(`Error creating job history entries in Supabase`, {
        data: { orderId: newOrder.order_id, jobCount: jobRows.length },
        error: historyError,
      })
    }
    // ────────────────  JOB GENERATION END  ────────────────

    // Revalidate paths
    revalidatePath("/orders")

    const duration = performance.now() - startTime
    logger.info(`createOrder completed successfully`, {
      data: {
        orderId: newOrder.order_id,
        orderUuid: newOrder.id,
        itemCount: orderData.skus?.length || 0,
        jobsCreated: jobs.length,
      },
      duration,
    })

    // Return the server-generated order ID
    return { success: true, orderId: newOrder.order_id }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createOrder`, {
      data: orderData,
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateOrder(orderData: Order) {
  const startTime = performance.now()
  logger.info(`updateOrder called`, { data: { orderId: orderData.id } })

  // Check if we're using mocks
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  if (useMocks) {
    // In mock mode, just log and return success
    const duration = performance.now() - startTime
    logger.info(`updateOrder completed with mock data`, {
      data: { orderId: orderData.id },
      duration,
    })
    return { success: true, orderId: orderData.id }
  }

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // First, get the UUID of the order
    const { data: orderData, error: orderQueryError } = await supabase
      .from("orders")
      .select("id")
      .eq("order_id", orderData.id)
      .single()

    if (orderQueryError || !orderData) {
      const duration = performance.now() - startTime
      logger.error(`Error finding order in Supabase`, {
        data: { orderId: orderData.id },
        error: orderQueryError,
        duration,
      })
      return { success: false, error: `Failed to find order: ${orderQueryError?.message || "Order not found"}` }
    }

    const orderUuid = orderData.id

    // Update order
    logger.debug(`Updating order in Supabase`, { data: { orderId: orderData.id, orderUuid } })
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        order_type: orderData.orderType,
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        production_date: orderData.productionDate,
        delivery_date: orderData.dueDate,
        status: orderData.status,
        action: orderData.action,
        remarks: orderData.remarks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderUuid)

    if (updateError) {
      const duration = performance.now() - startTime
      logger.error(`Error updating order in Supabase`, {
        data: { orderId: orderData.id, orderUuid },
        error: updateError,
        duration,
      })
      return { success: false, error: `Failed to update order: ${updateError.message}` }
    }

    // Handle order items - first delete existing items
    logger.debug(`Deleting existing order items in Supabase`, { data: { orderId: orderData.id, orderUuid } })
    const { error: deleteItemsError } = await supabase.from("order_items").delete().eq("order_id", orderUuid)

    if (deleteItemsError) {
      const duration = performance.now() - startTime
      logger.error(`Error deleting order items in Supabase`, {
        data: { orderId: orderData.id, orderUuid },
        error: deleteItemsError,
        duration,
      })
      return { success: false, error: `Failed to delete order items: ${deleteItemsError.message}` }
    }

    // Insert new order items
    if (orderData.skus && orderData.skus.length > 0) {
      logger.debug(`Creating updated order items in Supabase`, {
        data: { orderId: orderData.id, itemCount: orderData.skus.length },
      })

      // First, get SKU UUIDs
      const skuIds = orderData.skus.map((sku) => sku.id)
      const { data: skuData, error: skuError } = await supabase.from("skus").select("id, sku_id").in("sku_id", skuIds)

      if (skuError || !skuData) {
        const duration = performance.now() - startTime
        logger.error(`Error fetching SKU UUIDs from Supabase`, {
          data: { orderId: orderData.id, skuIds },
          error: skuError,
          duration,
        })
        return { success: false, error: `Failed to fetch SKUs: ${skuError?.message || "Unknown error"}` }
      }

      // Create a map of SKU ID to UUID
      const skuIdToUuid = Object.fromEntries(skuData.map((sku) => [sku.sku_id, sku.id]))

      // Prepare order items
      const orderItems = orderData.skus.map((sku) => ({
        order_id: orderUuid,
        sku_id: skuIdToUuid[sku.id],
        quantity: sku.quantity,
        size: sku.size,
        remarks: sku.remarks,
        individual_production_date: sku.individualProductionDate || null,
        individual_delivery_date: sku.individualDeliveryDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      // Insert order items
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        const duration = performance.now() - startTime
        logger.error(`Error creating updated order items in Supabase`, {
          data: { orderId: orderData.id, orderUuid },
          error: itemsError,
          duration,
        })
        return { success: false, error: `Failed to create order items: ${itemsError.message}` }
      }
    } else {
      logger.warn(`Order updated with no items`, {
        data: { orderId: orderData.id, orderUuid },
      })
    }

    // Revalidate paths
    revalidatePath("/orders")

    const duration = performance.now() - startTime
    logger.info(`updateOrder completed successfully`, {
      data: {
        orderId: orderData.id,
        orderUuid,
        itemCount: orderData.skus?.length || 0,
      },
      duration,
    })

    return { success: true, orderId: orderData.id }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in updateOrder`, {
      data: { orderId: orderData.id },
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteOrder(orderId: string) {
  const startTime = performance.now()
  logger.info(`deleteOrder called`, { data: { orderId } })

  // Check if we're using mocks
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  if (useMocks) {
    // In mock mode, just log and return success
    const duration = performance.now() - startTime
    logger.info(`deleteOrder completed with mock data`, {
      data: { orderId },
      duration,
    })
    return { success: true }
  }

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // First, get the UUID of the order
    const { data: orderData, error: orderQueryError } = await supabase
      .from("orders")
      .select("id")
      .eq("order_id", orderId)
      .single()

    if (orderQueryError || !orderData) {
      const duration = performance.now() - startTime
      logger.error(`Error finding order in Supabase`, {
        data: { orderId },
        error: orderQueryError,
        duration,
      })
      return { success: false, error: `Failed to find order: ${orderQueryError?.message || "Order not found"}` }
    }

    const orderUuid = orderData.id

    // Delete order items first (due to foreign key constraints)
    logger.debug(`Deleting order items in Supabase`, { data: { orderId, orderUuid } })
    const { error: deleteItemsError } = await supabase.from("order_items").delete().eq("order_id", orderUuid)

    if (deleteItemsError) {
      const duration = performance.now() - startTime
      logger.error(`Error deleting order items in Supabase`, {
        data: { orderId, orderUuid },
        error: deleteItemsError,
        duration,
      })
      return { success: false, error: `Failed to delete order items: ${deleteItemsError.message}` }
    }

    // Delete jobs associated with the order
    logger.debug(`Deleting jobs in Supabase`, { data: { orderId, orderUuid } })
    const { error: deleteJobsError } = await supabase.from("jobs").delete().eq("order_id", orderUuid)

    if (deleteJobsError) {
      const duration = performance.now() - startTime
      logger.error(`Error deleting jobs in Supabase`, {
        data: { orderId, orderUuid },
        error: deleteJobsError,
        duration,
      })
      return { success: false, error: `Failed to delete jobs: ${deleteJobsError.message}` }
    }

    // Delete the order
    logger.debug(`Deleting order in Supabase`, { data: { orderId, orderUuid } })
    const { error: deleteOrderError } = await supabase.from("orders").delete().eq("id", orderUuid)

    if (deleteOrderError) {
      const duration = performance.now() - startTime
      logger.error(`Error deleting order in Supabase`, {
        data: { orderId, orderUuid },
        error: deleteOrderError,
        duration,
      })
      return { success: false, error: `Failed to delete order: ${deleteOrderError.message}` }
    }

    // Revalidate paths
    revalidatePath("/orders")

    const duration = performance.now() - startTime
    logger.info(`deleteOrder completed successfully`, {
      data: { orderId, orderUuid },
      duration,
    })

    return { success: true }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in deleteOrder`, {
      data: { orderId },
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Predicts the next order number based on the most recent order
 * This is used for UI display only and doesn't create an actual order
 * @returns Object containing the predicted order number
 */
export async function getPredictedNextOrderNumber() {
  const startTime = performance.now()
  logger.info(`getPredictedNextOrderNumber called`)

  // Check if we're using mocks
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  if (useMocks) {
    // In mock mode, return a mock prediction
    const duration = performance.now() - startTime
    logger.info(`getPredictedNextOrderNumber completed with mock data`, {
      data: { predictedOrderId: "O-XXXX" },
      duration,
    })
    return { success: true, predictedOrderId: "O-XXXX" }
  }

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Fetch the most recent order from Supabase
    const { data, error } = await supabase
      .from("orders")
      .select("order_id")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching most recent order from Supabase`, {
        error,
        duration,
      })
      return { success: false, error: error.message, predictedOrderId: null }
    }

    // If no orders exist, return a default starting number
    if (!data || data.length === 0) {
      const duration = performance.now() - startTime
      logger.info(`No existing orders found, returning default starting order ID`, { duration })
      return {
        success: true,
        predictedOrderId: "O-0001",
      }
    }

    // Extract the numerical part (assuming format O-####)
    const latestOrderId = data[0].order_id
    const match = latestOrderId.match(/O-(\d+)$/)

    if (!match) {
      logger.warn(`Could not extract numerical part from order ID: ${latestOrderId}`)
      return {
        success: true,
        predictedOrderId: "O-0001",
      }
    }

    // Increment by 1
    const currentNum = Number.parseInt(match[1], 10)
    const nextNum = currentNum + 1
    const predictedOrderId = `O-${String(nextNum).padStart(4, "0")}`

    const duration = performance.now() - startTime
    logger.info(`getPredictedNextOrderNumber completed successfully - Predicted order ID: ${predictedOrderId}`, {
      data: {
        latestOrderId,
        predictedOrderId,
      },
      duration,
    })

    return {
      success: true,
      predictedOrderId,
    }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in getPredictedNextOrderNumber`, {
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return { success: false, error: "An unexpected error occurred", predictedOrderId: null }
  }
}
