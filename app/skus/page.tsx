"use client"

import "@/styles/animations.css"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { NewSKUSheet } from "@/components/new-sku-sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchSkus } from "@/lib/api-service"
import { deleteSku } from "@/app/actions/sku-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SKU } from "@/types"
import { DataTable, type Column } from "@/app/components/DataTable"
import { COLLECTION_NAME, GOLD_TYPE, STONE_TYPE, SIZE_UNITS } from "@/constants/categories"

export default function SKUsPage() {
  const [newSKUSheetOpen, setNewSKUSheetOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [collectionFilter, setCollectionFilter] = useState("all")
  const [goldTypeFilter, setGoldTypeFilter] = useState("all")
  const [stoneTypeFilter, setStoneTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [skus, setSkus] = useState<SKU[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [newlyAddedSkuIds, setNewlyAddedSkuIds] = useState<string[]>([])

  useEffect(() => {
    async function loadSkus() {
      try {
        setLoading(true)
        const data = await fetchSkus()

        // Log the raw data to see what we're getting
        console.log("Initial SKU data:", data)

        // Ensure size is properly processed
        const processedData = data.map((sku) => ({
          ...sku,
          // Ensure size is a number if it exists
          size: sku.size !== null && sku.size !== undefined ? Number(sku.size) : null,
        }))

        // Sort by createdAt (newest first)
        const sortedData = [...processedData].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA // Descending order (newest first)
        })

        setSkus(sortedData)
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
  const filteredSKUs = useMemo(() => {
    return skus.filter((sku) => {
      // Search query filter
      if (
        searchQuery &&
        !sku.id?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !sku.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && sku.category !== categoryFilter) {
        return false
      }

      // Collection filter
      if (collectionFilter !== "all" && sku.collection !== collectionFilter) {
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
  }, [skus, searchQuery, categoryFilter, collectionFilter, goldTypeFilter, stoneTypeFilter])

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredSKUs.length / itemsPerPage))

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSKUs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSKUs, currentPage, itemsPerPage])

  const handleSKUCreated = (createdSkuFromBatch) => {
    // Renamed parameter for clarity
    console.log("onSKUCreated called with:", createdSkuFromBatch) // Log the received data

    // Check if the data is valid and contains necessary fields
    if (!createdSkuFromBatch || !createdSkuFromBatch.sku_id) {
      console.error("Invalid SKU data received from NewSKUSheet callback")
      setError("Invalid SKU data received. Please try again.")
      return
    }

    // Add the new SKU (or array of SKUs) to the state
    // Since createSkuBatch returns an array, handle it appropriately
    const skusToAdd = Array.isArray(createdSkuFromBatch) ? createdSkuFromBatch : [createdSkuFromBatch]

    // Track newly added SKU IDs
    const newIds = skusToAdd.map((sku) => sku.sku_id)
    setNewlyAddedSkuIds(newIds)

    // Clear after animation duration
    setTimeout(() => {
      setNewlyAddedSkuIds([]);
      handleRefresh(); // Call handleRefresh after clearing the newly added SKU IDs
    }, 5000)

    setSkus((prevSkus) => {
      // Sort the incoming skusToAdd to maintain newest-first order
      const sortedSkusToAdd = [...skusToAdd].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA // Descending order
      })

      // Map the database fields to the frontend SKU model
      const formattedSkus = sortedSkusToAdd.map((dbSku) => ({
        id: dbSku.sku_id,
        sku_id: dbSku.sku_id,
        name: dbSku.name,
        category: dbSku.category,
        collection: dbSku.collection,
        // Ensure size is a number if it exists
        size: dbSku.size !== null && dbSku.size !== undefined ? Number(dbSku.size) : null,
        goldType: dbSku.gold_type,
        stoneType: dbSku.stone_type,
        image: dbSku.image,
        createdAt: dbSku.created_at,
      }))

      // Add the new SKUs to the beginning of the previous list
      return [...formattedSkus, ...prevSkus]
    })

    // Go to first page to see the new SKU (only if current page is not 1)
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  const handleDeleteSKU = async (skuId) => {
    if (!confirm("Are you sure you want to delete this SKU?")) return

    try {
      setActionInProgress(true)

      // Delete from Supabase using server action
      const result = await deleteSku(skuId)

      if (result.success) {
        // Remove the SKU from the state
        setSkus((prevSkus) => prevSkus.filter((sku) => sku.id !== skuId))

        // Adjust current page if needed
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
      } else {
        setError(`Failed to delete SKU: ${result.error}`)
        console.error("Failed to delete SKU:", result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting the SKU.")
      console.error("SKU deletion error:", err)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchSkus()

      // Log the raw data to see what we're getting
      console.log("Raw SKU data:", data)

      // Ensure size is properly processed
      const processedData = data.map((sku) => ({
        ...sku,
        // Ensure size is a number if it exists
        size: sku.size !== null && sku.size !== undefined ? Number(sku.size) : null,
      }))

      // Sort by createdAt (newest first)
      const sortedData = [...processedData].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA // Descending order (newest first)
      })

      setSkus(sortedData)
    } catch (err) {
      console.error("Failed to refresh SKUs:", err)
      setError("Failed to refresh SKUs. Please try again.")
    } finally {
      setLoading(false)
    }
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
      header: "Name",
      accessor: "name",
    },
    {
      header: "Category",
      accessor: "category",
      render: (sku) => <Badge variant="outline">{sku.category}</Badge>,
    },
    {
      header: "Collection",
      accessor: "collection",
      render: (sku) => <Badge variant="secondary">{sku.collection || "N/A"}</Badge>,
    },
    {
      header: "Size",
      accessor: "size",
      render: (sku) => {
        // Get the unit for this category
        const unit = SIZE_UNITS[sku.category] || ""

        // Display size with unit if available
        if (sku.size !== undefined && sku.size !== null) {
          return (
            <span>
              {sku.size}
              {unit && ` ${unit}`}
            </span>
          )
        }

        return <span className="text-muted-foreground">-</span>
      },
    },
    {
      header: "Gold Type",
      accessor: "goldType",
    },
    {
      header: "Stone Type",
      accessor: "stoneType",
      render: (sku) => <span>{sku.stoneType === STONE_TYPE.NONE ? "-" : sku.stoneType}</span>,
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (sku) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" disabled={actionInProgress}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteSKU(sku.id)} disabled={actionInProgress}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
      className: "text-left",
    },
  ]

  // Group stone types for better organization in the dropdown
  const groupedStoneTypes = Object.values(STONE_TYPE).reduce((acc, stoneType) => {
    // Simple grouping by first letter
    const firstLetter = stoneType.charAt(0).toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(stoneType)
    return acc
  }, {})

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">SKUs</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
              <Select value={collectionFilter} onValueChange={setCollectionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {Object.values(COLLECTION_NAME).map((collection) => (
                    <SelectItem key={collection} value={collection}>
                      {collection}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={goldTypeFilter} onValueChange={setGoldTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Gold Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gold Types</SelectItem>
                  {Object.values(GOLD_TYPE).map((goldType) => (
                    <SelectItem key={goldType} value={goldType}>
                      {goldType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stoneTypeFilter} onValueChange={setStoneTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stone Type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Stone Types</SelectItem>
                  {/* Group stone types alphabetically */}
                  {Object.keys(groupedStoneTypes)
                    .sort()
                    .map((letter) => (
                      <div key={letter}>
                        <div className="px-2 py-1.5 text-xs font-semibold bg-muted/50">{letter}</div>
                        {groupedStoneTypes[letter].map((stoneType) => (
                          <SelectItem key={stoneType} value={stoneType}>
                            {stoneType}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                console.log("New SKU button clicked at", new Date().toISOString())
                setNewSKUSheetOpen(true)
              }}
              disabled={actionInProgress}
            >
              <Plus className="mr-2 h-4 w-4" />
              New SKU
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          caption={`Showing ${currentItems.length} of ${filteredSKUs.length} SKUs`}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowClassName={(row) => (newlyAddedSkuIds.includes(row.id) ? "highlight-new-sku" : "")}
        />
      </main>

      {/* New SKU Sheet */}
      <NewSKUSheet open={newSKUSheetOpen} onOpenChange={setNewSKUSheetOpen} onSKUCreated={handleSKUCreated} />
    </div>
  )
}
