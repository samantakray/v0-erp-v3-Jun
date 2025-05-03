"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function OrderDetailsPage({ params }) {
  const router = useRouter()
  const { id } = params

  // Redirect to orders page with the order ID as a query parameter
  useEffect(() => {
    router.push(`/orders?orderId=${id}`)
  }, [id, router])

  // Mock order data
  const order = {
    id: id,
    skus: [
      {
        id: "N12345",
        name: "Gold Necklace",
        quantity: 5,
        category: "Necklace",
        goldType: "Yellow Gold",
        stoneType: "None",
        diamondType: "0.5",
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "R45678",
        name: "Diamond Ring",
        quantity: 3,
        category: "Ring",
        goldType: "White Gold",
        stoneType: "None",
        diamondType: "1.0",
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    dueDate: "2025-04-15",
    productionDate: "2025-04-08",
    status: "New",
    action: "Stone selection",
    createdAt: "2025-03-20",
    history: [
      { date: "2025-03-20", action: "Order created", user: "John Smith" },
      { date: "2025-03-21", action: "Order approved", user: "Sarah Johnson" },
    ],
  }

  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [currentAction, setCurrentAction] = useState(order.action)

  const handleStatusChange = (status) => {
    setCurrentStatus(status)
    // In a real app, you would update the backend here
  }

  return null
}
