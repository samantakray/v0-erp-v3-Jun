"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { NewSKUSheet } from "@/components/new-sku-sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchSkus } from "@/lib/api-service"
import type { SKU } from "@/types"

export default function SKUsPage() {
  const [newSKUSheetOpen, setNewSKUSheetOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [goldTypeFilter, setGoldTypeFilter] = useState("all")
  const [stoneTypeFilter, setStoneTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [skus, setSkus] = useState<SKU[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSkus() {
      try {
        setLoading(true)
        const data = await fetchSkus()
        setSkus(data)
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
  const filteredSKUs = skus.filter((sku) => {
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

  const handleSKUCreated = (newSKU) => {
    // Add the new SKU to the state
    setSkus((prevSkus) => [...prevSkus, newSKU])
  }

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
        <div className="border rounded-lg">
          {loading ? (
            <div className="p-8 text-center">Loading SKUs...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Gold Type</TableHead>
                  <TableHead>Stone Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSKUs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No SKUs found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSKUs.map((sku) => (
                    <TableRow key={sku.id}>
                      <TableCell>
                        <Image
                          src={sku.image || "/placeholder.svg"}
                          alt={sku.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sku.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sku.category}</Badge>
                      </TableCell>
                      <TableCell>{sku.size}</TableCell>
                      <TableCell>{sku.goldType}</TableCell>
                      <TableCell>{sku.stoneType === "None" ? "-" : sku.stoneType}</TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* New SKU Sheet */}
      <NewSKUSheet open={newSKUSheetOpen} onOpenChange={setNewSKUSheetOpen} onSKUCreated={handleSKUCreated} />
    </div>
  )
}
