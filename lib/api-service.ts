// ./lib/api-service.ts

import { supabase } from "./supabaseClient"
import { logger } from "./logger"
import type { Order, SKU, Job, StoneLotData, DiamondLotData } from "@/types" // Added DiamondLotData
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

export async function fetchAllJobs(): Promise<Job[]> {
  const startTime = performance.now()
  logger.info(`fetchAllJobs called`, { data: { useMocks } })

  if (useMocks) {
    // Use mock data
    const duration = performance.now() - startTime
    logger.info(`fetchAllJobs completed with mock data`, {
      data: { count: mockJobs.length },
      duration,
    })
    return mockJobs
  }

  try {
    // Get all jobs with SKU and order details
    logger.debug(`Fetching all jobs from Supabase`)
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        skus:sku_id (*),
        orders:order_id (order_id)
      `)
      .order('created_at', { ascending: false })

    if (error || !data) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching jobs from Supabase`, {
        error,
        duration,
      })
      return []
    }

    // Check if jobs are empty
    if (data.length === 0) {
      logger.info(`No jobs found in database`)
    }

    // Format jobs
    const jobs = data.map((job) => ({
      id: job.job_id,
      orderId: job.orders?.order_id || 'Unknown',
      skuId: job.skus?.sku_id || 'Unknown',
      name: job.skus?.name || 'Unknown',
      category: job.skus?.category || '',
      goldType: job.skus?.gold_type || '',
      stoneType: job.skus?.stone_type || '',
      diamondType: job.skus?.diamond_type || '',
      size: job.size || '',
      status: job.status,
      manufacturer: job.manufacturer_data?.name || "Pending",
      productionDate: job.production_date,
      dueDate: job.due_date,
      createdAt: job.created_at,
      image: job.skus?.image_url || '',
      currentPhase: job.current_phase,
      stoneData: job.stone_data,
      diamondData: job.diamond_data,
      manufacturerData: job.manufacturer_data,
      qcData: job.qc_data,
    }))

    const duration = performance.now() - startTime
    logger.info(`fetchAllJobs completed successfully`, {
      data: { count: jobs.length },
      duration,
    })

    return jobs
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchAllJobs`, {
      error,
      duration,
    })
    return []
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

    // Log a sample of the raw data to debug
    if (data.length > 0) {
      logger.debug(`Sample SKU data from database:`, {
        sample: data[0],
      })
    }

    // Format SKUs
    const skus = data.map((sku) => ({
      id: sku.sku_id,
      name: sku.name,
      category: sku.category,
      collection: sku.collection,
      size: sku.size !== null && sku.size !== undefined ? Number(sku.size) : null,
      goldType: sku.gold_type,
      stoneType: sku.stone_type,
      diamondType: sku.diamond_type,
      weight: sku.weight,
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

// Add the function to fetch manufacturers
export async function fetchManufacturers() {
  const startTime = performance.now()
  logger.info(`fetchManufacturers called`, { data: { useMocks } })

  if (useMocks) {
    // Mock data for manufacturers
    const mockManufacturers = [
      {
        id: "1",
        name: "Precision Crafters",
        current_load: 5,
        past_job_count: 120,
        rating: 4.8,
        active: true,
        created_at: "2023-01-15T08:30:00Z",
      },
      {
        id: "2",
        name: "Elite Jewel Works",
        current_load: 3,
        past_job_count: 85,
        rating: 4.5,
        active: true,
        created_at: "2023-02-20T10:15:00Z",
      },
      {
        id: "3",
        name: "Artisan Metals",
        current_load: 7,
        past_job_count: 210,
        rating: 4.9,
        active: true,
        created_at: "2022-11-05T14:45:00Z",
      },
      {
        id: "4",
        name: "Heritage Goldsmiths",
        current_load: 2,
        past_job_count: 65,
        rating: 4.3,
        active: true,
        created_at: "2023-03-10T09:20:00Z",
      },
      {
        id: "5",
        name: "Modern Jewelry Fabrication",
        current_load: 0,
        past_job_count: 45,
        rating: 4.0,
        active: false,
        created_at: "2023-04-25T11:30:00Z",
      },
    ]

    const duration = performance.now() - startTime
    logger.info(`fetchManufacturers completed with mock data`, {
      data: { count: mockManufacturers.length },
      duration,
    })
    return mockManufacturers
  }

  try {
    // Get all manufacturers
    logger.debug(`Fetching manufacturers from Supabase`)
    const { data, error } = await supabase.from("manufacturers").select("*").order("name", { ascending: true })

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching manufacturers from Supabase`, {
        error,
        duration,
      })
      return []
    }

    // Check if manufacturers are empty
    if (!data || data.length === 0) {
      logger.warn(`No manufacturers found in database`)
      return []
    }

    const duration = performance.now() - startTime
    logger.info(`fetchManufacturers completed successfully`, {
      data: { count: data.length },
      duration,
    })

    return data
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchManufacturers`, {
      error,
      duration,
    })
    return []
  }
}

// Add function to create a new manufacturer
export async function createManufacturer(manufacturerData: {
  name: string
  current_load?: number | null
  past_job_count?: number | null
  rating?: number | null
  active: boolean
}) {
  const startTime = performance.now()
  logger.info(`createManufacturer called`, { data: { manufacturerData, useMocks } })

  if (useMocks) {
    // Simulate creating a manufacturer in mock mode
    const mockManufacturer = {
      id: Math.random().toString(36).substring(2, 11),
      name: manufacturerData.name,
      current_load: manufacturerData.current_load || 0,
      past_job_count: manufacturerData.past_job_count || 0,
      rating: manufacturerData.rating || 0,
      active: manufacturerData.active,
      created_at: new Date().toISOString(),
    }

    const duration = performance.now() - startTime
    logger.info(`createManufacturer completed with mock data`, {
      data: { manufacturer: mockManufacturer },
      duration,
    })
    return { success: true, data: mockManufacturer }
  }

  try {
    // Create new manufacturer in Supabase
    logger.debug(`Creating new manufacturer in Supabase`, { data: manufacturerData })

    // Ensure all numeric fields are properly formatted
    const dataToInsert = {
      name: manufacturerData.name,
      current_load: manufacturerData.current_load !== undefined ? manufacturerData.current_load : null,
      past_job_count: manufacturerData.past_job_count !== undefined ? manufacturerData.past_job_count : null,
      rating: manufacturerData.rating !== undefined ? manufacturerData.rating : null,
      active: manufacturerData.active,
    }

    logger.debug(`Formatted data for insert`, { data: dataToInsert })

    const { data, error } = await supabase.from("manufacturers").insert([dataToInsert]).select()

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error creating manufacturer in Supabase`, {
        data: manufacturerData,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        duration,
      })
      return { success: false, error: error.message }
    }

    const duration = performance.now() - startTime
    logger.info(`createManufacturer completed successfully`, {
      data: { manufacturer: data[0] },
      duration,
    })
    return { success: true, data: data[0] }
  } catch (error: any) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createManufacturer`, {
      data: manufacturerData,
      error: error.message || error,
      stack: error.stack,
      duration,
    })
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

/**
 * Fetches statistics about the most ordered SKUs
 * @param limit Number of SKUs to return (default: 5)
 * @returns Array of SKUs with order counts
 */
export async function getSkuStatistics(limit = 5) {
  const startTime = performance.now()
  logger.info(`getSkuStatistics called`, { data: { limit, useMocks } })

  if (useMocks) {
    // Use mock data
    const mockStats = [
      { id: "NK12345YGNO", name: "Gold Necklace", count: 42 },
      { id: "RG45678WGNO", name: "Diamond Ring", count: 36 },
      { id: "ER78901YGRB", name: "Ruby Earrings", count: 28 },
      { id: "BG23456RGNO", name: "Gold Bangle", count: 24 },
      { id: "PN34567YGEM", name: "Emerald Pendant", count: 19 },
    ]

    const duration = performance.now() - startTime
    logger.info(`getSkuStatistics completed with mock data`, {
      data: { count: mockStats.length },
      duration,
    })

    return mockStats
  }

  try {
    // This query gets the count of each SKU in order_items
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        sku_id,
        quantity,
        skus:sku_id (sku_id, name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching SKU statistics from Supabase`, {
        error,
        duration,
      })
      return []
    }

    // Process the data to get counts by SKU
    const skuCounts = {}

    data.forEach((item) => {
      const skuId = item.skus?.sku_id
      const skuName = item.skus?.name

      if (skuId && skuName) {
        if (!skuCounts[skuId]) {
          skuCounts[skuId] = {
            id: skuId,
            name: skuName,
            count: 0,
          }
        }

        skuCounts[skuId].count += item.quantity || 1
      }
    })

    // Convert to array and sort by count (descending)
    const sortedStats = Object.values(skuCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    const duration = performance.now() - startTime
    logger.info(`getSkuStatistics completed successfully`, {
      data: { count: sortedStats.length },
      duration,
    })

    return sortedStats
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in getSkuStatistics`, {
      error,
      duration,
    })
    return []
  }
}

/**
 * Fetches stone lots from the database
 * @returns Array of stone lot objects
 */
export async function fetchStoneLots(): Promise<StoneLotData[]> {
  const startTime = performance.now()
  logger.info(`fetchStoneLots called`, { data: { useMocks } })

  // Log environment and configuration details
  logger.debug(`fetchStoneLots environment check`, {
    useMocks,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT_SET",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT_SET",
    supabaseClientExists: !!supabase,
  })

  if (useMocks) {
    // Mock data for stone lots
    const mockStoneLots: StoneLotData[] = [
      { id: "1", lot_number: "LOT-S001", stone_type: "Ruby", size: "2mm", quantity: 50, weight: 25.5, available: true },
      {
        id: "2",
        lot_number: "LOT-S002",
        stone_type: "Emerald",
        size: "3mm",
        quantity: 30,
        weight: 15.2,
        available: true,
      },
      {
        id: "3",
        lot_number: "LOT-S003",
        stone_type: "Sapphire",
        size: "2.5mm",
        quantity: 40,
        weight: 20.0,
        available: true,
      },
      { id: "4", lot_number: "LOT-S004", stone_type: "Jade", size: "4mm", quantity: 25, weight: 30.5, available: true },
    ]

    const duration = performance.now() - startTime
    logger.info(`fetchStoneLots completed with mock data`, {
      data: { count: mockStoneLots.length },
      duration,
    })
    return mockStoneLots
  }

  try {
    logger.debug(`Executing main stone lots query from Supabase with status='Available' filter`)
    const queryStartTime = performance.now()

    const { data, error, status, statusText } = await supabase
      .from("stone_lots")
      .select("*")
      .eq("status", "Available") // Filter by status = 'Available'
      .order("lot_number", { ascending: true })

    const queryDuration = performance.now() - queryStartTime

    logger.debug(`Main stone lots query completed`, {
      queryDuration,
      status,
      statusText,
      success: !error,
      recordCount: data?.length || 0,
      error: error
        ? {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          }
        : null,
    })

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error in main stone lots query`, {
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        queryDuration,
        totalDuration: duration,
      })

      // Try querying without status filter to see if there's any data at all
      logger.debug(`Attempting to fetch stone lots without status filter for debugging`)
      const { data: allData, error: allError } = await supabase
        .from("stone_lots")
        .select("*")
        .order("lot_number", { ascending: true })

      logger.debug(`All stone lots query (no filter) result:`, {
        success: !allError,
        recordCount: allData?.length || 0,
        sampleRecord: allData?.[0] || null,
        statusValues: allData?.map((record) => record.status) || [],
        error: allError ? { message: allError.message, code: allError.code } : null,
      })

      return []
    }

    if (!data || data.length === 0) {
      logger.warn(`Query succeeded but no stone lots found with status='Available'`)

      // Try querying without status filter to see what status values exist
      logger.debug(`Attempting to fetch stone lots without status filter for debugging`)
      const { data: allData, error: allError } = await supabase
        .from("stone_lots")
        .select("*")
        .order("lot_number", { ascending: true })

      logger.debug(`All stone lots query (no filter) result:`, {
        success: !allError,
        recordCount: allData?.length || 0,
        sampleRecord: allData?.[0] || null,
        statusValues: allData?.map((record) => record.status) || [],
        uniqueStatusValues: [...new Set(allData?.map((record) => record.status) || [])],
        error: allError ? { message: allError.message, code: allError.code } : null,
      })

      return []
    }

    const duration = performance.now() - startTime
    logger.info(`fetchStoneLots completed successfully from Supabase`, {
      data: {
        count: data.length,
        sample: data[0],
      },
      duration,
    })

    // Add detailed logging of the raw data structure
    logger.debug(`Raw stone lots data from Supabase:`, {
      totalRecords: data.length,
      sampleRecord: data[0],
      allColumns: data[0] ? Object.keys(data[0]) : [],
      lotNumbers: data.map((record) => record.lot_number),
      statusValues: data.map((record) => record.status),
      recordsWithLotNumbers: data.map((record) => ({
        id: record.id,
        lot_number: record.lot_number,
        lot_number_type: typeof record.lot_number,
        lot_number_length: record.lot_number ? record.lot_number.length : 0,
        lot_number_valid: !!(record.lot_number && record.lot_number.trim()),
        stone_type: record.stone_type,
        stone_size: record.stone_size,
        quantity: record.quantity,
        weight: record.weight,
        status: record.status,
      })),
    })

    // Validate that all records have lot_number
    const recordsWithoutLotNumber = data.filter((record) => !record.lot_number || record.lot_number.trim() === "")
    if (recordsWithoutLotNumber.length > 0) {
      logger.warn(`Found ${recordsWithoutLotNumber.length} stone lot records without lot_number:`, {
        recordsWithoutLotNumber: recordsWithoutLotNumber.map((record) => ({
          id: record.id,
          lot_number: record.lot_number,
          lot_number_raw: JSON.stringify(record.lot_number),
          status: record.status,
        })),
      })
    }

    const validLots = data.filter((record) => record.lot_number && record.lot_number.trim() !== "")
    logger.debug(`Stone lots validation results:`, {
      totalLots: data.length,
      validLots: validLots.length,
      invalidLots: recordsWithoutLotNumber.length,
      validLotNumbers: validLots.map((lot) => lot.lot_number),
    })

    const mappedData = validLots.map((lot) => ({
      id: lot.id,
      lot_number: lot.lot_number,
      stone_type: lot.stone_type,
      size: lot.stone_size, // Map stone_size to size
      quantity: lot.quantity,
      weight: lot.weight,
      available: lot.status === "Available", // Map status to available boolean
    }))

    logger.debug("Mapped stone lot data being returned:", {
      count: mappedData.length,
      sampleMappedRecord: mappedData[0],
      allMappedLotNumbers: mappedData.map((lot) => lot.lot_number),
    })

    return mappedData
  } catch (error: any) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchStoneLots`, {
      error: {
        message: error.message || error,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
      },
      duration,
    })
    return []
  }
}

/**
 * Fetches diamond lots from the database
 * @returns Array of diamond lot objects
 */
export async function fetchDiamondLots(): Promise<DiamondLotData[]> {
  const startTime = performance.now()
  logger.info(`fetchDiamondLots called`, { data: { useMocks } })

  if (useMocks) {
    // This block will only run if NEXT_PUBLIC_USE_MOCKS is "true"
    // For development, you might want to define mock diamond lots here
    const mockDiamondLots: DiamondLotData[] = [
      {
        id: "d1",
        lot_number: "DLOT-M001",
        size: "0.5mm",
        shape: "Round",
        quality: "VS1",
        a_type: "Lab Grown",
        stonegroup: "White",
        quantity: 100,
        weight: 10.0,
        price: 5000,
        status: "available",
      },
      {
        id: "d2",
        lot_number: "DLOT-M002",
        size: "1.0mm",
        shape: "Princess",
        quality: "SI1",
        a_type: "Natural",
        stonegroup: "Yellow",
        quantity: 50,
        weight: 12.5,
        price: 7000,
        status: "available",
      },
    ]
    const duration = performance.now() - startTime
    logger.info(`fetchDiamondLots completed with mock data`, {
      data: { count: mockDiamondLots.length },
      duration,
    })
    return mockDiamondLots
  }

  try {
    logger.debug(`Executing main diamond lots query from Supabase with status='Available' filter`)
    const queryStartTime = performance.now()

    const { data, error, status, statusText } = await supabase
      .from("diamond_lots")
      .select("*")
      .eq("status", "Available") // Filter by status = 'Available'
      .order("lot_number", { ascending: true })

    const queryDuration = performance.now() - queryStartTime

    logger.debug(`Main diamond lots query completed`, {
      queryDuration,
      status,
      statusText,
      success: !error,
      recordCount: data?.length || 0,
      error: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
    })

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error in main diamond lots query`, {
        error: { message: error.message, details: error.details, hint: error.hint, code: error.code },
        queryDuration,
        totalDuration: duration,
      })
      // Return an empty array or minimal fallback if Supabase query fails
      logger.warn(`Returning empty array for diamond lots due to query error`)
      return []
    }

    if (!data || data.length === 0) {
      logger.warn(`Query succeeded but no diamond lots found (status='Available')`)

      // Try querying without status filter to see if there's any data at all
      logger.debug(`Attempting to fetch diamond lots without status filter for debugging`)
      const { data: allData, error: allError } = await supabase
        .from("diamond_lots")
        .select("*")
        .order("lot_number", { ascending: true })

      logger.debug(`All diamond lots query (no filter) result:`, {
        success: !allError,
        recordCount: allData?.length || 0,
        sampleRecord: allData?.[0] || null,
        allRecords:
          allData?.map((record) => ({
            id: record.id,
            lot_number: record.lot_number,
            status: record.status,
          })) || [],
        error: allError ? { message: allError.message, code: allError.code } : null,
      })

      return [] // Return empty if no lots found
    }

    const duration = performance.now() - startTime
    logger.info(`fetchDiamondLots completed successfully from Supabase`, {
      data: { count: data.length, sample: data[0] },
      duration,
    })

    // Add detailed logging of the raw data structure
    logger.debug(`Raw diamond lots data from Supabase:`, {
      totalRecords: data.length,
      sampleRecord: data[0],
      allColumns: data[0] ? Object.keys(data[0]) : [],
      lotNumbers: data.map((record) => record.lot_number),
      recordsWithLotNumbers: data.map((record) => ({
        id: record.id,
        lot_number: record.lot_number,
        lot_number_type: typeof record.lot_number,
        lot_number_length: record.lot_number ? record.lot_number.length : 0,
        status: record.status,
        size: record.size,
        shape: record.shape,
        quality: record.quality,
      })),
    })

    // Validate that all records have lot_number
    const recordsWithoutLotNumber = data.filter((record) => !record.lot_number || record.lot_number.trim() === "")
    if (recordsWithoutLotNumber.length > 0) {
      logger.warn(`Found ${recordsWithoutLotNumber.length} diamond lot records without lot_number:`, {
        recordsWithoutLotNumber: recordsWithoutLotNumber.map((record) => ({
          id: record.id,
          lot_number: record.lot_number,
          lot_number_raw: JSON.stringify(record.lot_number),
        })),
      })
    }

    const validLots = data.filter((lot) => lot.lot_number && lot.lot_number.trim() !== "")
    logger.debug(`Returning typed diamond lots data:`, {
      count: validLots.length,
      sampleTypedRecord: validLots[0],
      allLotNumbers: validLots.map((lot) => lot.lot_number),
    })

    // Ensure data matches DiamondLotData type, though direct mapping is likely fine
    const typedData = validLots as DiamondLotData[]

    return typedData
  } catch (error: any) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchDiamondLots`, {
      error: { message: error.message || error, stack: error.stack, name: error.name, cause: error.cause },
      duration,
    })
    logger.warn(`Returning empty array for diamond lots due to unexpected error`)
    return [] // Return empty array on unexpected error
  }
}
