// NO "use client" directive - Server Component
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { JobContextProvider } from "@/components/job-context-provider"
import type { Job } from "@/types"
import { type ReactNode } from "react"

export default async function JobLayout({
  params,
  children,
}: {
  params: Promise<{ jobId: string; orderId: string }>
  children: ReactNode
}) {
  // Fix: Await params for Next.js 15 compatibility
  const { orderId, jobId } = await params
  
  console.log("🔍 JobLayout - Server Component executing")
  console.log("🔍 JobLayout - jobId:", jobId, "orderId:", orderId)
  
  // VALIDATED: Database query confirmed working with test data
  // Updated query to include SKU information for proper display
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      orders!inner(
        id,
        order_id,
        customer_name,
        status,
        order_type
      ),
      skus!inner(
        id,
        sku_id,
        name,
        image_url
      )
    `)
    .eq("job_id", jobId)                    // Confirmed: J-0001-1 format
    .eq("orders.order_id", orderId)         // Confirmed: O-0001 format
    .single()

  console.log("🔍 JobLayout - Database query result:", { job: !!job, error: !!error })

  if (error || !job) {
    console.error("🔍 JobLayout - Job not found:", error?.message)
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <JobContextProvider job={job as Job}>
          {children}
        </JobContextProvider>
      </div>
    </div>
  )
}
