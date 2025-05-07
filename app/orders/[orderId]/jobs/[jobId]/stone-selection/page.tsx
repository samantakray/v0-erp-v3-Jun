"use client"

import { useState, useRef, useEffect } from "react"
import { useJob } from "../layout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StickerPreview } from "@/components/sticker-preview"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { JOB_PHASE } from "@/constants/job-workflow"
import { updateJobPhase } from "@/app/actions/job-actions"
import { logger } from "@/lib/logger"
import { supabase } from "@/lib/supabaseClient"

// LotRow Component
interface LotRowProps {
  value: {
    lot: string
    qty: number
    wt: string
  }
  onChange: (key: string, value: string | number) => void
  onDelete: () => void
}

function LotRow({ value, onChange, onDelete }: LotRowProps) {
  return (
    <div className="grid grid-cols-4 gap-4 items-center">
      <input
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={value.lot}
        onChange={(e) => onChange("lot", e.target.value)}
        placeholder="LOT-001"
        required
      />
      <input
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        type="number"
        value={value.qty || ""}
        onChange={(e) => onChange("qty", +e.target.value)}
        min={1}
        required
      />
      <input
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={value.wt}
        onChange={(e) => onChange("wt", e.target.value)}
        placeholder="0.00"
        required
      />
      <Button type="button" variant="outline" size="icon" onClick={onDelete} className="h-10 w-10">
        —
      </Button>
    </div>
  )
}

export default function StoneSelectionPage({ params }: { params: { jobId: string; orderId: string } }) {
  const job = useJob()
  const router = useRouter()
  const [allocs, setAllocs] = useState<Array<{ lot: string; qty: number; wt: string }>>([{ lot: "", qty: 0, wt: "" }])
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const [jobData, setJobData] = useState(null)

  const isValid = allocs.every((a) => a.lot && a.qty > 0 && +a.wt > 0)

  // Add direct Supabase check on component mount
  useEffect(() => {
    async function checkJobDirectly() {
      console.log("Directly checking job in Supabase:", params.jobId)

      try {
        // First, try to get the job directly using job_id
        const { data: directJobData, error: directError } = await supabase
          .from("jobs")
          .select("*")
          .eq("job_id", params.jobId)
          .single()

        console.log("Direct job query result:", {
          found: !!directJobData,
          error: directError ? directError.message : null,
          data: directJobData,
        })

        setJobData(directJobData)

        // If that fails, try to get all jobs to see what's available
        if (!directJobData || directError) {
          const { data: allJobs, error: allJobsError } = await supabase.from("jobs").select("job_id").limit(20)

          console.log("All jobs query result:", {
            count: allJobs?.length || 0,
            error: allJobsError ? allJobsError.message : null,
            jobIds: allJobs?.map((j) => j.job_id),
          })
        }
      } catch (e) {
        console.error("Error in direct Supabase check:", e)
      }
    }

    checkJobDirectly()
  }, [params.jobId])

  // 2. Check Form Validation
  console.log("Form data:", allocs)
  console.log("Is form valid:", isValid)
  console.log(
    "Validation check:",
    allocs.map((a) => ({
      lot: a.lot,
      qty: a.qty,
      wt: a.wt,
      isValid: a.lot && a.qty > 0 && +a.wt > 0,
    })),
  )

  const add = () => setAllocs([...allocs, { lot: "", qty: 0, wt: "" }])
  const del = (i: number) => setAllocs(allocs.filter((_, idx) => idx !== i))
  const edit = (i: number, k: string, v: string | number) =>
    setAllocs(allocs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  async function submit(e) {
    // 1. Add Earlier Logging
    console.log("Submit function called", { isValid, isSubmitting, jobId: params.jobId })
    e.preventDefault()
    if (!isValid || isSubmitting) {
      console.log("Submit function early return", { isValid, isSubmitting })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Format allocation data
      const allocationsData = allocs.map((a) => ({
        lotNumber: a.lot,
        quantity: a.qty,
        weight: Number.parseFloat(a.wt),
      }))

      // Direct Supabase check before calling server action
      console.log("Checking job directly before update:", params.jobId)
      const { data: preCheckData, error: preCheckError } = await supabase
        .from("jobs")
        .select("id")
        .eq("job_id", params.jobId)
        .single()

      console.log("Pre-update job check:", {
        found: !!preCheckData,
        error: preCheckError ? preCheckError.message : null,
        data: preCheckData,
      })

      if (preCheckData && preCheckData.id) {
        console.log("Found job UUID:", preCheckData.id)

        // Try direct update with Supabase client
        const updateData = {
          status: "Stone Selected",
          current_phase: "diamond",
          stone_data: {
            allocations: allocationsData,
            timestamp: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        }

        console.log("Attempting direct update with data:", updateData)

        const { data: directUpdateData, error: directUpdateError } = await supabase
          .from("jobs")
          .update(updateData)
          .eq("id", preCheckData.id)
          .select()

        console.log("Direct update result:", {
          success: !!directUpdateData,
          error: directUpdateError ? directUpdateError.message : null,
          data: directUpdateData,
        })
      }

      // 1) Pre-call log
      logger.debug("Calling updateJobPhase", {
        jobId: params.jobId,
        phase: JOB_PHASE.STONE,
        allocationsData,
      })

      // Update job phase using server action
      const result = await updateJobPhase(params.jobId, JOB_PHASE.STONE, {
        allocations: allocationsData,
        timestamp: new Date().toISOString(),
      })

      // 2) Post-call log
      logger.info("updateJobPhase response", { result })

      if (!result.success) {
        throw new Error(result.error || "Failed to update job phase")
      }

      // Set sticker data for preview
      setStickerData(
        Object.fromEntries(allocs.map((a, i) => [`Lot ${i + 1}`, `${a.lot} (${a.qty} stones, ${a.wt} ct)`])),
      )
      setPreview(true)
    } catch (error) {
      console.error("Full error object:", error)
      logger.error("Error submitting stone allocation:", {
        data: { jobId: params.jobId, allocationsData: allocs.map((a) => ({ lot: a.lot, qty: a.qty, wt: a.wt })) },
        error,
      })
      setError("Failed to submit allocation. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e, index) => {
    // If Enter is pressed on the last row's weight field and form is valid, submit
    if (e.key === "Enter" && index === allocs.length - 1 && isValid) {
      submit(e)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    // Navigate to the next phase
    router.push(`/orders/${params.orderId}/jobs/${params.jobId}/${JOB_PHASE.DIAMOND}`)
  }

  return (
    <div className="space-y-6">
      <JobHeader orderId={params.orderId} />
      <PhaseNavigation orderId={params.orderId} jobId={params.jobId} />

      {/* Add job data display */}
      <Card className="bg-yellow-50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Debug Information</h3>
          <div className="text-sm">
            <p>Job ID: {params.jobId}</p>
            <p>Job Data Found: {jobData ? "Yes" : "No"}</p>
            {jobData && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(jobData, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stone Selection</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-md font-semibold mb-4">Allocate Stones</h3>
              <div className="grid grid-cols-4 gap-4 mb-2 font-medium text-sm">
                <div>Lot #</div>
                <div># Stones</div>
                <div>Total Wt (ct)</div>
                <div></div>
              </div>
              {allocs.map((row, i) => (
                <div key={i} className="mb-2">
                  <LotRow value={row} onChange={(k, v) => edit(i, k, v)} onDelete={() => allocs.length > 1 && del(i)} />
                  {i === allocs.length - 1 && (
                    <input
                      type="text"
                      className="hidden-submit-trigger"
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      tabIndex={-1}
                      style={{ position: "absolute", opacity: 0 }}
                    />
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={add} className="mt-2">
                + Add Lot
              </Button>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!isValid || isSubmitting} onClick={() => console.log("Button clicked")}>
                {isSubmitting ? "Submitting..." : "Submit Allocation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <StickerPreview
        open={preview}
        onOpenChange={(open) => {
          if (!open) {
            handleStickerClose()
          }
        }}
        jobId={job.id}
        phase="stone"
        data={stickerData}
      />
    </div>
  )
}
