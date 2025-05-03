"use client"

import { useJob } from "../layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Factory, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function JobHeader({ orderId }: { orderId: string }) {
  const job = useJob()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/orders/${orderId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Order</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Job {job.id}</h1>
          <Badge variant="secondary" className="ml-2">
            {job.status}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md overflow-hidden cursor-pointer">
          <img src={job.image || "/placeholder.svg"} alt={job.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{job.name}</h2>
          <p className="text-sm text-muted-foreground">SKU: {job.skuId}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className="w-full justify-center py-1.5 text-sm">{job.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{new Date(job.productionDate).toLocaleDateString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturer</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{job.manufacturer || "Pending"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
