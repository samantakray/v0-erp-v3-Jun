"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { getSkuStatistics } from "@/lib/api-service"

export function SkuStatistics() {
  const [skuStats, setSkuStats] = useState<Array<{ id: string; name: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSkuStats() {
      setIsLoading(true)
      try {
        const stats = await getSkuStatistics(5) // Get top 5 SKUs
        setSkuStats(stats)
      } catch (error) {
        console.error("Error fetching SKU statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkuStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading SKU statistics...</span>
      </div>
    )
  }

  if (skuStats.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No SKU statistics available</div>
  }

  return (
    <div className="space-y-4">
      {skuStats.map((sku) => (
        <div key={sku.id} className="flex items-center">
          <div className="w-[30%] font-medium">{sku.id}</div>
          <div className="w-[50%] text-sm text-muted-foreground">{sku.name}</div>
          <div className="w-[20%] text-right text-sm">{sku.count} units</div>
        </div>
      ))}
    </div>
  )
}
