"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Filter, Calendar, Edit, Trash2, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderDetailSheet } from "@/components/order-detail-sheet"
import { NewOrderSheet } from "@/components/new-order-sheet"
import { useSearchParams } from "next/navigation"
import { fetchOrders } from "@/lib/api-service"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Order } from "@/types"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch orders
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
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

  const handleOrderCreated = (order: Order) => {
    // Check if this is an update to an existing order
    const existingIndex = orders.findIndex((o) => o.id === order.id)

    if (existingIndex >= 0) {
      // Update existing order
      const updatedOrders = [...orders]
      updatedOrders[existingIndex] = order
      setOrders(updatedOrders)
    } else {
      // Add new order
      setOrders((prevOrders) => [...prevOrders, order])
    }

    setEditOrder(null)
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
      render: (row) => (
        <Badge
          className={
            row.orderType === "Stock"
              ? "bg-blue-100 text-blue-800 border-blue-300"
              : row.orderType === "Customer"
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : "bg-gray-100 text-gray-800 border-gray-300"
          }
        >
          {row.orderType}
        </Badge>
      ),
    },
    {
      header: "Jobs",
      accessor: "skus",
      render: (row) => (
        <div className="text-center font-medium">{row.skus.reduce((total, sku) => total + sku.quantity, 0)}</div>
      ),
    },
    {
      header: "Days to Due",
      accessor: "daysToDue",
      render: (row) => (
        <Badge
          variant={
            row.status === "Draft"
              ? "outline"
              : row.daysToDue <= 3
                ? "destructive"
                : row.daysToDue <= 7
                  ? "secondary"
                  : "outline"
          }
        >
          {row.status === "Draft" ? "Draft" : `${row.daysToDue} days`}
        </Badge>
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
      header: "Order Status",
      accessor: "status",
      render: (row) => (
        <Badge
          className={
            row.status === "Completed"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : row.status === "Pending"
                ? "bg-white border-2 border-yellow-400 text-yellow-600"
                : row.status === "Draft"
                  ? "bg-black hover:bg-gray-800 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-600"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "History",
      accessor: "history",
      render: (row) => (
        <div className="max-w-xs">
          {row.history && row.history.length > 0 ? (
            <div className="space-y-1">
              {row.history.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-start text-xs">
                  <Clock className="h-3 w-3 mr-1 mt-0.5 text-gray-500" />
                  <div>
                    <span className="font-medium">{item.action}</span>
                    <div className="text-gray-500">
                      {new Date(item.date).toLocaleDateString()} by {item.user}
                    </div>
                  </div>
                </div>
              ))}
              {row.history.length > 3 && (
                <div className="text-xs text-blue-600 cursor-pointer hover:underline">
                  +{row.history.length - 3} more entries
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No history available</span>
          )}
        </div>
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
              // Delete functionality would go here
              alert(`Delete order ${row.id}?`)
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px]">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  // Filter orders based on active tab, search term, and status filter
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === "pending" && !["New", "Pending", "Draft"].includes(order.status)) {
      return false
    }
    if (activeTab === "completed" && order.status !== "Completed") {
      return false
    }

    // Search filter
    if (
      searchTerm &&
      !order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (statusFilter !== "all" && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }

    return true
  })

  // Calculate total pages
  const itemsPerPage = 5
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }

  // Reset to page 1 when changing filters
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm, statusFilter])

  // Mock refresh function
  const handleRefresh = () => {
    setLoading(true)
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
      })
      .finally(() => {
        setLoading(false)
      })
  }

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
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="border border-gray-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Order Highlights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-sm text-gray-500">Orders due soon or overdue</div>
                <div className="text-2xl font-bold mt-1">{orders.filter((order) => order.daysToDue <= 7).length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-sm text-gray-500">Pending orders</div>
                <div className="text-2xl font-bold mt-1">
                  {orders.filter((order) => order.status === "Pending").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="text-sm text-gray-500">Orders created today</div>
                <div className="text-2xl font-bold mt-1">
                  {/* Assuming 2 orders created today for demo purposes */}2
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-lg font-semibold mb-2">Order List</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="w-[300px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      />
    </div>
  )
}
