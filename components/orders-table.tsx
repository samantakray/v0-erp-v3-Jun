"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchOrders } from "@/lib/api-service"
import Link from "next/link"

export function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch orders on component mount
  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)
      try {
        const ordersData = await fetchOrders()

        // Sort orders by days to due in ascending order
        const today = new Date()
        const processedOrders = ordersData.map((order) => {
          const dueDate = new Date(order.dueDate)
          const timeDiff = dueDate.getTime() - today.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
          return {
            ...order,
            daysToDue: daysDiff,
          }
        })

        // Sort orders by days to due in ascending order
        processedOrders.sort((a, b) => a.daysToDue - b.daysToDue)

        // Limit to 5 most recent orders for the dashboard
        setOrders(processedOrders.slice(0, 5))
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found. Create your first order to get started.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>SKUs</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Days to Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Action</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {order.skus.map((sku) => (
                    <div key={sku.id} className="text-xs">
                      {sku.id} ({sku.quantity})
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={order.daysToDue <= 3 ? "destructive" : order.daysToDue <= 7 ? "secondary" : "outline"}>
                  {order.daysToDue} days
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={order.status === "Priority" ? "destructive" : "secondary"}>{order.status}</Badge>
              </TableCell>
              <TableCell>{order.action}</TableCell>
              <TableCell className="text-right">
                <Link href={`/orders/${order.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
