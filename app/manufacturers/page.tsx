"use client"

import { useState, useEffect } from "react"
import { DataTable, type Column } from "@/app/components/DataTable"
import { fetchManufacturers } from "@/lib/api-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, StarHalf, Plus, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import { logger } from "@/lib/logger"
import { NewManufacturerSheet } from "@/components/new-manufacturer-sheet"

// Define the Manufacturer type based on the database schema
interface Manufacturer {
  id: string
  name: string
  current_load: number | null
  past_job_count: number | null
  rating: number | null
  active: boolean
  created_at: string
}

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isNewManufacturerOpen, setIsNewManufacturerOpen] = useState(false)
  const pageSize = 10

  // Function to load manufacturers data
  const loadManufacturers = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchManufacturers()
      setManufacturers(data)

      // Calculate total pages
      setTotalPages(Math.max(1, Math.ceil(data.length / pageSize)))

      logger.info("Manufacturers loaded successfully", { count: data.length })
    } catch (err) {
      logger.error("Error loading manufacturers", { error: err })
      setError("Failed to load manufacturers. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Load manufacturers on component mount
  useEffect(() => {
    loadManufacturers()
  }, [])

  // Get current page of manufacturers
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return manufacturers.slice(startIndex, endIndex)
  }

  // Render star rating - with null/undefined handling
  const renderRating = (rating: number | null) => {
    // Handle null or undefined rating
    if (rating === null || rating === undefined) {
      return (
        <div className="flex items-center text-gray-400">
          <HelpCircle className="h-4 w-4 mr-1" />
          <span>Not rated</span>
        </div>
      )
    }

    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {rating.toFixed(1)}
        <div className="flex ml-2 text-yellow-500">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-500" />
          ))}
          {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-500" />}
        </div>
      </div>
    )
  }

  // Define columns for the DataTable
  const columns: Column<Manufacturer>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Current Load",
      accessor: "current_load",
      render: (manufacturer) => (
        <span className="font-medium">
          {manufacturer.current_load !== null ? `${manufacturer.current_load} jobs` : "N/A"}
        </span>
      ),
    },
    {
      header: "Past Jobs",
      accessor: "past_job_count",
      render: (manufacturer) => (
        <span>{manufacturer.past_job_count !== null ? manufacturer.past_job_count : "N/A"}</span>
      ),
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (manufacturer) => renderRating(manufacturer.rating),
    },
    {
      header: "Status",
      accessor: "active",
      render: (manufacturer) => (
        <Badge variant={manufacturer.active ? "success" : "destructive"}>
          {manufacturer.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: "created_at",
      render: (manufacturer) => {
        try {
          return <span className="text-gray-500">{format(new Date(manufacturer.created_at), "MMM d, yyyy")}</span>
        } catch (e) {
          return <span className="text-gray-400">Invalid date</span>
        }
      },
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Manufacturers</h1>
        <Button onClick={() => setIsNewManufacturerOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Manufacturer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={getCurrentPageData()}
        loading={loading}
        error={error}
        onRefresh={loadManufacturers}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        caption="List of all manufacturers in the system"
      />

      <NewManufacturerSheet
        open={isNewManufacturerOpen}
        onOpenChange={setIsNewManufacturerOpen}
        onSuccess={loadManufacturers}
      />
    </div>
    
  )
}
