// diamonds/page.tsx
"use client"

import { useState, useEffect } from "react"
import { fetchAllDiamondLots } from "@/lib/api-service"
import type { DiamondLotData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Filter, XCircleIcon } from "lucide-react"
import { NewDiamondLotSheet } from "@/components/new-diamond-lot-sheet"

export default function DiamondsPage() {
 const [diamondLots, setDiamondLots] = useState<DiamondLotData[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [isSheetOpen, setIsSheetOpen] = useState(false)

 useEffect(() => {
 const loadDiamondLots = async () => {
 try {
 setLoading(true)
 const data = await fetchAllDiamondLots()
 setDiamondLots(data)
 } catch (err) {
 setError("Failed to load diamond lots. Please try again later.")
 console.error("Error fetching diamond lots:", err)
 } finally {
 setLoading(false)
 }
 }
 loadDiamondLots()
 }, [])

 if (loading) {
 return (
 <div className="flex justify-center items-center h-64">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
 <div className="flex">
 <div className="flex-shrink-0">
 <XCircleIcon className="h-5 w-5 text-red-500" />
 </div>
 <div className="ml-3">
 <p className="text-sm text-red-700">{error}</p>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="flex flex-col">
 <NewDiamondLotSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
 <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
 <h1 className="text-lg font-semibold">Diamond Lots</h1>
 </header>
 <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search diamond lots..."
 className="w-[300px] pl-8"
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
 {diamondLots.length === 0 && !loading ? (
 <div className="text-center py-12">
 <p className="text-gray-500">No diamond lots found.</p>
 </div>
 ) : (
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Lot Number</TableHead>
 <TableHead>Stone Group</TableHead>
 <TableHead>Shape</TableHead>
 <TableHead>Size</TableHead>
 <TableHead>Quality</TableHead>
 <TableHead>Diamond Type</TableHead>
 <TableHead>Quantity</TableHead>
 <TableHead>Weight</TableHead>
 <TableHead>Price</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {diamondLots.map((lot) => (
 <TableRow key={lot.id}>
 <TableCell className="font-medium">{lot.lot_number || 'N/A'}</TableCell>
 <TableCell>{lot.stonegroup || 'N/A'}</TableCell>
 <TableCell>{lot.shape || 'N/A'}</TableCell>
 <TableCell>{lot.size || 'N/A'}</TableCell>
 <TableCell>{lot.quality || 'N/A'}</TableCell>
 <TableCell>{lot.a_type || 'N/A'}</TableCell>
 <TableCell>{lot.quantity || '0'}</TableCell>
 <TableCell>{lot.weight || '0'}</TableCell>
 <TableCell>{lot.price ? `$${lot.price}` : 'N/A'}</TableCell>
 <TableCell>
 <Badge variant={lot.status === 'Available' ? 'default' : 'secondary'}>
 {lot.status || 'N/A'}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <Edit className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <Trash2 className="h-4 w-4" />
 </Button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </main>
 </div>
 )
}