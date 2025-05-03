"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Package, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrdersTable } from "@/components/orders-table"
import { PriorityOrdersTable } from "@/components/priority-orders-table"
import { NewOrderSheet } from "@/components/new-order-sheet"

export default function Dashboard() {
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [editOrder, setEditOrder] = useState(null)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="hidden sm:inline-block">Jewelry ERP</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              Activity Log
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button size="sm" onClick={() => setNewOrderOpen(true)}>
              <Package className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </header>
        <div className="grid flex-1">
          <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Open Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+2 since yesterday</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Priority Orders</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">Due within 7 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">+12 this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                    <Loader2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">18</div>
                    <p className="text-xs text-muted-foreground">Across all orders</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Overview of the latest orders in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrdersTable />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Priority Orders</CardTitle>
                    <CardDescription>Orders that require immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PriorityOrdersTable />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Production Calendar</CardTitle>
                    <CardDescription>Upcoming production dates for all orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      <CalendarDays className="mr-2 h-5 w-5" />
                      <span>Calendar view will be implemented here</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>SKU Statistics</CardTitle>
                    <CardDescription>Most ordered SKUs this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-[30%] font-medium">NK12345YGNO</div>
                        <div className="w-[50%] text-sm text-muted-foreground">Gold Necklace</div>
                        <div className="w-[20%] text-right text-sm">42 units</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[30%] font-medium">RG45678WGNO</div>
                        <div className="w-[50%] text-sm text-muted-foreground">Diamond Ring</div>
                        <div className="w-[20%] text-right text-sm">36 units</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[30%] font-medium">ER78901YGRB</div>
                        <div className="w-[50%] text-sm text-muted-foreground">Ruby Earrings</div>
                        <div className="w-[20%] text-right text-sm">28 units</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[30%] font-medium">BG23456RGNO</div>
                        <div className="w-[50%] text-sm text-muted-foreground">Gold Bangle</div>
                        <div className="w-[20%] text-right text-sm">24 units</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[30%] font-medium">PN34567YGEM</div>
                        <div className="w-[50%] text-sm text-muted-foreground">Emerald Pendant</div>
                        <div className="w-[20%] text-right text-sm">19 units</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Fixed NewOrderSheet component */}
      <NewOrderSheet open={newOrderOpen} onOpenChange={setNewOrderOpen} editOrder={editOrder} />
    </div>
  )
}
