"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchOrders } from "@/lib/api-service"
import Link from "next/link"

export function PriorityOrdersTable() {
  const [priorityOrders, setPriorityOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch orders on component mount
  useEffect(() => {
    async function loadPriorityOrders() {
      setIsLoading(true)
      try {
        const ordersData = await fetchOrders()

        // Process orders to calculate days to due
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

        // Filter for priority orders (due within 7 days)
        const priorityOrdersData = processedOrders
          .filter((order) => order.daysToDue <= 7 && order.status !== "Completed" && order.status !== "Cancelled")
          .sort((a, b) => a.daysToDue - b.daysToDue)
          .slice(0, 5) // Limit to 5 most urgent orders

        setPriorityOrders(priorityOrdersData)
      } catch (error) {
        console.error("Error fetching priority orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPriorityOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (priorityOrders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No priority orders at the moment.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priorityOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={order.daysToDue <= 3 ? "destructive" : "secondary"}>{order.daysToDue} days</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{order.status}</Badge>
              </TableCell>
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
