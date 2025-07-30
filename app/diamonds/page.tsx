// diamonds/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchAllDiamondLots } from "@/lib/api-service"
import type { DiamondLotData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter, AlertCircle } from "lucide-react"
import { NewDiamondLotSheet } from "@/components/new-diamond-lot-sheet"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DiamondsPage() {
  const [diamondLots, setDiamondLots] = useState<DiamondLotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadDiamondLots = async () => {
    try {
      setLoading(true)
      const data = await fetchAllDiamondLots()
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      setDiamondLots(sortedData)
    } catch (err) {
      setError("Failed to load diamond lots. Please try again later.")
      console.error("Error fetching diamond lots:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiamondLots()
  }, [])

  const handleRefresh = () => {
    loadDiamondLots()
  }

  const handleDiamondLotCreated = (newLot: DiamondLotData) => {
    setDiamondLots((prevLots) => [newLot, ...prevLots])
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  const filteredDiamondLots = useMemo(() => {
    return diamondLots.filter((lot) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        lot.lot_number?.toLowerCase().includes(query) ||
        lot.size?.toLowerCase().includes(query)
      )
    })
  }, [diamondLots, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredDiamondLots.length / itemsPerPage))

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredDiamondLots.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredDiamondLots, currentPage, itemsPerPage])

  const columns: Column<DiamondLotData>[] = [
    {
      header: "Lot #",
      accessor: "lot_number",
      render: (lot) => <span className="font-medium">{lot.lot_number || 'N/A'}</span>,
    },
    {
      header: "Size",
      accessor: "size",
      render: (lot) => <span>{lot.size || 'N/A'}</span>,
    },
    {
      header: "Shape",
      accessor: "shape",
      render: (lot) => <span>{lot.shape || 'N/A'}</span>,
    },
    {
      header: "Quality",
      accessor: "quality",
      render: (lot) => <span>{lot.quality || 'N/A'}</span>,
    },
    {
      header: "Type",
      accessor: "a_type",
      render: (lot) => <span>{lot.a_type || 'N/A'}</span>,
    },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (lot) => <span>{lot.quantity || '0'}</span>,
    },
    {
      header: "Weight",
      accessor: "weight",
      render: (lot) => <span>{lot.weight || '0'}</span>,
    },
    {
      header: "Price",
      accessor: "price",
      render: (lot) => <span>{lot.price ? `${lot.price}` : 'N/A'}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (lot) => (
        <Badge variant={lot.status === "Available" ? "default" : "secondary"}>
          {lot.status || 'N/A'}
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
      className: "text-right",
    },
  ]

  return (
    <div className="flex flex-col">
      <NewDiamondLotSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onDiamondLotCreated={handleDiamondLotCreated}
      />
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">Diamond Lots</h1>
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
                placeholder="Search diamond lots..."
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
            Add Diamond Lot
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          caption={`Showing ${currentItems.length} of ${filteredDiamondLots.length} Diamond Lots`}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  )
}