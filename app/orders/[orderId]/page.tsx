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

  // Fetch order data
  useEffect(() => {
    async function loadOrder() {
      try {
        const { order: orderData } = await fetchOrder(orderId)
        setOrder(orderData)
      } catch (error) {
        logger.error("Error fetching order", { data: { orderId }, error })
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  // Redirect to orders page with the order ID as a query parameter
  useEffect(() => {
    router.push(`/orders?orderId=${orderId}`)
  }, [orderId, router])

  // This component doesn't render anything as it redirects
  return null
}
