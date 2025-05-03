"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"

const priorityOrders = [
  {
    id: "O12222",
    skus: [{ id: "ER78901", name: "Ruby Earrings", quantity: 10 }],
    dueDate: "2025-04-10",
    productionDate: "2025-04-03",
    action: "Diamond selection",
    daysLeft: 2,
  },
  {
    id: "O12224",
    skus: [{ id: "RG45678", name: "Diamond Ring", quantity: 8 }],
    dueDate: "2025-04-12",
    productionDate: "2025-04-05",
    action: "Sent to manufacturer",
    daysLeft: 4,
  },
  {
    id: "O12226",
    skus: [{ id: "BG23456", name: "Gold Bangle", quantity: 4 }],
    dueDate: "2025-04-09",
    productionDate: "2025-04-02",
    action: "Stone selection",
    daysLeft: 1,
  },
]

export function PriorityOrdersTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Due In</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="text-right">Take Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priorityOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {order.id}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={order.daysLeft <= 2 ? "destructive" : "outline"}>
                  {order.daysLeft} {order.daysLeft === 1 ? "day" : "days"}
                </Badge>
              </TableCell>
              <TableCell>{order.action}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  <ArrowRight className="mr-1 h-4 w-4" />
                  Process
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
