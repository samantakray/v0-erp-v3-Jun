"use client"

import { useState, useRef } from "react"
import { useJob } from "../layout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StickerPreview } from "@/components/sticker-preview"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { JOB_PHASE } from "@/constants/job-workflow"

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
  const firstInputRef = useRef<HTMLInputElement>(null)

  const add = () => setAllocs([...allocs, { lot: "", qty: 0, wt: "" }])
  const del = (i: number) => setAllocs(allocs.filter((_, idx) => idx !== i))
  const edit = (i: number, k: string, v: string | number) =>
    setAllocs(allocs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  const isValid = allocs.every((a) => a.lot && a.qty > 0 && +a.wt > 0)

  async function submit(e) {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/jobs/${job.id}/transition`, {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     step: "stone-selection",
      //     data: { allocations: allocs },
      //   }),
      // });

      // For now, we'll just set the sticker data
      setStickerData(
        Object.fromEntries(allocs.map((a, i) => [`Lot ${i + 1}`, `${a.lot} (${a.qty} stones, ${a.wt} ct)`])),
      )
      setPreview(true)
    } catch (error) {
      console.error("Error submitting allocation:", error)
    } finally {
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
    // In a real app, this would navigate to the next phase
    router.push(`/orders/${params.orderId}/jobs/${params.jobId}/${JOB_PHASE.DIAMOND}`)
  }

  return (
    <div className="space-y-6">
      <JobHeader orderId={params.orderId} />
      <PhaseNavigation orderId={params.orderId} jobId={params.jobId} />

      <Card>
        <CardHeader>
          <CardTitle>Stone Selection</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button type="submit" disabled={!isValid || isSubmitting}>
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
