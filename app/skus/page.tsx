"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Filter, Eye } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { NewSKUSheet } from "@/components/new-sku-sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { skus } from "@/mocks/skus"
import type { SKU } from "@/types"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Badge } from "@/components/ui/badge"

export default function SKUsPage() {
  const [newSKUSheetOpen, setNewSKUSheetOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [goldTypeFilter, setGoldTypeFilter] = useState("all")
  const [stoneTypeFilter, setStoneTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [skuData, setSkuData] = useState<SKU[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    // Simulate API fetch with mock data
    const loadSkus = () => {
      try {
        setLoading(true)
        // Use the imported skus from mocks/skus.ts
        setSkuData(skus)
      } catch (err) {
        console.error("Failed to fetch SKUs:", err)
        setError("Failed to load SKUs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSkus()
  }, [])

  // Filter SKUs based on search query and filters
  const filteredSKUs = skuData.filter((sku) => {
    // Search query filter
    if (
      searchQuery &&
      !sku.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sku.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Category filter
    if (categoryFilter !== "all" && sku.category !== categoryFilter) {
      return false
    }

    // Gold type filter
    if (goldTypeFilter !== "all" && sku.goldType !== goldTypeFilter) {
      return false
    }

    // Stone type filter
    if (stoneTypeFilter !== "all" && sku.stoneType !== stoneTypeFilter) {
      return false
    }

    return true
  })

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredSKUs.length / itemsPerPage))

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSKUs = filteredSKUs.slice(startIndex, startIndex + itemsPerPage)

  const handleSKUCreated = (newSKU) => {
    // Add the new SKU to the state
    setSkuData((prevSkus) => [...prevSkus, newSKU])
  }

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API fetch with mock data
    setTimeout(() => {
      setSkuData(skus)
      setLoading(false)
    }, 500)
  }

  // Define columns for DataTable
  const columns: Column<SKU>[] = [
    {
      header: "Image",
      accessor: "image",
      render: (sku) => (
        <Image
          src={sku.image || "/placeholder.svg"}
          alt={sku.name}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
      ),
      className: "w-[80px]",
    },
    {
      header: "SKU ID",
      accessor: "id",
      render: (sku) => <span className="font-medium">{sku.id}</span>,
    },
    {
      header: "Category",
      accessor: "category",
      render: (sku) => <Badge variant="outline">{sku.category}</Badge>,
    },
    {
      header: "Size",
      accessor: "size",
    },
    {
      header: "Gold Type",
      accessor: "goldType",
    },
    {
      header: "Stone Type",
      accessor: "stoneType",
      render: (sku) => (sku.stoneType === "None" ? "-" : sku.stoneType),
    },
    {
      header: "Diamond Type",
      accessor: "diamondType",
      render: (sku) => sku.diamondType || "-",
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (sku) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
            onClick={() => {
              // View SKU details
              console.log("View SKU:", sku.id)
            }}
          >
            <Eye className="h-4 w-4" />
            <span className="text-[10px]">View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
            onClick={() => {
              // Edit SKU
              console.log("Edit SKU:", sku.id)
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="text-[10px]">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1 text-red-500 hover:text-red-600"
            onClick={() => {
              // Delete SKU
              console.log("Delete SKU:", sku.id)
              alert(`Delete SKU ${sku.id}?`)
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px]">Delete</span>
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">SKU Management</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SKUs..."
                className="w-[300px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Necklace">Necklace</SelectItem>
                  <SelectItem value="Ring">Ring</SelectItem>
                  <SelectItem value="Earring">Earring</SelectItem>
                  <SelectItem value="Bangle">Bangle</SelectItem>
                  <SelectItem value="Pendant">Pendant</SelectItem>
                </SelectContent>
              </Select>
              <Select value={goldTypeFilter} onValueChange={setGoldTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Gold Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gold Types</SelectItem>
                  <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                  <SelectItem value="White Gold">White Gold</SelectItem>
                  <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stoneTypeFilter} onValueChange={setStoneTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stone Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stone Types</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Rubies">Rubies</SelectItem>
                  <SelectItem value="Emeralds">Emeralds</SelectItem>
                  <SelectItem value="Sapphires">Sapphires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setNewSKUSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New SKU
            </Button>
          </div>
        </div>

        {/* SKU Inventory Title */}
        <div className="mb-2">
          <h2 className="text-lg font-medium">SKU Inventory</h2>
        </div>

        <DataTable
          columns={columns}
          data={paginatedSKUs} // Use paginated SKUs
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* New SKU Sheet */}
      <NewSKUSheet open={newSKUSheetOpen} onOpenChange={setNewSKUSheetOpen} onSKUCreated={handleSKUCreated} />
    </div>
  )
}
