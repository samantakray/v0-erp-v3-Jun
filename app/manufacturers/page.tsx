"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MANUFACTURERS, type Manufacturer } from "@/mocks/manufacturers"
import { DataTable, type Column } from "@/app/components/DataTable"
import { Badge } from "@/components/ui/badge"

export default function ManufacturersPage() {
  const [manufacturerData, setManufacturerData] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    // Simulate API fetch with mock data
    const loadManufacturers = () => {
      try {
        setLoading(true)
        // Use the imported manufacturers from mocks/manufacturers.ts
        setManufacturerData(MANUFACTURERS)
      } catch (err) {
        console.error("Failed to fetch Manufacturers:", err)
        setError("Failed to load Manufacturers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadManufacturers()
  }, [])

  // Filter manufacturers based on search query and filters
  const filteredManufacturers = manufacturerData.filter((manufacturer) => {
    // Search query filter
    if (
      searchQuery &&
      !manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !manufacturer.contactInfo.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Specialty filter
    if (specialtyFilter !== "all" && !manufacturer.specialties.includes(specialtyFilter)) {
      return false
    }

    return true
  })

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredManufacturers.length / itemsPerPage))
  const paginatedManufacturers = filteredManufacturers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API fetch with mock data
    setTimeout(() => {
      setManufacturerData(MANUFACTURERS)
      setLoading(false)
    }, 500)
  }

  // Get unique specialties for the filter
  const specialties = Array.from(new Set(manufacturerData.flatMap((m) => m.specialties)))

  // Define columns for DataTable
  const columns: Column<Manufacturer>[] = [
    {
      header: "Name",
      accessor: "name",
      render: (manufacturer) => <span className="font-medium">{manufacturer.name}</span>,
    },
    {
      header: "Address",
      accessor: "address",
      render: (manufacturer) => <span className="text-sm text-muted-foreground">{manufacturer.address}</span>,
    },
    {
      header: "Specialties",
      accessor: "specialties",
      render: (manufacturer) => (
        <div className="flex flex-wrap gap-1">
          {manufacturer.specialties.map((specialty, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (manufacturer) => {
        const stars =
          "★".repeat(Math.floor(manufacturer.rating)) +
          (manufacturer.rating % 1 >= 0.5 ? "½" : "") +
          "☆".repeat(5 - Math.ceil(manufacturer.rating))
        return <span className="text-yellow-500">{stars}</span>
      },
    },
    {
      header: "Capacity",
      accessor: "capacity",
      render: (manufacturer) => {
        const colorMap: Record<string, string> = {
          High: "text-green-600",
          Medium: "text-amber-600",
          Low: "text-red-600",
        }
        return <span className={colorMap[manufacturer.capacity] || ""}>{manufacturer.capacity}</span>
      },
    },
    {
      header: "Lead Time",
      accessor: "leadTime",
    },
    {
      header: "Active Jobs",
      accessor: "activeJobs",
      render: (manufacturer) => (
        <Badge variant={manufacturer.activeJobs > 10 ? "destructive" : "default"}>{manufacturer.activeJobs}</Badge>
      ),
    },
    {
      header: "Completed Jobs",
      accessor: "completedJobs",
    },
    {
      header: "Joined Date",
      accessor: "joinedDate",
      render: (manufacturer) => new Date(manufacturer.joinedDate).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (manufacturer) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" title={`Edit ${manufacturer.name}`}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" title={`Delete ${manufacturer.name}`}>
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
        <h1 className="text-lg font-semibold">Manufacturer Management</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search manufacturers..."
                className="w-[300px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/manufacturers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Manufacturer
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Manufacturer Directory</h2>
        </div>

        <DataTable
          columns={columns}
          data={paginatedManufacturers}
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
