"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Trash2, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { NewSKUSheet } from "./new-sku-sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Sample SKUs for selection with updated prefixes
const initialAvailableSKUs = [
  {
    id: "NK12345YGNO",
    name: "Gold Necklace",
    category: "Necklace",
    goldType: "Yellow Gold",
    stoneType: "None",
    size: "18",
    image: "/placeholder.svg?height=40&width=40&text=Necklace",
  },
  {
    id: "RG45678WGNO",
    name: "Diamond Ring",
    category: "Ring",
    goldType: "White Gold",
    stoneType: "None",
    size: "7",
    image: "/placeholder.svg?height=40&width=40&text=Ring",
  },
  {
    id: "ER78901YGRB",
    name: "Ruby Earrings",
    category: "Earring",
    goldType: "Yellow Gold",
    stoneType: "Ruby",
    size: "10",
    image: "/placeholder.svg?height=40&width=40&text=Earring",
  },
  {
    id: "BG23456RGNO",
    name: "Gold Bangle",
    category: "Bangle",
    goldType: "Rose Gold",
    stoneType: "None",
    size: "65",
    image: "/placeholder.svg?height=40&width=40&text=Bangle",
  },
  {
    id: "PN34567YGEM",
    name: "Emerald Pendant",
    category: "Pendant",
    goldType: "Yellow Gold",
    stoneType: "Emerald",
    size: "15",
    image: "/placeholder.svg?height=40&width=40&text=Pendant",
  },
]

// Sample enterprise customers
const enterpriseCustomers = [
  "Luxury Boutique Inc.",
  "Diamond Emporium",
  "Royal Jewelers",
  "Elite Collections",
  "Prestige Gems",
]

// Add sample image data
const sampleImages = {
  NK12345YGEM: "/placeholder.svg?height=100&width=100",
  ER67890WGRB: "/placeholder.svg?height=100&width=100",
  BG54321RGSP: "/placeholder.svg?height=100&width=100",
  PN98765YGNO: "/placeholder.svg?height=100&width=100",
  RG13579WGEM: "/placeholder.svg?height=100&width=100",
}

export function NewOrderSheet({ open, onOpenChange, editOrder = null, onOrderCreated = () => {} }) {
  const [orderNumber] = useState(editOrder?.id || `O${Math.floor(10000 + Math.random() * 90000)}`)
  const [orderType, setOrderType] = useState(editOrder?.orderType || "Stock")
  const [customerName, setCustomerName] = useState(editOrder?.customerName || "Exquisite Fine Jewellery")
  const [selectedSKUs, setSelectedSKUs] = useState(editOrder?.skus || [])
  const [productionDueDate, setProductionDueDate] = useState(editOrder?.productionDate || "")
  const [deliveryDate, setDeliveryDate] = useState(editOrder?.deliveryDate || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateWarning, setDateWarning] = useState(false)
  const [newSKUSheetOpen, setNewSKUSheetOpen] = useState(false)
  const [availableSKUs, setAvailableSKUs] = useState(initialAvailableSKUs)
  const [remarks, setRemarks] = useState(editOrder?.remarks || "")
  const [sameDatesForAll, setSameDatesForAll] = useState({
    production: true,
    delivery: true,
  })
  const [isDraft, setIsDraft] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [goldTypeFilter, setGoldTypeFilter] = useState("all")
  const [stoneTypeFilter, setStoneTypeFilter] = useState("all")
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Filter SKUs based on search query and filters
  const filteredSKUs = availableSKUs.filter((sku) => {
    // Search query filter
    if (
      searchQuery &&
      !sku.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sku.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Category filter
    if (categoryFilter !== "all") {
      const prefix =
        categoryFilter === "Necklace"
          ? "NK"
          : categoryFilter === "Ring"
            ? "RG"
            : categoryFilter === "Earring"
              ? "ER"
              : categoryFilter === "Bangle"
                ? "BG"
                : categoryFilter === "Pendant"
                  ? "PN"
                  : ""
      if (!sku.id.startsWith(prefix)) return false
    }

    // Gold type filter
    if (goldTypeFilter !== "all") {
      const goldCode =
        goldTypeFilter === "Yellow Gold"
          ? "YG"
          : goldTypeFilter === "White Gold"
            ? "WG"
            : goldTypeFilter === "Rose Gold"
              ? "RG"
              : ""
      if (!sku.id.includes(goldCode)) return false
    }

    // Stone type filter
    if (stoneTypeFilter !== "all") {
      const stoneCode =
        stoneTypeFilter === "None"
          ? "NO"
          : stoneTypeFilter === "Emerald"
            ? "EM"
            : stoneTypeFilter === "Ruby"
              ? "RB"
              : stoneTypeFilter === "Sapphire"
                ? "SP"
                : ""
      if (!sku.id.endsWith(stoneCode)) return false
    }

    return true
  })

  // Calculate minimum delivery date (7 days after production due date)
  useEffect(() => {
    if (productionDueDate) {
      const prodDate = new Date(productionDueDate)
      const minDeliveryDate = new Date(prodDate)
      minDeliveryDate.setDate(prodDate.getDate() + 7)

      // Format as YYYY-MM-DD for the input
      const formattedDate = minDeliveryDate.toISOString().split("T")[0]

      // Only set delivery date automatically if it hasn't been set yet
      if (!deliveryDate) {
        setDeliveryDate(formattedDate)
      } else {
        // Check if current delivery date is before minimum
        const currentDeliveryDate = new Date(deliveryDate)
        setDateWarning(currentDeliveryDate < minDeliveryDate)
      }
    }
  }, [productionDueDate, deliveryDate])

  // Handle order type change
  useEffect(() => {
    if (orderType === "Stock") {
      setCustomerName("Exquisite Fine Jewellery")
    } else if (!editOrder) {
      setCustomerName("")
    }
  }, [orderType, editOrder])

  // Load edit order data
  useEffect(() => {
    if (editOrder) {
      setOrderType(editOrder.orderType || "Stock")
      setCustomerName(editOrder.customerName || "Exquisite Fine Jewellery")
      setSelectedSKUs(editOrder.skus || [])
      setProductionDueDate(editOrder.productionDate || editOrder.productionDueDate || "")
      setDeliveryDate(editOrder.deliveryDate || "")
      setRemarks(editOrder.remarks || "")
      setIsDraft(editOrder.status === "Draft")
    }
  }, [editOrder])

  // Check delivery date when it changes
  const handleDeliveryDateChange = (date) => {
    setDeliveryDate(date)

    if (productionDueDate) {
      const prodDate = new Date(productionDueDate)
      const minDeliveryDate = new Date(prodDate)
      minDeliveryDate.setDate(prodDate.getDate() + 7)

      const newDeliveryDate = new Date(date)
      setDateWarning(newDeliveryDate < minDeliveryDate)
    }
  }

  const addSKU = (sku) => {
    // Check if SKU already exists in the selected list
    const existingIndex = selectedSKUs.findIndex((item) => item.id === sku.id)

    if (existingIndex >= 0) {
      // If exists, update quantity
      const updatedSKUs = [...selectedSKUs]
      updatedSKUs[existingIndex].quantity += 1
      setSelectedSKUs(updatedSKUs)
    } else {
      // If new, add with quantity 1 and individual dates if needed
      const newSku = {
        ...sku,
        quantity: 1,
        size: sku.size,
        remarks: "",
        individualProductionDate: productionDueDate,
        individualDeliveryDate: deliveryDate,
      }
      setSelectedSKUs([...selectedSKUs, newSku])
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

  const updateSize = (skuId, size) => {
    const updatedSKUs = selectedSKUs.map((sku) => {
      if (sku.id === skuId) {
        return { ...sku, size: size }
      }
      return sku
    })
    setSelectedSKUs(updatedSKUs)
  }

  const updateRemarks = (skuId, value) => {
    const updatedSKUs = selectedSKUs.map((sku) => {
      if (sku.id === skuId) {
        return { ...sku, remarks: value.slice(0, 100) }
      }
      return sku
    })
    setSelectedSKUs(updatedSKUs)
  }

  const updateIndividualDate = (skuId, field, value) => {
    const updatedSKUs = selectedSKUs.map((sku) => {
      if (sku.id === skuId) {
        return { ...sku, [field]: value }
      }
      return sku
    })
    setSelectedSKUs(updatedSKUs)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Create order object
    const order = {
      id: orderNumber,
      orderType,
      customerName,
      skus: selectedSKUs,
      productionDate: productionDueDate,
      dueDate: deliveryDate,
      status: isDraft ? "Draft" : "New",
      action: isDraft ? "Complete order" : "Stone selection",
      remarks,
      createdAt: new Date().toISOString(),
    }

    // Call the onOrderCreated callback
    onOrderCreated(order)

    // Reset form and close sheet
    if (!isDraft) {
      setSelectedSKUs([])
      setProductionDueDate("")
      setDeliveryDate("")
      setOrderType("Stock")
      setCustomerName("Exquisite Fine Jewellery")
      setRemarks("")
      setSameDatesForAll({ production: true, delivery: true })
    }

    onOpenChange(false)
  }

  const handleNewSKUCreated = (newSKU) => {
    // Add the new SKU to available SKUs
    setAvailableSKUs([...availableSKUs, newSKU])

    // Optionally, add the new SKU directly to the selected SKUs
    setSelectedSKUs([
      ...selectedSKUs,
      {
        ...newSKU,
        quantity: 1,
        size: newSKU.size,
        remarks: "",
        individualProductionDate: productionDueDate,
        individualDeliveryDate: deliveryDate,
      },
    ])
  }

  const openImageDialog = (image) => {
    setSelectedImage(image)
    setImageDialogOpen(true)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        {/* Width of new order form */}
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editOrder ? "Edit Order" : "Create New Order"}</SheetTitle>
            <SheetDescription>{editOrder ? "Update order details" : "Add a new order to the system"}</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input id="orderNumber" value={orderNumber} disabled />
                  <p className="text-xs text-muted-foreground">Auto-generated</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType} required>
                    <SelectTrigger id="orderType">
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stock">Stock</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  {orderType === "Stock" ? (
                    <Input id="customerName" value={customerName} disabled />
                  ) : (
                    <Select value={customerName} onValueChange={setCustomerName} required>
                      <SelectTrigger id="customerName">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {enterpriseCustomers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productionDueDate">Production Due Date</Label>
                  <Input
                    id="productionDueDate"
                    type="date"
                    value={productionDueDate}
                    onChange={(e) => setProductionDueDate(e.target.value)}
                    required={!isDraft}
                  />
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox
                      id="sameProdDate"
                      checked={sameDatesForAll.production}
                      onCheckedChange={(checked) => setSameDatesForAll({ ...sameDatesForAll, production: checked })}
                    />
                    <label htmlFor="sameProdDate" className="text-xs text-muted-foreground cursor-pointer">
                      Same production date for all SKUs
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => handleDeliveryDateChange(e.target.value)}
                    required={!isDraft}
                  />
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox
                      id="sameDeliveryDate"
                      checked={sameDatesForAll.delivery}
                      onCheckedChange={(checked) => setSameDatesForAll({ ...sameDatesForAll, delivery: checked })}
                    />
                    <label htmlFor="sameDeliveryDate" className="text-xs text-muted-foreground cursor-pointer">
                      Same delivery date for all SKUs
                    </label>
                  </div>
                </div>
              </div>

              {dateWarning && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Delivery date should be at least 7 days after production due date</AlertDescription>
                </Alert>
              )}

              {/* Selected SKUs Table - Now above the SKUs Database List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selected SKUs</Label>
                </div>

                {selectedSKUs.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg">No SKUs selected yet</div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>SKU ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Quantity</TableHead>
                          {!sameDatesForAll.production && <TableHead>Production Due Date</TableHead>}
                          {!sameDatesForAll.delivery && <TableHead>Delivery Date</TableHead>}
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Remove</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSKUs.map((sku) => (
                          <TableRow key={sku.id}>
                            <TableCell>
                              <div
                                className="w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                                onClick={() => openImageDialog(sku.image)}
                              >
                                <img
                                  src={sku.image || "/placeholder.svg"}
                                  alt={sku.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{sku.id}</TableCell>
                            <TableCell>{sku.name}</TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                className="w-16"
                                value={sku.size}
                                onChange={(e) => updateSize(sku.id, e.target.value)}
                                disabled={sku.category === "Earring"}
                              />
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
                            {!sameDatesForAll.production && (
                              <TableCell>
                                <Input
                                  type="date"
                                  value={sku.individualProductionDate}
                                  onChange={(e) =>
                                    updateIndividualDate(sku.id, "individualProductionDate", e.target.value)
                                  }
                                />
                              </TableCell>
                            )}
                            {!sameDatesForAll.delivery && (
                              <TableCell>
                                <Input
                                  type="date"
                                  value={sku.individualDeliveryDate}
                                  onChange={(e) =>
                                    updateIndividualDate(sku.id, "individualDeliveryDate", e.target.value)
                                  }
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <Input
                                type="text"
                                className="w-full"
                                value={sku.remarks || ""}
                                onChange={(e) => updateRemarks(sku.id, e.target.value)}
                                placeholder="Add remarks"
                                maxLength={100}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeSKU(sku.id)}>
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
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>SKUs Database List</Label>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search SKUs..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[120px]">
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
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Gold Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gold</SelectItem>
                      <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                      <SelectItem value="White Gold">White Gold</SelectItem>
                      <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={stoneTypeFilter} onValueChange={setStoneTypeFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Stone Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stones</SelectItem>
                      <SelectItem value="None">No Stone</SelectItem>
                      <SelectItem value="Emerald">Emerald</SelectItem>
                      <SelectItem value="Ruby">Ruby</SelectItem>
                      <SelectItem value="Sapphire">Sapphire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Image</TableHead>
                        <TableHead>SKU ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Add</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSKUs.map((sku) => (
                        <TableRow key={sku.id}>
                          <TableCell>
                            <div
                              className="w-8 h-8 rounded-md overflow-hidden cursor-pointer"
                              onClick={() => openImageDialog(sku.image)}
                            >
                              <img
                                src={sku.image || "/placeholder.svg"}
                                alt={sku.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{sku.id}</TableCell>
                          <TableCell>{sku.name}</TableCell>
                          <TableCell>{sku.size}</TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="ghost" size="sm" onClick={() => addSKU(sku)}>
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Add</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredSKUs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No SKUs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Separator className="w-16" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="w-16" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button type="button" variant="outline" onClick={() => setNewSKUSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create a new SKU
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="remarks">Reference notes</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter any additional notes or remarks about this order..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value.slice(0, 500))}
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <div className="text-xs text-right text-muted-foreground">{remarks.length}/500 characters</div>
                </div>
              </div>
            </div>

            <SheetFooter className="flex flex-col space-y-4 mt-6">
              <Button
                type="submit"
                disabled={selectedSKUs.length === 0 || (!isDraft && (!productionDueDate || !deliveryDate))}
                className="w-full"
              >
                {editOrder ? "Update Order" : "Create Order"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDraft(true)
                  handleSubmit({ preventDefault: () => {} })
                }}
                className="w-full"
              >
                Save as Draft
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* New SKU Sheet */}
      <NewSKUSheet open={newSKUSheetOpen} onOpenChange={setNewSKUSheetOpen} onSKUCreated={handleNewSKUCreated} />

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SKU Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {selectedImage && (
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="SKU"
                className="max-w-full max-h-[500px] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
