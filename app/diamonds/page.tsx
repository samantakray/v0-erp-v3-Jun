"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DIAMOND_LOTS } from "@/mocks/diamonds"
import { DataTable, type Column } from "@/app/components/DataTable"

// Define a type for our diamond data
type DiamondLot = {
  id: string
  lotNumber: string
  diamondType: string
  clarity: string
  color: string
  cut: string
  totalQuantity: number
  totalWeight: number
  availableQuantity: number
  pricePerCarat: number
  supplier: string
  receivedDate: string
  lastUpdated?: string
}

export default function DiamondsPage() {
  const [diamondData, setDiamondData] = useState<DiamondLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    // Simulate API fetch with mock data
    const loadDiamonds = () => {
      try {
        setLoading(true)
        // Use the imported diamond lots from mocks/diamonds.ts
        const diamonds = DIAMOND_LOTS.map((diamond) => ({
          ...diamond,
          lastUpdated: new Date().toISOString(), // Adding a mock last updated timestamp
        }))
        setDiamondData(diamonds)
      } catch (err) {
        console.error("Failed to fetch Diamonds:", err)
        setError("Failed to load Diamonds. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadDiamonds()
  }, [])

  // Filter diamonds based on search query and filters
  const filteredDiamonds = diamondData.filter((diamond) => {
    // Search query filter
    if (
      searchQuery &&
      !diamond.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !diamond.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Type filter
    if (typeFilter !== "all" && diamond.diamondType !== typeFilter) {
      return false
    }

    return true
  })

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredDiamonds.length / itemsPerPage))
  const paginatedDiamonds = filteredDiamonds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API fetch with mock data
    setTimeout(() => {
      const diamonds = DIAMOND_LOTS.map((diamond) => ({
        ...diamond,
        lastUpdated: new Date().toISOString(),
      }))
      setDiamondData(diamonds)
      setLoading(false)
    }, 500)
  }

  // Define columns for DataTable
  const columns: Column<DiamondLot>[] = [
    {
      header: "Lot No",
      accessor: "lotNumber",
      render: (diamond) => <span className="font-medium">{diamond.lotNumber}</span>,
    },
    {
      header: "Type",
      accessor: "diamondType",
    },
    {
      header: "Clarity",
      accessor: "clarity",
    },
    {
      header: "Color",
      accessor: "color",
    },
    {
      header: "Cut",
      accessor: "cut",
    },
    {
      header: "Total Quantity",
      accessor: "totalQuantity",
    },
    {
      header: "Total Weight",
      accessor: "totalWeight",
      render: (diamond) => `${diamond.totalWeight} ct`,
    },
    {
      header: "Available Quantity",
      accessor: "availableQuantity",
    },
    {
      header: "Price per Carat",
      accessor: "pricePerCarat",
      render: (diamond) => `$${diamond.pricePerCarat}`,
    },
    {
      header: "Supplier",
      accessor: "supplier",
    },
    {
      header: "Last Updated",
      accessor: "lastUpdated",
      render: (diamond) => new Date(diamond.receivedDate).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: () => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">Diamond Management</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search diamonds..."
                className="w-[300px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="B12">B12</SelectItem>
                <SelectItem value="B6">B6</SelectItem>
                <SelectItem value="A">A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/diamonds/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Diamond Lot
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Diamond Inventory</h2>
        </div>

        <DataTable
          columns={columns}
          data={paginatedDiamonds}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  )
}
