"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useState, useEffect } from "react"

const initialOrders = [
  {
    id: "O12221",
    skus: [
      { id: "NK12345", name: "Gold Necklace", quantity: 5 },
      { id: "RG45678", name: "Diamond Ring", quantity: 3 },
    ],
    dueDate: "2025-04-15",
    productionDate: "2025-04-08",
    status: "New",
    action: "Stone selection",
    daysToDue: 0,
  },
  {
    id: "O12222",
    skus: [{ id: "ER78901", name: "Ruby Earrings", quantity: 10 }],
    dueDate: "2025-04-10",
    productionDate: "2025-04-03",
    status: "Priority",
    action: "Diamond selection",
    daysToDue: 0,
  },
  {
    id: "O12223",
    skus: [
      { id: "BG23456", name: "Gold Bangle", quantity: 2 },
      { id: "PN34567", name: "Emerald Pendant", quantity: 4 },
    ],
    dueDate: "2025-04-20",
    productionDate: "2025-04-13",
    status: "Stones selected done",
    action: "Manufacturer selection",
    daysToDue: 0,
  },
  {
    id: "O12224",
    skus: [{ id: "RG45678", name: "Diamond Ring", quantity: 8 }],
    dueDate: "2025-04-12",
    productionDate: "2025-04-05",
    status: "Priority",
    action: "Sent to manufacturer",
    daysToDue: 0,
  },
  {
    id: "O12225",
    skus: [
      { id: "NK12345", name: "Gold Necklace", quantity: 3 },
      { id: "ER78901", name: "Ruby Earrings", quantity: 6 },
    ],
    dueDate: "2025-04-25",
    productionDate: "2025-04-18",
    status: "New",
    action: "Stone selection",
    daysToDue: 0,
  },
]

export function OrdersTable() {
  const [orders, setOrders] = useState(initialOrders)

  // Calculate days to due for each order
  useEffect(() => {
    const today = new Date()
    const updatedOrders = orders.map((order) => {
      const dueDate = new Date(order.dueDate)
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
  }, [])

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
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
