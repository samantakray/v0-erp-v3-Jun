"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Filter, Calendar, Edit, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDetailSheet } from "@/components/order-detail-sheet"
import { NewOrderSheet } from "@/components/new-order-sheet"
import { useSearchParams } from "next/navigation"
import { fetchOrders } from "@/lib/api-service"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createOrder, updateOrder, deleteOrder } from "@/app/actions/order-actions"
import { logger } from "@/lib/logger"
import type { Order } from "@/types"
import { ORDER_STATUS } from "@/constants/job-workflow"

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const orderIdFromParams = searchParams.get("orderId")

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Fetch orders
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchOrders()

        // Calculate days to due for each order
        const today = new Date()
        const updatedOrders = data.map((order) => {
          const dueDate = new Date(order.dueDate || order.deliveryDate || "")
          const timeDiff = dueDate.getTime() - today.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
          return {
            ...order,
            daysToDue: daysDiff,
          }
        })

        // Sort orders by days to due in ascending order
        updatedOrders.sort((a, b) => a.daysToDue - b.daysToDue)
        setOrders(updatedOrders)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        setError("Failed to load orders. Please try again.")
        logger.error("Failed to fetch orders", { error: err })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Handle order ID from URL params
  useEffect(() => {
    if (orderIdFromParams) {
      setSelectedOrderId(orderIdFromParams)
      setIsOrderDetailOpen(true)
    }
  }, [orderIdFromParams])

  const handleOrderClick = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    setSelectedOrderId(orderId)

    if (order?.status === "Draft") {
      setEditOrder(order)
      setNewOrderOpen(true)
    } else {
      setIsOrderDetailOpen(true)
    }
  }

  const handleEditOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setEditOrder(order)
      setNewOrderOpen(true)
      setIsOrderDetailOpen(false)
    }
  }

  const handleOrderCreated = async (order: Order) => {
    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      // Check if this is an update to an existing order
      const existingIndex = orders.findIndex((o) => o.id === order.id)
      const isUpdate = existingIndex >= 0

      // Call the appropriate server action
      const result = isUpdate ? await updateOrder(order) : await createOrder(order)

      if (!result.success) {
        setActionError(result.error || "Failed to save order")
        logger.error(`Failed to ${isUpdate ? "update" : "create"} order`, {
          data: { orderId: order.id },
          error: result.error,
        })
        return
      }

      // Update local state
      if (isUpdate) {
        // Update existing order
        const updatedOrders = [...orders]
        updatedOrders[existingIndex] = order
        setOrders(updatedOrders)
        setActionSuccess(`Order ${order.id} updated successfully`)
      } else {
        // For new orders, use the server-generated ID
        const newOrder = {
          ...order,
          id: result.orderId, // Use the server-generated ID
        }
        setOrders((prevOrders) => [...prevOrders, newOrder])
        setActionSuccess(`Order ${result.orderId} created successfully`)
      }

      setNewOrderOpen(false)
      setEditOrder(null)
    } catch (err) {
      setActionError("An unexpected error occurred")
      logger.error(`Unexpected error in handleOrderCreated`, {
        data: { orderId: order.id },
        error: err,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) {
      return
    }

    setIsSubmitting(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      const result = await deleteOrder(orderId)

      if (!result.success) {
        setActionError(result.error || "Failed to delete order")
        logger.error("Failed to delete order", {
          data: { orderId },
          error: result.error,
        })
        return
      }

      // Remove from local state
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId))
      setActionSuccess(`Order ${orderId} deleted successfully`)
    } catch (err) {
      setActionError("An unexpected error occurred")
      logger.error("Unexpected error in handleDeleteOrder", {
        data: { orderId },
        error: err,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Define columns for the DataTable
  const columns: Column<Order>[] = [
    {
      header: "Order #",
      accessor: "id",
      className: "font-medium",
    },
    {
      header: "Order Type",
      accessor: "orderType",
      render: (row) => <div>{row.orderType || "-"}</div>,
    },
    {
      header: "Jobs",
      accessor: "skus",
      render: (row) => (
        <div className="text-center font-medium">{row.skus.reduce((total, sku) => total + sku.quantity, 0)}</div>
      ),
    },
    {
      header: "Production Date",
      accessor: "productionDate",
      render: (row) => (
        <>
          {row.productionDate
            ? new Date(row.productionDate).toLocaleDateString()
            : row.productionDueDate
              ? new Date(row.productionDueDate).toLocaleDateString()
              : "-"}
        </>
      ),
    },
    {
      header: "Delivery Date",
      accessor: "dueDate",
      render: (row) => (
        <>
          {row.dueDate
            ? new Date(row.dueDate).toLocaleDateString()
            : row.deliveryDate
              ? new Date(row.deliveryDate).toLocaleDateString()
              : "-"}
        </>
      ),
    },
    {
      header: "Order Status",
      accessor: "status",
      render: (row) => (
        <Badge
          className={
            row.status === ORDER_STATUS.COMPLETED
              ? "bg-green-500 hover:bg-green-600 text-white"
              : row.status === ORDER_STATUS.PENDING
                ? "bg-white border-2 border-yellow-400 text-yellow-600"
                : row.status === ORDER_STATUS.DRAFT
                  ? "bg-black hover:bg-gray-800 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-600"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Order Actions",
      accessor: "id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              handleEditOrder(row.id)
            }}
            disabled={isSubmitting}
          >
            <Edit className="h-4 w-4" />
            <span className="text-[10px]">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              if (row.status === "Draft") {
                handleEditOrder(row.id)
              } else {
                handleOrderClick(row.id)
              }
            }}
            disabled={isSubmitting}
          >
            {row.status === "Draft" ? (
              <>
                <Edit className="h-4 w-4" />
                <span className="text-[10px]">Edit</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="text-[10px]">View</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1 text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteOrder(row.id)
            }}
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px]">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pending") {
      return [ORDER_STATUS.NEW, ORDER_STATUS.PENDING, ORDER_STATUS.DRAFT].includes(order.status)
    } else if (activeTab === "completed") {
      return order.status === ORDER_STATUS.COMPLETED
    }
    return true
  })

  // Mock refresh function
  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    setActionError(null)
    // Fetch orders again
    fetchOrders()
      .then((data) => {
        // Calculate days to due for each order
        const today = new Date()
        const updatedOrders = data.map((order) => {
          const dueDate = new Date(order.dueDate || order.deliveryDate || "")
          const timeDiff = dueDate.getTime() - today.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
          return {
            ...order,
            daysToDue: daysDiff,
          }
        })

        // Sort orders by days to due in ascending order
        updatedOrders.sort((a, b) => a.daysToDue - b.daysToDue)
        setOrders(updatedOrders)
      })
      .catch((err) => {
        console.error("Failed to refresh orders:", err)
        setError("Failed to refresh orders. Please try again.")
        logger.error("Failed to refresh orders", { error: err })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Calculate total pages based on filtered data length
  const totalPages = Math.ceil(filteredOrders.length / 5)

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * 5
    const endIndex = startIndex + 5
    return filteredOrders.slice(startIndex, endIndex)
  }

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccess])

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl font-semibold">Orders</h1>
          <Button
            onClick={() => {
              setEditOrder(null)
              setNewOrderOpen(true)
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New Order
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {actionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {actionSuccess && (
          <Alert variant="success" className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{actionSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold mb-2">Order List</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search orders..." className="w-[300px] pl-8" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          {/* Default filters as tabs */}
          <div className="border-b px-4 py-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="pending">
                  Pending Orders ({orders.filter((o) => ["New", "Pending", "Draft"].includes(o.status)).length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed Orders ({orders.filter((o) => o.status === "Completed").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <DataTable
            columns={columns}
            data={getCurrentPageData()}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      {/* Order Detail Sheet */}
      <OrderDetailSheet
        orderId={selectedOrderId}
        open={isOrderDetailOpen}
        onOpenChange={setIsOrderDetailOpen}
        onEdit={handleEditOrder}
      />

      {/* New/Edit Order Sheet */}
      <NewOrderSheet
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onOrderCreated={handleOrderCreated}
        editOrder={editOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
