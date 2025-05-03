import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StonesPage() {
  const stones = [
    {
      id: "RUB001",
      name: "Ruby",
      type: "Rubies",
      size: "5mm",
      color: "Deep Red",
      clarity: "VS",
      quantity: 25,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "EME002",
      name: "Emerald",
      type: "Emeralds",
      size: "4mm",
      color: "Vivid Green",
      clarity: "VVS",
      quantity: 18,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "SAP003",
      name: "Sapphire",
      type: "Sapphires",
      size: "6mm",
      color: "Royal Blue",
      clarity: "VS",
      quantity: 22,
      status: "Sent to manufacturer",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "RUB004",
      name: "Ruby",
      type: "Rubies",
      size: "3mm",
      color: "Pinkish Red",
      clarity: "SI",
      quantity: 30,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "EME005",
      name: "Emerald",
      type: "Emeralds",
      size: "7mm",
      color: "Deep Green",
      clarity: "VS",
      quantity: 12,
      status: "Set",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "SAP006",
      name: "Sapphire",
      type: "Sapphires",
      size: "4mm",
      color: "Light Blue",
      clarity: "VVS",
      quantity: 28,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
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
              <Input type="search" placeholder="Search stones..." className="w-[300px] pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available for use</SelectItem>
                <SelectItem value="sent">Sent to manufacturer</SelectItem>
                <SelectItem value="set">Set</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/stones/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Stone
            </Button>
          </Link>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Stone ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Clarity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stones.map((stone) => (
                <TableRow key={stone.id}>
                  <TableCell>
                    <Image
                      src={stone.image || "/placeholder.svg"}
                      alt={stone.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{stone.id}</TableCell>
                  <TableCell>{stone.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stone.type}</Badge>
                  </TableCell>
                  <TableCell>{stone.size}</TableCell>
                  <TableCell>{stone.color}</TableCell>
                  <TableCell>{stone.clarity}</TableCell>
                  <TableCell>{stone.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        stone.status === "Available for use"
                          ? "outline"
                          : stone.status === "Sent to manufacturer"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {stone.status}
                    </Badge>
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
