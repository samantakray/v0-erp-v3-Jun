import { redirect, notFound } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { JOB_STATUS, JOB_PHASE, type JobPhase } from "@/constants/job-workflow"

export default async function JobIndexPage({ params }: { params: Promise<{ jobId: string; orderId: string }> }) {
  // PHASE 1 FIX: Await params to fix Next.js 15 async params compatibility
  const { orderId, jobId } = await params
  
  // Console logging for job router debugging - Root Cause #3
  console.log("🔍 Job Router - Component called with params:", { orderId, jobId })
  console.log("🔍 Job Router - jobId:", jobId, "orderId:", orderId)
  
  // PHASE 2 FIX: Updated database query with correct fields and validation
  console.log("🔍 Job Router - PHASE 2: Starting database query with CORRECTED fields")
  console.log("🔍 Job Router - PHASE 2: Using job_id field instead of id field")
  console.log("🔍 Job Router - PHASE 2: Query: jobs table, job_id =", jobId)
  
  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      current_phase,
      order_id,
      orders!inner(order_id)
    `)
    .eq("job_id", jobId)        // ✅ PHASE 2 FIX: job_id matches display ID
    .single()

  // Console logging for database query results - PHASE 2 validation
  console.log("🔍 Job Router - PHASE 2: Database query completed")
  console.log("🔍 Job Router - PHASE 2: Job data:", job)
  console.log("🔍 Job Router - PHASE 2: Query error:", error)
  console.log("🔍 Job Router - PHASE 2: Job found:", !!job)
  console.log("🔍 Job Router - PHASE 2: Error occurred:", !!error)

  if (error || !job) {
    console.log("🔍 Job Router - PHASE 2: ERROR: Job not found or database error")
    return notFound()
  }

  // PHASE 2 FIX: Add order validation logic
  console.log("🔍 Job Router - PHASE 2: Validating job belongs to correct order")
  console.log("🔍 Job Router - PHASE 2: URL orderId:", orderId)
  console.log("🔍 Job Router - PHASE 2: Job's actual orderId:", job.orders.order_id)
  
  if (job.orders.order_id !== orderId) {
    console.log("🔍 Job Router - PHASE 2: ERROR: Job doesn't belong to order:", {
      jobId,
      orderId,
      actualOrderId: job.orders.order_id
    })
    return notFound()
  }
  console.log("🔍 Job Router - PHASE 2: Order validation PASSED")

  // PHASE 2 FIX: Use current_phase field instead of status-based logic
  console.log("🔍 Job Router - PHASE 2: Using current_phase field from database")
  console.log("🔍 Job Router - PHASE 2: Job current_phase:", job.current_phase)

  // Map database current_phase to route paths
  const phaseRouteMap = {
    'stone': 'stone-selection',
    'diamond': 'diamond-selection', 
    'manufacturer': 'manufacturer',
    'qc': 'quality-check',
    'complete': 'complete'
  }

  const redirectPath = phaseRouteMap[job.current_phase] || 'stone-selection'
  console.log("🔍 Job Router - PHASE 2: Phase mapping result:", {
    jobId,
    currentPhase: job.current_phase,
    redirectPath,
    mappingUsed: phaseRouteMap[job.current_phase] ? 'found' : 'default'
  })

  // Final redirect path construction
  const finalRedirectPath = `/orders/${orderId}/jobs/${jobId}/${redirectPath}`
  console.log("🔍 Job Router - PHASE 2: Final redirect path constructed:", finalRedirectPath)
  console.log("🔍 Job Router - PHASE 2: About to call redirect() - URL should update")

  // Redirect to the appropriate phase page
  redirect(finalRedirectPath)
}
