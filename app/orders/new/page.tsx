"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function NewOrderPage() {
  const [selectedSKUs, setSelectedSKUs] = useState([])
  const [dueDate, setDueDate] = useState("")

  // Calculate production date (7 days before due date)
  const calculateProductionDate = (dueDateStr) => {
    if (!dueDateStr) return ""
    const dueDate = new Date(dueDateStr)
    const productionDate = new Date(dueDate)
    productionDate.setDate(dueDate.getDate() - 7)
    return productionDate.toISOString().split("T")[0]
  }

  const productionDate = calculateProductionDate(dueDate)

  // Sample SKUs for selection
  const availableSKUs = [
    {
      id: "N12345",
      name: "Gold Necklace",
      category: "Necklace",
      goldType: "Yellow Gold",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "R45678",
      name: "Diamond Ring",
      category: "Ring",
      goldType: "White Gold",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "E78901",
      name: "Ruby Earrings",
      category: "Earring",
      goldType: "Yellow Gold",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "B23456",
      name: "Gold Bangle",
      category: "Bangle",
      goldType: "Rose Gold",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P34567",
      name: "Emerald Pendant",
      category: "Pendant",
      goldType: "Yellow Gold",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const addSKU = (sku) => {
    // Check if SKU already exists in the selected list
    const existingIndex = selectedSKUs.findIndex((item) => item.id === sku.id)

    if (existingIndex >= 0) {
      // If exists, update quantity
      const updatedSKUs = [...selectedSKUs]
      updatedSKUs[existingIndex].quantity += 1
      setSelectedSKUs(updatedSKUs)
    } else {
      // If new, add with quantity 1
      setSelectedSKUs([...selectedSKUs, { ...sku, quantity: 1 }])
    }
  }

  const removeSKU = (skuId) => {
    setSelectedSKUs(selectedSKUs.filter((sku) => sku.id !== skuId))
  }

  const updateQuantity = (skuId, quantity) => {
    const updatedSKUs = selectedSKUs.map((sku) => {
      if (sku.id === skuId) {
        return { ...sku, quantity: Number.parseInt(quantity) || 1 }
      }
      return sku
    })
    setSelectedSKUs(updatedSKUs)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Order submitted:", {
      skus: selectedSKUs,
      dueDate,
      productionDate,
    })
    // Redirect to orders page after submission
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Create New Order</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input id="orderNumber" value={`O${Math.floor(10000 + Math.random() * 90000)}`} disabled />
                    <p className="text-xs text-muted-foreground">Auto-generated order number</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productionDate">Production Date</Label>
                    <Input id="productionDate" type="date" value={productionDate} disabled />
                    <p className="text-xs text-muted-foreground">Automatically set to 7 days before due date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Selected SKUs</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add SKU
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Select SKU</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search SKUs..." className="pl-8" />
                      </div>
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[60px]">Image</TableHead>
                              <TableHead>SKU ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Gold Type</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableSKUs.map((sku) => (
                              <TableRow key={sku.id}>
                                <TableCell>
                                  <img
                                    src={sku.image || "/placeholder.svg"}
                                    alt={sku.name}
                                    className="w-8 h-8 rounded-md object-cover"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{sku.id}</TableCell>
                                <TableCell>{sku.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{sku.category}</Badge>
                                </TableCell>
                                <TableCell>{sku.goldType}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => addSKU(sku)}>
                                    <Plus className="h-4 w-4" />
                                    <span className="sr-only">Add</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {selectedSKUs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <p>No SKUs selected yet</p>
                    <p className="text-sm">Click "Add SKU" to select items for this order</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">Image</TableHead>
                          <TableHead>SKU ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSKUs.map((sku) => (
                          <TableRow key={sku.id}>
                            <TableCell>
                              <img
                                src={sku.image || "/placeholder.svg"}
                                alt={sku.name}
                                className="w-8 h-8 rounded-md object-cover"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{sku.id}</TableCell>
                            <TableCell>{sku.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{sku.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                className="w-16"
                                value={sku.quantity}
                                onChange={(e) => updateQuantity(sku.id, e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => removeSKU(sku.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" asChild>
                  <Link href="/orders">Cancel</Link>
                </Button>
                <Button type="submit" disabled={selectedSKUs.length === 0 || !dueDate}>
                  Create Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </main>
    </div>
  )
}
