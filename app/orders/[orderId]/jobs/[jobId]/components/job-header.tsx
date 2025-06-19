"use client"

import { useJob } from "@/components/job-context-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Factory, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function JobHeader({ orderId }: { orderId: string }) {
  // Console logging for job header debugging
  console.log("🔍 JobHeader - Component starting execution")
  console.log("🔍 JobHeader - Running environment:", typeof window !== 'undefined' ? 'CLIENT' : 'SERVER')
  console.log("🔍 JobHeader - orderId prop:", orderId)
  
  const job = useJob()
  
  // Console logging for job context debugging
  console.log("🔍 JobHeader - useJob() returned:", job)
  console.log("🔍 JobHeader - Job is null/undefined:", !job)
  console.log("🔍 JobHeader - Job type:", typeof job)
  
  if (job) {
    console.log("🔍 JobHeader - Job data available:", {
      id: job.id,
      job_id: job.job_id,
      name: job.name,
      status: job.status,
      image: job.image,
      skuId: job.skuId,
      productionDate: job.productionDate,
      manufacturer: job.manufacturer
    })
  }

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
          <h1 className="text-2xl font-bold">Job {job?.job_id || 'Loading...'}</h1>
          <Badge variant="secondary" className="ml-2">
            {job?.status || 'Loading...'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md overflow-hidden cursor-pointer">
          <img src={job?.skus?.image_url || job?.image || "/placeholder.svg"} alt={job?.skus?.name || job?.name || 'Job'} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{job?.skus?.name || job?.name || 'Loading...'}</h2>
          <p className="text-sm text-muted-foreground">SKU: {job?.skus?.sku_id || job?.sku_id || job?.skuId || 'Loading...'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className="w-full justify-center py-1.5 text-sm">{job?.status || 'Loading...'}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{job?.production_date ? new Date(job.production_date).toLocaleDateString() : job?.productionDate ? new Date(job.productionDate).toLocaleDateString() : 'Loading...'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturer</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{job?.manufacturer || "Pending"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
