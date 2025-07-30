"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Filter, Calendar, Edit, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/logger"
import type { Job } from "@/types"
import { JOB_STATUS, JOB_STATUS_STYLES, getJobStatusStyle } from "@/constants/job-workflow"
import { fetchAllJobs } from "@/lib/api-service"
import Link from "next/link"

// Extend Job type to include daysToDue for local calculations
type JobWithDays = Job & { daysToDue?: number }

export default function JobListPage() {
  const [jobs, setJobs] = useState<JobWithDays[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobWithDays[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const itemsPerPage = 10

  // Fetch jobs
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true)
        setError(null)
        // Log: Starting to fetch jobs data for better debugging
        console.log("Starting to fetch jobs data...")
        const data = await fetchAllJobs()

        // Calculate days to due for each job
        const today = new Date()
        const updatedJobs: JobWithDays[] = data.map((job) => {
          const dueDate = new Date(job.dueDate || "")
          const timeDiff = dueDate.getTime() - today.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
          return {
            ...job,
            daysToDue: daysDiff,
          }
        })

        // Sort jobs by creation date (newest first)
        updatedJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setJobs(updatedJobs)
        setFilteredJobs(updatedJobs)
        // Log: Successfully loaded jobs data
        console.log(`Successfully loaded ${updatedJobs.length} jobs`)
      } catch (err) {
        console.error("Failed to fetch jobs:", err)
        setError("Failed to load jobs. Please try again.")
        logger.error("Failed to fetch jobs", { error: err })
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  // Filter jobs based on active tab, search term, and status filter
  useEffect(() => {
    let filtered = jobs

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((job) => {
        switch (activeTab) {
          case "pending":
            return job.status !== JOB_STATUS.COMPLETED
          case "completed":
            return job.status === JOB_STATUS.COMPLETED
          case "overdue":
            return (job.daysToDue ?? 0) < 0 && job.status !== JOB_STATUS.COMPLETED
          default:
            return true
        }
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          (job.job_id || job.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.skus?.sku_id || job.sku_id || job.skuId).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.skus?.name || job.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.orders?.order_id || job.orderId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }

    setFilteredJobs(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [jobs, activeTab, searchTerm, statusFilter])

  const handleRefresh = () => {
    // Log: User triggered manual refresh
    console.log("User triggered manual refresh of jobs data")
    window.location.reload()
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredJobs.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)

  const columns: Column<JobWithDays>[] = [
    {
      accessor: "job_id",
      header: "Job #",
      render: (job) => (
        <div className="font-medium text-blue-600 hover:text-blue-800">
          <Link href={`/orders/${job.orders?.order_id || job.orderId}/jobs/${job.job_id || job.id}`}>
            {job.job_id || job.id}
          </Link>
        </div>
      ),
    },
    {
      accessor: "sku_id",
      header: "SKU #",
      render: (job) => (
        <div className="font-medium">
          {job.skus?.sku_id || job.sku_id || job.skuId}
        </div>
      ),
    },
    {
      accessor: "production_date",
      header: "Production Date",
      render: (job) => (
        <div>
          {job.production_date ? new Date(job.production_date).toLocaleDateString() : job.productionDate ? new Date(job.productionDate).toLocaleDateString() : "Not set"}
        </div>
      ),
    },
    {
      accessor: "dueDate",
      header: "Delivery Date",
      render: (job) => (
        <div className="flex flex-col gap-1">
          <div>{job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "Not set"}</div>
          {job.daysToDue !== undefined && job.dueDate && (
            <Badge 
              variant={
                job.daysToDue < 0 
                  ? "destructive" 
                  : job.daysToDue <= 3 
                    ? "secondary" 
                    : "outline"
              }
              className="text-xs w-fit"
            >
              {job.daysToDue < 0 ? `${Math.abs(job.daysToDue)} days overdue` : `${job.daysToDue} days left`}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessor: "status",
      header: "Job Status",
      render: (job) => (
        <Badge 
          className={getJobStatusStyle(job.status).className}
        >
          {job.status}
        </Badge>
      ),
    },
    {
      accessor: "id", // Using id as accessor for actions column
      header: "Actions",
      render: (job) => (
        <div className="flex gap-2">
          <Link href={`/orders/${job.orders?.order_id || job.orderId}/jobs/${job.job_id || job.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl font-semibold">Jobs</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold mb-2">Job List</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[300px] pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(JOB_STATUS).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          {/* Default filters as tabs */}
          <div className="border-b px-4 py-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-[800px] grid-cols-4">
                <TabsTrigger value="all">
                  All Jobs ({jobs.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending Jobs ({jobs.filter((j) => j.status !== JOB_STATUS.COMPLETED).length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed Jobs ({jobs.filter((j) => j.status === JOB_STATUS.COMPLETED).length})
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  <span>Overdue Jobs</span>
                  <span className={`ml-1 ${jobs.filter((j) => j.daysToDue !== undefined && j.daysToDue < 0 && j.status !== JOB_STATUS.COMPLETED).length > 0 ? 'text-red-500 font-bold' : ''}`}>
                    ({jobs.filter((j) => j.daysToDue !== undefined && j.daysToDue < 0 && j.status !== JOB_STATUS.COMPLETED).length})
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results summary */}
          <div className="px-4 py-2 text-sm text-muted-foreground border-b">
            Showing {getCurrentPageData().length} of {filteredJobs.length} jobs
          </div>

          <DataTable
            data={getCurrentPageData()}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
          />
        </div>
      </main>
    </div>
  )
} 