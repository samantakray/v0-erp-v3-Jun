"use client"
import { useState, useEffect, useMemo } from "react"
import { fetchAllStoneLots } from "@/lib/api-service"
import type { StoneLotData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter, AlertCircle } from "lucide-react"
import { NewStoneLotSheet } from "@/components/new-stone-lot-sheet"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StonesPage() {
  const [stoneLots, setStoneLots] = useState<StoneLotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadStoneLots = async () => {
    try {
      setLoading(true)
      const data = await fetchAllStoneLots()
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      setStoneLots(sortedData)
    } catch (err) {
      setError("Failed to load stone lots. Please try again later.")
      console.error("Error fetching stone lots:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStoneLots()
  }, [])

  const filteredStoneLots = useMemo(() => {
    return stoneLots.filter((lot) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        lot.lot_number?.toLowerCase().includes(query) ||
        lot.stone_type?.toLowerCase().includes(query)
      )
    })
  }, [stoneLots, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredStoneLots.length / itemsPerPage))

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredStoneLots.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredStoneLots, currentPage, itemsPerPage])

  const handleRefresh = () => {
    loadStoneLots()
  }

  const handleStoneLotCreated = (newLot: StoneLotData) => {
    setStoneLots((prevLots) => [newLot, ...prevLots])
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  const columns: Column<StoneLotData>[] = [
    {
      header: "Lot #",
      accessor: "lot_number",
      render: (lot) => <span className="font-medium">{lot.lot_number}</span>,
    },
    {
      header: "Stone Type",
      accessor: "stone_type",
    },
    {
      header: "Shape",
      accessor: "shape",
    },
    {
      header: "Size",
      accessor: "stone_size",
    },
    {
      header: "Quality",
      accessor: "quality",
    },
    {
      header: "Stone Cut",
      accessor: "type",
    },
    {
      header: "Quantity",
      accessor: "quantity",
    },
    {
      header: "Weight",
      accessor: "weight",
    },
    {
      header: "Status",
      accessor: "status",
      render: (lot) => (
        <Badge variant={lot.status === "Available" ? "default" : "secondary"}>
          {lot.status}
        </Badge>
      ),
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
      className: "text-left",
    },
  ]

  return (
    <div className="flex flex-col">
      <NewStoneLotSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onStoneLotCreated={handleStoneLotCreated}
      />
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">Stone Lots</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stone lots..."
                className="w-[300px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stone Lot
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          caption={`Showing ${currentItems.length} of ${filteredStoneLots.length} Stone Lots`}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  )
}

