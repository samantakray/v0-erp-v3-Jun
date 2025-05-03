"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus } from "lucide-react"
import { fetchJobs } from "@/lib/api-service"
import type { Job } from "@/types"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"

export default function JobsPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true)
        const data = await fetchJobs(params.orderId)
        setJobs(data)
      } catch (err) {
        console.error("Failed to fetch jobs:", err)
        setError("Failed to load jobs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [params.orderId])

  // Function to determine which route to navigate to based on job status
  const getJobRoute = (job: Job) => {
    switch (job.status) {
      case JOB_STATUS.NEW:
        return JOB_PHASE.STONE
      case JOB_STATUS.BAG_CREATED:
        return JOB_PHASE.STONE
      case JOB_STATUS.STONE_SELECTED:
        return JOB_PHASE.DIAMOND
      case JOB_STATUS.DIAMOND_SELECTED:
        return JOB_PHASE.MANUFACTURER
      case JOB_STATUS.SENT_TO_MANUFACTURER:
      case JOB_STATUS.IN_PRODUCTION:
        return JOB_PHASE.QC
      case JOB_STATUS.QC_PASSED:
      case JOB_STATUS.QC_FAILED:
      case JOB_STATUS.COMPLETED:
        return JOB_PHASE.COMPLETE
      default:
        return JOB_PHASE.STONE
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/orders/${params.orderId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Order</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Jobs for Order {params.orderId}</h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">Loading jobs...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center">No jobs found for this order.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.skuId}</TableCell>
                    <TableCell>{job.name}</TableCell>
                    <TableCell>
                      <Badge>{job.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(job.productionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link
                        href={`/orders/${params.orderId}/jobs/${job.id}/${getJobRoute(job)}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
