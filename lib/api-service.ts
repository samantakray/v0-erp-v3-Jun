import { supabase } from "./supabaseClient"
import { logger } from "./logger"
import type { Order, SKU, Job } from "@/types"
import { orders as mockOrders } from "@/mocks/orders"
import { skus as mockSkus } from "@/mocks/skus"
import { jobs as mockJobs } from "@/mocks/jobs"

// Helper to determine if we should use mock data
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

export async function fetchOrder(orderId: string): Promise<{ order: Order | null }> {
  const startTime = performance.now()
  logger.info(`fetchOrder called`, { data: { orderId, useMocks } })

  if (useMocks) {
    // Use mock data
    const order = mockOrders.find((o) => o.id === orderId) || null
    const duration = performance.now() - startTime
    logger.info(`fetchOrder completed with mock data`, {
      data: { orderId, found: !!order },
      duration,
    })
    return { order }
  }

  try {
    // Get order
    logger.debug(`Fetching order from Supabase`, { data: { orderId } })
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (orderError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching order from Supabase`, {
        data: { orderId },
        error: orderError,
        duration,
      })
      return { order: null }
    }

    // Get order items with SKU details
    logger.debug(`Fetching order items from Supabase`, { data: { orderId: orderData.id } })
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        skus:sku_id (*)
      `)
      .eq("order_id", orderData.id)

    if (itemsError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching order items from Supabase`, {
        data: { orderId: orderData.id },
        error: itemsError,
        duration,
      })
      return { order: null }
    }

    // Check if order items are empty
    if (orderItems.length === 0) {
      logger.info(`No order items found for order`, {
        data: { orderId, orderUuid: orderData.id },
      })
    }

    // Format order with items
    const order: Order = {
      id: orderData.order_id,
      orderType: orderData.order_type,
      customerName: orderData.customer_name,
      skus: orderItems.map((item) => ({
        id: item.skus.sku_id,
        name: item.skus.name,
        quantity: item.quantity,
        size: item.size,
        remarks: item.remarks,
        image: item.skus.image_url,
        category: item.skus.category,
        goldType: item.skus.gold_type,
        stoneType: item.skus.stone_type,
        diamondType: item.skus.diamond_type,
      })),
      dueDate: orderData.delivery_date,
      productionDate: orderData.production_date,
      status: orderData.status,
      action: orderData.action || "View details",
      remarks: orderData.remarks,
      createdAt: orderData.created_at,
    }

    const duration = performance.now() - startTime
    logger.info(`fetchOrder completed successfully`, {
      data: {
        orderId,
        itemCount: order.skus.length,
        status: order.status,
      },
      duration,
    })

    return { order }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchOrder`, {
      data: { orderId },
      error,
      duration,
    })
    return { order: null }
  }
}

export async function fetchJobs(orderId: string): Promise<Job[]> {
  const startTime = performance.now()
  logger.info(`fetchJobs called`, { data: { orderId, useMocks } })

  if (useMocks) {
    // Use mock data
    const jobs = mockJobs.filter((job) => job.orderId === orderId)
    const duration = performance.now() - startTime
    logger.info(`fetchJobs completed with mock data`, {
      data: { orderId, count: jobs.length },
      duration,
    })
    return jobs
  }

  try {
    // Get order ID (UUID) from order_id
    logger.debug(`Fetching order UUID from Supabase`, { data: { orderId } })
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("order_id", orderId)
      .single()

    if (orderError || !orderData) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching order UUID from Supabase`, {
        data: { orderId },
        error: orderError,
        duration,
      })
      return []
    }

    // Get jobs for this order
    logger.debug(`Fetching jobs from Supabase`, { data: { orderId: orderData.id } })
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        skus:sku_id (*)
      `)
      .eq("order_id", orderData.id)

    if (error || !data) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching jobs from Supabase`, {
        data: { orderId: orderData.id },
        error,
        duration,
      })
      return []
    }

    // Check if jobs are empty
    if (data.length === 0) {
      logger.info(`No jobs found for order`, {
        data: { orderId, orderUuid: orderData.id },
      })
    }

    // Format jobs
    const jobs = data.map((job) => ({
      id: job.job_id,
      orderId: orderId,
      skuId: job.skus.sku_id,
      name: job.skus.name,
      category: job.skus.category,
      goldType: job.skus.gold_type,
      stoneType: job.skus.stone_type,
      diamondType: job.skus.diamond_type,
      size: job.size,
      status: job.status,
      manufacturer: job.manufacturer_data?.name || "Pending",
      productionDate: job.production_date,
      dueDate: job.due_date,
      createdAt: job.created_at,
      image: job.skus.image_url,
      currentPhase: job.current_phase,
      stoneData: job.stone_data,
      diamondData: job.diamond_data,
      manufacturerData: job.manufacturer_data,
      qcData: job.qc_data,
    }))

    const duration = performance.now() - startTime
    logger.info(`fetchJobs completed successfully`, {
      data: { orderId, count: jobs.length },
      duration,
    })

    return jobs
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchJobs`, {
      data: { orderId },
      error,
      duration,
    })
    return []
  }
}

export async function fetchJob(jobId: string): Promise<Job | null> {
  const startTime = performance.now()
  logger.info(`fetchJob called`, { data: { jobId, useMocks } })

  if (useMocks) {
    // Use mock data
    const job = mockJobs.find((job) => job.id === jobId) || null
    const duration = performance.now() - startTime
    logger.info(`fetchJob completed with mock data`, {
      data: { jobId, found: !!job },
      duration,
    })
    return job
  }

  try {
    // Get job with SKU details
    logger.debug(`Fetching job from Supabase`, { data: { jobId } })
    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        skus:sku_id (*),
        orders:order_id (order_id)
      `)
      .eq("job_id", jobId)
      .single()

    if (error || !job) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching job from Supabase`, {
        data: { jobId },
        error,
        duration,
      })
      return null
    }

    // Format job
    const formattedJob: Job = {
      id: job.job_id,
      orderId: job.orders.order_id,
      skuId: job.skus.sku_id,
      name: job.skus.name,
      category: job.skus.category,
      goldType: job.skus.gold_type,
      stoneType: job.skus.stone_type,
      diamondType: job.skus.diamond_type,
      size: job.size,
      status: job.status,
      manufacturer: job.manufacturer_data?.name || "Pending",
      productionDate: job.production_date,
      dueDate: job.due_date,
      createdAt: job.created_at,
      image: job.skus.image_url,
      currentPhase: job.current_phase,
      stoneData: job.stone_data,
      diamondData: job.diamond_data,
      manufacturerData: job.manufacturer_data,
      qcData: job.qc_data,
    }

    const duration = performance.now() - startTime
    logger.info(`fetchJob completed successfully`, {
      data: {
        jobId,
        status: formattedJob.status,
        phase: formattedJob.currentPhase,
      },
      duration,
    })

    return formattedJob
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchJob`, {
      data: { jobId },
      error,
      duration,
    })
    return null
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const startTime = performance.now()
  logger.info(`fetchOrders called`, { data: { useMocks } })

  if (useMocks) {
    // Use mock data
    const duration = performance.now() - startTime
    logger.info(`fetchOrders completed with mock data`, {
      data: { count: mockOrders.length },
      duration,
    })
    return mockOrders
  }

  try {
    // Get all orders
    logger.debug(`Fetching orders from Supabase`)
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error || !data) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching orders from Supabase`, {
        error,
        duration,
      })
      return []
    }

    // Check if orders are empty
    if (data.length === 0) {
      logger.info(`No orders found in database`)
    }

    // Format orders
    const orders = await Promise.all(
      data.map(async (orderData) => {
        // Get order items with SKU details
        logger.debug(`Fetching order items for order`, { data: { orderId: orderData.id } })
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            *,
            skus:sku_id (*)
          `)
          .eq("order_id", orderData.id)

        if (itemsError) {
          logger.warn(`Error fetching order items for order`, {
            data: { orderId: orderData.id },
            error: itemsError,
          })
        }

        // Check if order items are empty
        if (!orderItems || orderItems.length === 0) {
          logger.info(`No order items found for order`, {
            data: { orderId: orderData.order_id, orderUuid: orderData.id },
          })
        }

        return {
          id: orderData.order_id,
          orderType: orderData.order_type,
          customerName: orderData.customer_name,
          skus: (orderItems || []).map((item) => ({
            id: item.skus.sku_id,
            name: item.skus.name,
            quantity: item.quantity,
            size: item.size,
            remarks: item.remarks,
            image: item.skus.image_url,
            category: item.skus.category,
            goldType: item.skus.gold_type,
            stoneType: item.skus.stone_type,
            diamondType: item.skus.diamond_type,
          })),
          dueDate: orderData.delivery_date,
          productionDate: orderData.production_date,
          status: orderData.status,
          action: orderData.action || "View details",
          remarks: orderData.remarks,
          createdAt: orderData.created_at,
        }
      }),
    )

    const duration = performance.now() - startTime
    logger.info(`fetchOrders completed successfully`, {
      data: { count: orders.length },
      duration,
    })

    return orders
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchOrders`, {
      error,
      duration,
    })
    return []
  }
}

export async function fetchSkus(): Promise<SKU[]> {
  const startTime = performance.now()
  logger.info(`fetchSkus called`, { data: { useMocks } })

  if (useMocks) {
    // Use mock data
    const duration = performance.now() - startTime
    logger.info(`fetchSkus completed with mock data`, {
      data: { count: mockSkus.length },
      duration,
    })
    return mockSkus
  }

  try {
    // Get all SKUs
    logger.debug(`Fetching SKUs from Supabase`)
    const { data, error } = await supabase.from("skus").select("*").order("created_at", { ascending: false })

    if (error || !data) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching SKUs from Supabase`, {
        error,
        duration,
      })
      return []
    }

    // Check if SKUs are empty
    if (data.length === 0) {
      logger.info(`No SKUs found in database`)
    }

    // Format SKUs
    const skus = data.map((sku) => ({
      id: sku.sku_id,
      name: sku.name,
      category: sku.category,
      goldType: sku.gold_type,
      stoneType: sku.stone_type,
      diamondType: sku.diamond_type,
      image: sku.image_url,
      createdAt: sku.created_at,
    }))

    const duration = performance.now() - startTime
    logger.info(`fetchSkus completed successfully`, {
      data: { count: skus.length },
      duration,
    })

    return skus
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchSkus`, {
      error,
      duration,
    })
    return []
  }
}

// Add the following import at the top of the file if there's a mocks/customers.ts file
// import { customers as mockCustomers } from "@/mocks/customers"

// Add this function after the other fetch functions
export async function fetchCustomers() {
  const startTime = performance.now()
  logger.info(`fetchCustomers called`, { data: { useMocks } })

  if (useMocks) {
    // Use mock data if available, otherwise return empty array
    // If you create a mocks/customers.ts file, use that instead
    const mockCustomers = [
      {
        id: "1",
        name: "Mock Customer 1",
        contact_person: "Contact Person 1",
        email: "contact1@example.com",
        phone: "1234567890",
      },
      {
        id: "2",
        name: "Mock Customer 2",
        contact_person: "Contact Person 2",
        email: "contact2@example.com",
        phone: "0987654321",
      },
    ]

    const duration = performance.now() - startTime
    logger.info(`fetchCustomers completed with mock data`, {
      data: { count: mockCustomers.length },
      duration,
    })
    return mockCustomers
  }

  try {
    // Get all customers
    logger.debug(`Fetching customers from Supabase with active=true filter`)
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })

    // Log the raw response for debugging
    logger.debug(`Supabase customers query response:`, {
      data: data ? { count: data.length, sample: data.slice(0, 2) } : null,
      error: error || null,
    })

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching customers from Supabase`, {
        error,
        duration,
      })
      return []
    }

    // Check if customers are empty
    if (!data || data.length === 0) {
      logger.warn(`No customers found in database (active=true filter applied)`)

      // Try without the active filter to see if that's the issue
      logger.debug(`Trying to fetch customers without active filter for debugging`)
      const { data: allData, error: allError } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true })

      logger.debug(`All customers query response:`, {
        data: allData ? { count: allData.length, sample: allData.slice(0, 2) } : null,
        error: allError || null,
      })

      return []
    }

    const duration = performance.now() - startTime
    logger.info(`fetchCustomers completed successfully`, {
      data: { count: data.length, firstCustomer: data[0]?.name },
      duration,
    })

    return data
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchCustomers`, {
      error,
      duration,
    })
    return []
  }
}
