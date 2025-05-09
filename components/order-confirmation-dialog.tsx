"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import type { Order } from "@/types"

interface OrderConfirmationDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewDetails: () => void
}

export function OrderConfirmationDialog({ order, open, onOpenChange, onViewDetails }: OrderConfirmationDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Order Created Successfully
          </DialogTitle>
          <DialogDescription>Your order has been created with the following details:</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order Type:</span>
              <span>{order.orderType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Customer:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Items:</span>
              <span>{order.skus.reduce((total, sku) => total + sku.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Production Date:</span>
              <span>{order.productionDate ? new Date(order.productionDate).toLocaleDateString() : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Delivery Date:</span>
              <span>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "-"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onViewDetails}>View Order Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
