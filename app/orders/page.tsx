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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OrderConfirmationDialog } from "@/components/order-confirmation-dialog"

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
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

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
    // Console logging for query parameter modal pattern - Root Cause #1
    console.log("🔍 Orders Page - URL params effect triggered")
    console.log("🔍 Orders Page - orderIdFromParams:", orderIdFromParams)
    console.log("🔍 Orders Page - Current URL:", window.location.href)
    console.log("🔍 Orders Page - Current pathname:", window.location.pathname)
    console.log("🔍 Orders Page - Current search params:", window.location.search)
    
    if (orderIdFromParams) {
      console.log("🔍 Orders Page - MODAL PATTERN: Opening order modal for:", orderIdFromParams)
      console.log("🔍 Orders Page - MODAL PATTERN: URL shows /orders?orderId= instead of /orders/[orderId]")
      console.log("🔍 Orders Page - MODAL PATTERN: This prevents job navigation from updating URLs")
      
      setSelectedOrderId(orderIdFromParams)
      setIsOrderDetailOpen(true)
      
      console.log("🔍 Orders Page - MODAL PATTERN: OrderDetailSheet modal opened")
      console.log("🔍 Orders Page - MODAL PATTERN: Any job navigation will be within this modal context")
    } else {
      console.log("🔍 Orders Page - No orderIdFromParams, modal will remain closed")
    }
  }, [orderIdFromParams])

  const handleOrderClick = (orderId: string) => {
    // Console logging for order click behavior
    console.log("🔍 Orders Page - Order clicked:", orderId)
    
    const order = orders.find((o) => o.id === orderId)
    console.log("🔍 Orders Page - Found order:", order)
    
    setSelectedOrderId(orderId)

    if (order?.status === "Draft") {
      console.log("🔍 Orders Page - Draft order, opening edit modal")
      setEditOrder(order)
      setNewOrderOpen(true)
    } else {
      console.log("🔍 Orders Page - Non-draft order, opening detail modal")
      console.log("🔍 Orders Page - This will show order details in modal, not navigate to /orders/[orderId]")
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

        // Set the confirmed order and show the confirmation dialog
        setConfirmedOrder(newOrder)
        setShowOrderConfirmation(true)
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

  // This function is called when the delete button is clicked
  const handleDeleteOrder = (orderId: string) => {
    setDeleteOrderId(orderId)
    setIsDeleteDialogOpen(true)
  }

  // This function is called when deletion is confirmed in the dialog
  const handleDeleteOrderConfirmed = async (orderId: string) => {
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

  const handleViewOrderDetails = () => {
    if (confirmedOrder) {
      setSelectedOrderId(confirmedOrder.id)
      setIsOrderDetailOpen(true)
      setShowOrderConfirmation(false)
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
      header: "Creation Date",
      accessor: "createdAt",
      render: (row) => (
        <span className="italic text-gray-500 text-sm">
      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
      </span>      ),
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
      header: "Actions",
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
              if (row.status === ORDER_STATUS.DRAFT) {
                handleEditOrder(row.id)
              } else {
                handleOrderClick(row.id)
              }
            }}
            disabled={isSubmitting}
          >
            {row.status === ORDER_STATUS.DRAFT ? (
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

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    // First apply tab filter
    let tabMatch = true
    if (activeTab === "all") {
      tabMatch = true // Show all orders
    } else if (activeTab === "pending") {
      tabMatch = [ORDER_STATUS.NEW, ORDER_STATUS.PENDING, ORDER_STATUS.DRAFT].includes(order.status)
    } else if (activeTab === "completed") {
      tabMatch = order.status === ORDER_STATUS.COMPLETED
    } else if (activeTab === "overdue") {
      // Show orders that are overdue (daysToDue < 0) and not completed
      tabMatch = order.daysToDue !== undefined && order.daysToDue < 0 && order.status !== ORDER_STATUS.COMPLETED
    }

    // Then apply search filter
    let searchMatch = true
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      searchMatch = (
        order.id.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.orderType?.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.skus.some(sku => 
          sku.name.toLowerCase().includes(query) ||
          sku.category?.toLowerCase().includes(query)
        )
      )
    }

    return tabMatch && searchMatch
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

  // Reset to page 1 when changing tabs or search query
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery])

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
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
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
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{actionSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold mb-2">Order List</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search orders..." 
                  className="w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          {/* Default filters as tabs */}
          <div className="border-b px-4 py-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-[800px] grid-cols-4">
                <TabsTrigger value="all">
                  All Orders ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending Orders ({orders.filter((o) => [ORDER_STATUS.NEW, ORDER_STATUS.PENDING, ORDER_STATUS.DRAFT].includes(o.status)).length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed Orders ({orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length})
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  <span>Overdue Orders</span>
                  <span className={`ml-1 ${orders.filter((o) => o.daysToDue !== undefined && o.daysToDue < 0 && o.status !== ORDER_STATUS.COMPLETED).length > 0 ? 'text-red-500 font-bold' : ''}`}>
                    ({orders.filter((o) => o.daysToDue !== undefined && o.daysToDue < 0 && o.status !== ORDER_STATUS.COMPLETED).length})
                  </span>
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

      {/* Order Confirmation Dialog */}
      <OrderConfirmationDialog
        order={confirmedOrder}
        open={showOrderConfirmation}
        onOpenChange={setShowOrderConfirmation}
        onViewDetails={handleViewOrderDetails}
      />

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order {deleteOrderId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteOrderId) {
                  handleDeleteOrderConfirmed(deleteOrderId)
                }
                setIsDeleteDialogOpen(false)
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
