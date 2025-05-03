import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DiamondsPage() {
  const diamonds = [
    {
      id: "DIA001",
      size: "0.5",
      cut: "Round",
      color: "D",
      clarity: "VVS1",
      quantity: 15,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "DIA002",
      size: "1.0",
      cut: "Princess",
      color: "E",
      clarity: "VS1",
      quantity: 8,
      status: "Sent to manufacturer",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "DIA003",
      size: "0.75",
      cut: "Oval",
      color: "F",
      clarity: "VS2",
      quantity: 12,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "DIA004",
      size: "0.25",
      cut: "Round",
      color: "G",
      clarity: "SI1",
      quantity: 30,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "DIA005",
      size: "2.0",
      cut: "Emerald",
      color: "D",
      clarity: "IF",
      quantity: 3,
      status: "Set",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "DIA006",
      size: "0.5",
      cut: "Cushion",
      color: "E",
      clarity: "VVS2",
      quantity: 18,
      status: "Available for use",
      image: "/placeholder.svg?height=80&width=80",
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
              <Input type="search" placeholder="Search diamonds..." className="w-[300px] pl-8" />
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
          <Link href="/diamonds/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Diamond
            </Button>
          </Link>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Diamond ID</TableHead>
                <TableHead>Size (karat)</TableHead>
                <TableHead>Cut</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Clarity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diamonds.map((diamond) => (
                <TableRow key={diamond.id}>
                  <TableCell>
                    <Image
                      src={diamond.image || "/placeholder.svg"}
                      alt={`Diamond ${diamond.id}`}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{diamond.id}</TableCell>
                  <TableCell>{diamond.size}</TableCell>
                  <TableCell>{diamond.cut}</TableCell>
                  <TableCell>{diamond.color}</TableCell>
                  <TableCell>{diamond.clarity}</TableCell>
                  <TableCell>{diamond.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        diamond.status === "Available for use"
                          ? "outline"
                          : diamond.status === "Sent to manufacturer"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {diamond.status}
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
