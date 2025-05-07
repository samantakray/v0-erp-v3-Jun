"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Edit, Eye, Package, X, Factory, Trash2, User, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { JobDetailSheet } from "./job-detail-sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhaseSummaryTracker } from "@/components/phase-summary-tracker"
import { NextTaskModule } from "@/components/next-task-module"
import { cn } from "@/lib/utils"
import { DataTable } from "@/app/components/DataTable"
import { fetchOrder, fetchJobs, fetchJob } from "@/lib/api-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { JOB_STATUS, ORDER_STATUS } from "@/constants/job-workflow"

export function OrderDetailSheet({ orderId, open, onOpenChange, onEdit }) {
  const [order, setOrder] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState("")
  const [currentAction, setCurrentAction] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false)
  const [jobFilter, setJobFilter] = useState("all")
  const [jobSearch, setJobSearch] = useState("")
  const [phaseFilter, setPhaseFilter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [workflowCurrentPage, setWorkflowCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState("bag")
  const [error, setError] = useState(null)

  // Fetch order and jobs data
  useEffect(() => {
    async function loadData() {
      if (!orderId || !open) return

      try {
        setLoading(true)
        setError(null)

        // Fetch order data
        const { order: orderData } = await fetchOrder(orderId)
        setOrder(orderData)

        // Fetch jobs for this order
        const jobsData = await fetchJobs(orderId)
        setJobs(jobsData)

        // Determine order status based on job statuses
        const status = determineOrderStatus(jobsData)
        setCurrentStatus(status)

        // Update action based on status
        if (status === ORDER_STATUS.COMPLETED) {
          setCurrentAction("Order completed")
        } else if (status === ORDER_STATUS.PENDING) {
          setCurrentAction("Process remaining jobs")
        } else {
          setCurrentAction("Stone selection")
        }
      } catch (err) {
        console.error("Error loading order data:", err)
        setError("Failed to load order data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [orderId, open])

  const handleStatusChange = (status) => {
    setCurrentStatus(status)
    // In a real app, you would update the backend here
  }

  const handleEditOrder = () => {
    if (onEdit) {
      onEdit(orderId)
    }
  }

  const openImageDialog = (image) => {
    setSelectedImage(image)
    setImageDialogOpen(true)
  }

  const handleJobClick = async (jobId) => {
    try {
      const job = await fetchJob(jobId)
      setSelectedJob(job)
      setIsJobDetailOpen(true)
    } catch (err) {
      console.error("Error fetching job details:", err)
    }
  }

  const handleDeleteJob = (job) => {
    setJobToDelete(job)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteJob = () => {
    // In a real app, you would delete the job from the backend
    // For now, we'll just close the dialog
    setDeleteDialogOpen(false)
    setJobToDelete(null)
    // You could also update the local state to remove the job
  }

  // Determine order status based on job statuses
  const determineOrderStatus = (jobsData) => {
    if (!jobsData || jobsData.length === 0) return ORDER_STATUS.NEW

    // If all jobs are completed, order is completed
    if (jobsData.every((job) => job.status === JOB_STATUS.COMPLETED)) {
      return ORDER_STATUS.COMPLETED
    }

    // If any job is not "New Job", order is pending
    if (jobsData.some((job) => job.status !== JOB_STATUS.NEW)) {
      return ORDER_STATUS.PENDING
    }

    // Otherwise, order is new
    return ORDER_STATUS.NEW
  }

  // Filter jobs based on search and filter
  const filteredJobs = () => {
    if (!jobs) return []

    // Apply filters
    return jobs.filter((job) => {
      // Filter by status
      if (jobFilter !== "all" && job.status !== jobFilter) {
        return false
      }

      // Filter by phase
      if (phaseFilter !== null && job.status !== phaseFilter) {
        return false
      }

      // Filter by search - only if search term exists
      if (jobSearch) {
        const searchLower = jobSearch.toLowerCase()
        return (
          job.id.toLowerCase().includes(searchLower) ||
          job.name.toLowerCase().includes(searchLower) ||
          job.skuId.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }

  // Handle processing a job from the NextTaskModule
  const handleProcessJob = (job) => {
    handleJobClick(job.id)
  }

  // Define columns for the DataTable in the Workflow tab
  const workflowColumns = [
    { header: "Job #", accessor: "id", className: "font-medium" },
    { header: "SKU ID", accessor: "skuId" },
    { header: "Name", accessor: "name" },
    {
      header: "Job Status",
      accessor: "status",
      render: (job) => (
        <Badge
          className={cn(
            "text-white",
            job.status === JOB_STATUS.NEW
              ? "bg-blue-400 hover:bg-blue-500"
              : job.status === JOB_STATUS.BAG_CREATED
                ? "bg-[#6593F5] hover:bg-[#5483E5]"
                : job.status === JOB_STATUS.STONE_SELECTED
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : job.status === JOB_STATUS.DIAMOND_SELECTED
                    ? "bg-purple-500 hover:bg-purple-600"
                    : job.status === JOB_STATUS.IN_PRODUCTION
                      ? "bg-amber-500 hover:bg-amber-600"
                      : job.status === JOB_STATUS.QC_PASSED
                        ? "bg-orange-500 hover:bg-orange-600"
                        : job.status === JOB_STATUS.COMPLETED
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600",
          )}
        >
          {job.status}
        </Badge>
      ),
    },
    {
      header: "Next Phase",
      accessor: "nextPhase",
      render: (job) => (
        <span>
          {job.status === JOB_STATUS.NEW
            ? "Bag Creation"
            : job.status === JOB_STATUS.BAG_CREATED
              ? "Stone Selection"
              : job.status === JOB_STATUS.STONE_SELECTED
                ? "Diamond Selection"
                : job.status === JOB_STATUS.DIAMOND_SELECTED
                  ? "Manufacturer Selection"
                  : job.status === JOB_STATUS.IN_PRODUCTION
                    ? "Quality Check"
                    : job.status === JOB_STATUS.QC_PASSED
                      ? "Completion"
                      : "-"}
        </span>
      ),
    },
    { header: "Manufacturer", accessor: "manufacturer" },
    {
      header: "Production Date",
      accessor: "productionDate",
      render: (job) => new Date(job.productionDate).toLocaleDateString(),
    },
    { header: "Delivery Date", accessor: "dueDate", render: (job) => new Date(job.dueDate).toLocaleDateString() },
    {
      header: "Action",
      accessor: "action",
      className: "text-right",
      render: (job) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleJobClick(job.id)
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteJob(job)
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  if (!open) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="mb-4">{error}</p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-xl mb-4">Order not found</div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex flex-col h-full">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-lg font-semibold">Order {order.id}</h1>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEditOrder}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </Button>
              <Button variant="destructive" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            <Tabs defaultValue="items">
              <TabsList className="w-full">
                <TabsTrigger value="items" className="flex-1">
                  Order Details
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex-1">
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="border rounded-lg p-4 mt-4">
                <Accordion type="single" collapsible className="w-full mb-6" defaultValue="highlights">
                  <AccordionItem value="highlights">
                    <AccordionTrigger className="text-lg font-semibold">Highlights</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 md:grid-cols-4 mt-2">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <Badge variant={currentStatus === "Priority" ? "destructive" : "secondary"}>
                              {currentStatus}
                            </Badge>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Production Date</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-bold">
                              {new Date(order.productionDate).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-bold">{new Date(order.dueDate).toLocaleDateString()}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Order Type</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-bold">{order.orderType}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jobs in Order</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-bold">{jobs.length}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">SKUs in Order</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-bold">
                              {order.skus && order.skus.map((sku) => sku.id).join(", ")}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Customer Name</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-bold">{order.customerName}</div>
                          </CardContent>
                        </Card>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {order.remarks && (
                  <Accordion type="single" collapsible className="w-full mb-6" defaultValue="remarks">
                    <AccordionItem value="remarks">
                      <AccordionTrigger className="text-lg font-semibold">Order Remarks</AccordionTrigger>
                      <AccordionContent>
                        <div className="p-3 bg-muted rounded-md mt-2">{order.remarks}</div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent value="workflow" className="border rounded-lg p-4 mt-4">
                {/* Next Job section - Updated UI */}
                <div className="border rounded-lg p-4 mb-6">
                  <h2 className="text-xl font-semibold mb-2">Next Job</h2>
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Select your team to see the relevant job to work on</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={selectedTeam === "bag" ? "default" : "outline"}
                      onClick={() => setSelectedTeam("bag")}
                      className="rounded-md"
                    >
                      Bag Creation Team
                    </Button>
                    <Button
                      variant={selectedTeam === "stone" ? "default" : "outline"}
                      onClick={() => setSelectedTeam("stone")}
                      className="rounded-md"
                    >
                      Stone Selection Team
                    </Button>
                    <Button
                      variant={selectedTeam === "diamond" ? "default" : "outline"}
                      onClick={() => setSelectedTeam("diamond")}
                      className="rounded-md"
                    >
                      Diamond Selection Team
                    </Button>
                    <Button
                      variant={selectedTeam === "manufacturer" ? "default" : "outline"}
                      onClick={() => setSelectedTeam("manufacturer")}
                      className="rounded-md"
                    >
                      Manufacturer Selection Team
                    </Button>
                    <Button
                      variant={selectedTeam === "qc" ? "default" : "outline"}
                      onClick={() => setSelectedTeam("qc")}
                      className="rounded-md"
                    >
                      Quality Control Team
                    </Button>
                  </div>
                  <NextTaskModule selectedTeam={selectedTeam} jobs={jobs} onProcessJob={handleProcessJob} />
                </div>

                {/* SECTION 2: Phase Summary */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Order Progress Summary</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <Factory className="mr-2 h-4 w-4" />
                        Bulk Assign
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <PhaseSummaryTracker
                      jobs={jobs}
                      activeFilter={phaseFilter}
                      onFilter={(phase) => {
                        setPhaseFilter(phase)
                        if (phase !== null) {
                          setJobFilter("all") // Reset the dropdown filter when selecting a phase
                        }
                      }}
                    />
                  </div>
                </div>

                {/* SECTION 3: Jobs Table */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Jobs List</h2>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                      <div className="relative">
                        <Input
                          type="search"
                          placeholder="Search jobs..."
                          className="w-[300px]"
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                        />
                      </div>
                      <Select value={jobFilter} onValueChange={setJobFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value={JOB_STATUS.NEW}>New Job</SelectItem>
                          <SelectItem value={JOB_STATUS.BAG_CREATED}>Bag Created</SelectItem>
                          <SelectItem value={JOB_STATUS.STONE_SELECTED}>Stone Selected</SelectItem>
                          <SelectItem value={JOB_STATUS.DIAMOND_SELECTED}>Diamond Selected</SelectItem>
                          <SelectItem value={JOB_STATUS.IN_PRODUCTION}>In Production</SelectItem>
                          <SelectItem value={JOB_STATUS.QC_PASSED}>Quality Check</SelectItem>
                          <SelectItem value={JOB_STATUS.COMPLETED}>Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DataTable
                      columns={workflowColumns}
                      data={filteredJobs()}
                      currentPage={workflowCurrentPage}
                      totalPages={Math.ceil(filteredJobs().length / 10)}
                      onPageChange={setWorkflowCurrentPage}
                      onRefresh={async () => {
                        try {
                          const refreshedJobs = await fetchJobs(orderId)
                          setJobs(refreshedJobs)
                        } catch (err) {
                          console.error("Error refreshing jobs:", err)
                        }
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="border rounded-lg p-4 mt-4">
                <h2 className="text-lg font-semibold mb-4">Order History</h2>
                <div className="space-y-4">
                  {order.history &&
                    order.history.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="min-w-[100px] text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div>
                          <p className="font-medium">{item.action}</p>
                          <p className="text-sm text-muted-foreground">By {item.user}</p>
                        </div>
                      </div>
                    ))}
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="min-w-[100px] text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                    <div>
                      <p className="font-medium">Order viewed</p>
                      <p className="text-sm text-muted-foreground">By Current User</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SKU Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {selectedImage && (
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="SKU"
                className="max-w-full max-h-[500px] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Detail Sheet */}
      <JobDetailSheet job={selectedJob} open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete job {jobToDelete?.id}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteJob}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
