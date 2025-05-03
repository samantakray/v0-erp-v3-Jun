import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"

export default async function JobIndexPage({ params }: { params: { jobId: string; orderId: string } }) {
  // Get the job to determine which phase to redirect to
  const { data: job, error } = await supabase.from("jobs").select("status").eq("id", params.jobId).single()

  if (error || !job) {
    throw new Error("Job not found")
  }

  // Determine which page to redirect to based on job status
  let redirectPath = JOB_PHASE.STONE

  switch (job.status) {
    case JOB_STATUS.STONE_SELECTED:
      redirectPath = JOB_PHASE.DIAMOND
      break
    case JOB_STATUS.DIAMOND_SELECTED:
      redirectPath = JOB_PHASE.MANUFACTURER
      break
    case JOB_STATUS.SENT_TO_MANUFACTURER:
    case JOB_STATUS.IN_PRODUCTION:
      redirectPath = JOB_PHASE.QC
      break
    case JOB_STATUS.QC_PASSED:
    case JOB_STATUS.QC_FAILED:
    case JOB_STATUS.COMPLETED:
      redirectPath = JOB_PHASE.COMPLETE
      break
    default:
      redirectPath = JOB_PHASE.STONE
  }

  // Redirect to the appropriate phase page
  redirect(`/orders/${params.orderId}/jobs/${params.jobId}/${redirectPath}`)
}
