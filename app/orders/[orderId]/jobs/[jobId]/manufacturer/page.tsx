"use client"

import { useState } from "react"
import { useJob } from "../layout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StickerPreview } from "@/components/sticker-preview"
import JobHeader from "../components/job-header"
import PhaseNavigation from "../components/phase-navigation"
import { JOB_PHASE } from "@/constants/job-workflow"

// Mock manufacturers data
const MANUFACTURERS = [
  {
    id: "m1",
    name: "Elegant Creations Ltd.",
    currentLoad: 12,
    pastJobCount: 156,
    rating: 4.8,
  },
  {
    id: "m2",
    name: "Precision Jewelry Co.",
    currentLoad: 8,
    pastJobCount: 98,
    rating: 4.5,
  },
  {
    id: "m3",
    name: "Golden Touch Manufacturers",
    currentLoad: 15,
    pastJobCount: 203,
    rating: 4.7,
  },
  {
    id: "m4",
    name: "Diamond Craft Industries",
    currentLoad: 5,
    pastJobCount: 87,
    rating: 4.9,
  },
]

export default function ManufacturerPage({ params }: { params: { jobId: string; orderId: string } }) {
  const job = useJob()
  const router = useRouter()
  const [manufacturerData, setManufacturerData] = useState({
    manufacturerId: "",
    expectedCompletion: "",
  })
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAssignManufacturer = async (e) => {
    e.preventDefault()
    if (!manufacturerData.manufacturerId || !manufacturerData.expectedCompletion || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const selectedManufacturer = MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)

      // In a real app, this would be an API call
      // await fetch(`/api/jobs/${job.id}/transition`, {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     step: "manufacturer",
      //     data: manufacturerData,
      //   }),
      // });

      // For now, we'll just set the sticker data
      setStickerData({
        Manufacturer: selectedManufacturer?.name || "Unknown",
        "Expected Completion": new Date(manufacturerData.expectedCompletion).toLocaleDateString(),
      })
      setPreview(true)
    } catch (error) {
      console.error("Error assigning manufacturer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStickerClose = () => {
    setPreview(false)
    // In a real app, this would navigate to the next phase
    router.push(`/orders/${params.orderId}/jobs/${params.jobId}/${JOB_PHASE.QC}`)
  }

  return (
    <div className="space-y-6">
      <JobHeader orderId={params.orderId} />
      <PhaseNavigation orderId={params.orderId} jobId={params.jobId} />

      <Card>
        <CardHeader>
          <CardTitle>Manufacturer Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignManufacturer} className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Current Load</TableHead>
                      <TableHead>Past Jobs</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Select</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MANUFACTURERS.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>{m.currentLoad} jobs</TableCell>
                        <TableCell>{m.pastJobCount} jobs</TableCell>
                        <TableCell>{m.rating}/5</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManufacturerData({ ...manufacturerData, manufacturerId: m.id })}
                            className={
                              manufacturerData.manufacturerId === m.id ? "bg-primary text-primary-foreground" : ""
                            }
                          >
                            {manufacturerData.manufacturerId === m.id ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCompletion">Expected Completion Date</Label>
                <Input
                  id="expectedCompletion"
                  type="date"
                  value={manufacturerData.expectedCompletion}
                  onChange={(e) => setManufacturerData({ ...manufacturerData, expectedCompletion: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Assign Manufacturer"}
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
        phase="manufacturer"
        data={stickerData}
      />
    </div>
  )
}
