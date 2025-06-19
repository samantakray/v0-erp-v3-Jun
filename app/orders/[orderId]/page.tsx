"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchOrder } from "@/lib/api-service"
import type { Order } from "@/types"
import { logger } from "@/lib/logger"

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const orderId = params.orderId
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Console logging for URL navigation debugging - Root Cause #1
  console.log("🔍 Order Details Page - Component mounted with orderId:", orderId)
  console.log("🔍 Order Details Page - Current URL path:", window.location.pathname)
  console.log("🔍 Order Details Page - Current URL search:", window.location.search)

  // Fetch order data
  useEffect(() => {
    async function loadOrder() {
      try {
        // Console logging for data fetching
        console.log("🔍 Order Details Page - Starting to fetch order data for:", orderId)
        const { order: orderData } = await fetchOrder(orderId)
        setOrder(orderData)
        console.log("🔍 Order Details Page - Successfully fetched order data:", orderData)
      } catch (error) {
        console.log("🔍 Order Details Page - Error fetching order:", error)
        logger.error("Error fetching order", { data: { orderId }, error })
      } finally {
        setLoading(false)
        console.log("🔍 Order Details Page - Finished loading order data")
      }
    }

    loadOrder()
  }, [orderId])

  // Redirect to orders page with the order ID as a query parameter
  useEffect(() => {
    // Console logging for redirect behavior - Root Cause #1: Modal Pattern
    console.log("🔍 Order Details Page - REDIRECT EFFECT: About to redirect from direct URL to modal pattern")
    console.log("🔍 Order Details Page - REDIRECT EFFECT: From:", `/orders/${orderId}`)
    console.log("🔍 Order Details Page - REDIRECT EFFECT: To:", `/orders?orderId=${orderId}`)
    console.log("🔍 Order Details Page - REDIRECT EFFECT: This prevents URL updates for job navigation")
    
    router.push(`/orders?orderId=${orderId}`)
    
    console.log("🔍 Order Details Page - REDIRECT EFFECT: router.push() called")
  }, [orderId, router])

  // This component doesn't render anything as it redirects
  return null
}
