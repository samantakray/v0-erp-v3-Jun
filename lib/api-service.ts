import { skus as mockSkus } from "@/mocks/skus"
import { orders as mockOrders } from "@/mocks/orders"
import { jobs as mockJobs } from "@/mocks/jobs"
import type { Order, SKU, Job } from "@/types"

// Mock data and Supabase imports (replace with your actual imports/declarations)
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

// Mock Supabase client (replace with your actual Supabase client)
const supabase = {
  from: (tableName: string) => {
    return {
      select: (columns: string) => {
        return {
          eq: (columnName: string, value: any) => {
            return {
              single: async () => {
                if (useMocks) {
                  if (tableName === "orders") {
                    const order = mockOrders.find((o) => o.id === value)
                    if (!order) {
                      return { data: null, error: new Error(`Order ${value} not found`) }
                    }
                    return { data: order, error: null }
                  }
                  if (tableName === "jobs") {
                    const job = mockJobs.find((j) => j.id === value)
                    if (!job) {
                      return { data: null, error: new Error(`Job ${value} not found`) }
                    }
                    return { data: job, error: null }
                  }
                }
                return { data: null, error: new Error("Supabase not implemented in mock mode") }
              },
              order: () => {
                return {
                  single: async () => {
                    return { data: null, error: new Error("Supabase not implemented in mock mode") }
                  },
                }
              },
            }
          },
          order: () => {
            return {
              eq: (columnName: string, value: any) => {
                return {
                  single: async () => {
                    return { data: null, error: new Error("Supabase not implemented in mock mode") }
                  },
                }
              },
            }
          },
        }
      },
      update: (updateData: any) => {
        return {
          eq: (columnName: string, value: any) => {
            return {
              select: () => {
                return {
                  single: async () => {
                    return { data: null, error: new Error("Supabase not implemented in mock mode") }
                  },
                }
              },
            }
          },
        }
      },
    }
  },
}

export async function fetchOrder(orderId: string): Promise<{ order: Order | null }> {
  if (useMocks) {
    const order = mockOrders.find((o) => o.id === orderId)
    return { order: order || null }
  }

  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (error) {
    console.error("Supabase error fetching order:", error)
    throw error
  }

  return { order: data }
}

export async function fetchJobs(orderId: string): Promise<Job[]> {
  if (useMocks) {
    return mockJobs.filter((job) => job.orderId === orderId)
  }

  return []
}

export async function fetchJob(jobId: string): Promise<Job | null> {
  if (useMocks) {
    const job = mockJobs.find((j) => j.id === jobId)
    return job || null
  }
  return null
}

export async function fetchOrders(): Promise<Order[]> {
  if (useMocks) {
    return mockOrders
  }
  return []
}

export async function fetchSkus(): Promise<SKU[]> {
  if (useMocks) {
    return mockSkus
  }
  return []
}
