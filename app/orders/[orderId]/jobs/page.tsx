"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { fetchJobs } from "@/lib/api-service"
import type { Job } from "@/types"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"
import { DataTable, type Column } from "@/app/components/DataTable"

export default function JobsPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(jobs.length / itemsPerPage))

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedJobs = jobs.slice(startIndex, startIndex + itemsPerPage)

  const handleRefresh = () => {
    setLoading(true)
    // Fetch jobs again
    fetchJobs(params.orderId)
      .then((data) => {
        setJobs(data)
      })
      .catch((err) => {
        console.error("Failed to refresh jobs:", err)
        setError("Failed to refresh jobs. Please try again.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Define columns for DataTable
  const columns: Column<Job>[] = [
    {
      header: "Job ID",
      accessor: "id",
      render: (job) => <span className="font-medium">{job.id}</span>,
    },
    {
      header: "SKU",
      accessor: "skuId",
    },
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Status",
      accessor: "status",
      render: (job) => <Badge>{job.status}</Badge>,
    },
    {
      header: "Production Date",
      accessor: "productionDate",
      render: (job) => new Date(job.productionDate).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (job) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
            onClick={() => {
              router.push(`/orders/${params.orderId}/jobs/${job.id}/${getJobRoute(job)}`)
            }}
          >
            <Eye className="h-4 w-4" />
            <span className="text-[10px]">View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
            onClick={() => {
              // Edit job
              console.log("Edit job:", job.id)
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="text-[10px]">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1 text-red-500 hover:text-red-600"
            onClick={() => {
              // Delete job
              console.log("Delete job:", job.id)
              alert(`Delete job ${job.id}?`)
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px]">Delete</span>
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ]

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
          <DataTable
            columns={columns}
            data={paginatedJobs}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
