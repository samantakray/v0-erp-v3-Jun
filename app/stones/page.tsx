"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STONE_LOTS } from "@/mocks/stones"
import { DataTable, type Column } from "@/app/components/DataTable"

// Define a type for our stone data
type StoneLot = {
  id: string
  lotNumber: string
  stoneType: string
  color: string
  clarity: string
  totalQuantity: number
  totalWeight: number
  availableQuantity: number
  availableWeight: number
  pricePerCarat: number
  supplier: string
  receivedDate: string
  lastUpdated?: string
}

export default function StonesPage() {
  const [stoneData, setStoneData] = useState<StoneLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    // Simulate API fetch with mock data
    const loadStones = () => {
      try {
        setLoading(true)
        // Use the imported stone lots from mocks/stones.ts
        const stones = STONE_LOTS.map((stone) => ({
          ...stone,
          lastUpdated: new Date().toISOString(), // Adding a mock last updated timestamp
        }))
        setStoneData(stones)
      } catch (err) {
        console.error("Failed to fetch Stones:", err)
        setError("Failed to load Stones. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadStones()
  }, [])

  // Filter stones based on search query and filters
  const filteredStones = stoneData.filter((stone) => {
    // Search query filter
    if (
      searchQuery &&
      !stone.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !stone.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Type filter
    if (typeFilter !== "all" && stone.stoneType !== typeFilter) {
      return false
    }

    return true
  })

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredStones.length / itemsPerPage))
  const paginatedStones = filteredStones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API fetch with mock data
    setTimeout(() => {
      const stones = STONE_LOTS.map((stone) => ({
        ...stone,
        lastUpdated: new Date().toISOString(),
      }))
      setStoneData(stones)
      setLoading(false)
    }, 500)
  }

  // Define columns for DataTable
  const columns: Column<StoneLot>[] = [
    {
      header: "Lot No",
      accessor: "lotNumber",
      render: (stone) => <span className="font-medium">{stone.lotNumber}</span>,
    },
    {
      header: "Type",
      accessor: "stoneType",
    },
    {
      header: "Color",
      accessor: "color",
    },
    {
      header: "Total Quantity",
      accessor: "totalQuantity",
    },
    {
      header: "Total Weight",
      accessor: "totalWeight",
      render: (stone) => `${stone.totalWeight} ct`,
    },
    {
      header: "Available Quantity",
      accessor: "availableQuantity",
    },
    {
      header: "Available Weight",
      accessor: "availableWeight",
      render: (stone) => `${stone.availableWeight} ct`,
    },
    {
      header: "Price per Carat",
      accessor: "pricePerCarat",
      render: (stone) => `$${stone.pricePerCarat}`,
    },
    {
      header: "Supplier",
      accessor: "supplier",
    },
    {
      header: "Last Updated",
      accessor: "lastUpdated",
      render: (stone) => new Date(stone.receivedDate).toLocaleDateString(),
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
        <h1 className="text-lg font-semibold">Stone Management</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stones..."
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
                <SelectItem value="Ruby">Ruby</SelectItem>
                <SelectItem value="Emerald">Emerald</SelectItem>
                <SelectItem value="Sapphire">Sapphire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/stones/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Stone Lot
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Stone Inventory</h2>
        </div>

        <DataTable
          columns={columns}
          data={paginatedStones}
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
