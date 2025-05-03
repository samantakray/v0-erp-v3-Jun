"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import LotRow from "./LotRow"
import { StickerPreview } from "./sticker-preview"
import "./../styles/stone-selection.css"

interface Allocation {
  lot: string
  qty: number
  wt: string
}

interface StoneSelectionViewProps {
  job: any
  onClose: () => void
}

export default function StoneSelectionView({ job, onClose }: StoneSelectionViewProps) {
  const [allocs, setAllocs] = useState<Allocation[]>([{ lot: "", qty: 0, wt: "" }])
  const [preview, setPreview] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus first input when component mounts
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [])

  const add = () => setAllocs([...allocs, { lot: "", qty: 0, wt: "" }])
  const del = (i: number) => setAllocs(allocs.filter((_, idx) => idx !== i))
  const edit = (i: number, k: string, v: string | number) =>
    setAllocs(allocs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))

  const isValid = allocs.every((a) => a.lot && a.qty > 0 && +a.wt > 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    try {
      // Call API to update job
      await fetch(`/api/jobs/${job.id}/transition`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: "stone-selection",
          data: { allocations: allocs },
        }),
      })

      // Show sticker preview
      setPreview(true)
    } catch (error) {
      console.error("Error submitting allocation:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // If Enter is pressed on the last row's weight field and form is valid, submit
    if (e.key === "Enter" && index === allocs.length - 1 && isValid) {
      submit(e)
    }
  }

  return (
    <>
      {/* header */}
      <header className="ss-header">
        <img src={job.image || "/placeholder.svg"} alt={job.skuId} />
        <div className="meta">
          <h3>{job.skuId}</h3>
          <p>Stone type(s): {job.stoneType || "N/A"}</p>
          <p>Job #{job.id}</p>
        </div>
      </header>

      {/* allocation form */}
      <form onSubmit={submit}>
        <section className="alloc-table">
          <div className="alloc-head">
            <span>Lot #</span>
            <span># Stones</span>
            <span>Total Wt (ct)</span>
            <span />
          </div>
          {allocs.map((row, i) => (
            <div key={i} className="lot-row-container">
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
        </section>
        <button type="button" className="link-btn" onClick={add}>
          + Add Lot
        </button>

        <button type="submit" className="primary" disabled={!isValid}>
          Submit Allocation
        </button>
      </form>

      {/* sticker */}
      <StickerPreview
        open={preview}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(false)
            onClose()
          }
        }}
        jobId={job.id}
        phase="stone"
        data={Object.fromEntries(allocs.map((a, i) => [`Lot ${i + 1}`, `${a.lot} (${a.qty} stones, ${a.wt} ct)`]))}
      />
    </>
  )
}
