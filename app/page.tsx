"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Package, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrdersTable } from "@/components/orders-table"
import { NewOrderSheet } from "@/components/new-order-sheet"
import { getOpenOrderCount } from "@/app/actions/order-actions"
import { SkuStatistics } from "@/components/sku-statistics"

export default function Dashboard() {
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [editOrder, setEditOrder] = useState(null)

  // Add state for open order count
  const [openOrderCount, setOpenOrderCount] = useState(0)
  const [isLoadingOrderCount, setIsLoadingOrderCount] = useState(true)

  // Fetch open order count on component mount
  useEffect(() => {
    async function fetchOpenOrderCount() {
      setIsLoadingOrderCount(true)
      try {
        const result = await getOpenOrderCount()
        setOpenOrderCount(result.count)
      } catch (error) {
        console.error("Error fetching open order count:", error)
      } finally {
        setIsLoadingOrderCount(false)
      }
    }

    fetchOpenOrderCount()
  }, [])

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
              {/* Keep only the Total Open Orders widget but maintain its width */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="md:col-span-2 lg:col-span-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Open Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrderCount ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{openOrderCount}</div>
                        <p className="text-xs text-muted-foreground">Active orders in the system</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reorganized grid with Recent Orders and SKU Statistics */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Overview of the latest orders in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrdersTable />
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>SKU Statistics</CardTitle>
                    <CardDescription>Most ordered SKUs this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SkuStatistics />
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
