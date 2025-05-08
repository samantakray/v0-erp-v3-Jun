"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from "lucide-react"
import {
  SKU_CATEGORY,
  COLLECTION_NAME,
  GOLD_TYPE,
  STONE_TYPE,
  DEFAULT_SIZES,
  MIN_SIZES,
  MAX_SIZES,
  SIZE_DENOMINATIONS,
  SIZE_UNITS,
} from "@/constants/categories"

export function NewSKUSheet({ open, onOpenChange, onSKUCreated = () => {} }) {
  const [createMultiple, setCreateMultiple] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [multipleSkus, setMultipleSkus] = useState([])

  // Initialize the SKU variants when the sheet is opened
  useEffect(() => {
    if (open) {
      setCreateMultiple(true)
      setShowPreview(false)
      setMultipleSkus([
        {
          category: "Necklace",
          collection: COLLECTION_NAME.FLORAL, // Default collection
          size: DEFAULT_SIZES["Necklace"] ?? 0, // Add fallback for missing default size
          goldType: GOLD_TYPE.YELLOW_GOLD, // Use constant
          stoneType: STONE_TYPE.NONE, // Use constant
          diamondType: "",
          weight: "",
          image: null,
        },
      ])
    }
  }, [open])

  const handleImageChange = (e, index = null) => {
    if (e.target.files && e.target.files[0]) {
      if (index !== null) {
        // For variant image
        const newSkus = [...multipleSkus]
        newSkus[index].image = e.target.files[0]
        setMultipleSkus(newSkus)
      }
    }
  }

  const handleCreateSKU = () => {
    if (!createMultiple) {
      // For single SKU creation
      const firstSku = multipleSkus[0]
      const newSKU = {
        name: `${firstSku.goldType} ${firstSku.category}${firstSku.stoneType !== STONE_TYPE.NONE ? ` with ${firstSku.stoneType}` : ""}`,
        category: firstSku.category,
        collection: firstSku.collection,
        size: Number(firstSku.size), // Convert to number
        goldType: firstSku.goldType,
        stoneType: firstSku.stoneType,
        diamondType: firstSku.diamondType,
        weight: firstSku.weight,
        image: firstSku.image ? URL.createObjectURL(firstSku.image) : "/placeholder.svg?height=80&width=80",
      }

      onSKUCreated(newSKU)
      onOpenChange(false)
    } else {
      // For multiple SKU creation, show preview first
      setShowPreview(true)
    }
  }

  const handleConfirmMultiple = () => {
    // Create all SKUs
    if (createMultiple && multipleSkus.length > 0) {
      multipleSkus.forEach((sku) => {
        const newSKU = {
          name: `${sku.goldType} ${sku.category}${sku.stoneType !== STONE_TYPE.NONE ? ` with ${sku.stoneType}` : ""}`,
          category: sku.category,
          collection: sku.collection,
          size: Number(sku.size), // Convert to number
          goldType: sku.goldType,
          stoneType: sku.stoneType,
          diamondType: sku.diamondType,
          weight: sku.weight,
          image: sku.image ? URL.createObjectURL(sku.image) : "/placeholder.svg?height=80&width=80",
        }

        onSKUCreated(newSKU)
      })
    } else {
      const firstSku = multipleSkus[0]
      const newSKU = {
        name: `${firstSku.goldType} ${firstSku.category}${firstSku.stoneType !== STONE_TYPE.NONE ? ` with ${firstSku.stoneType}` : ""}`,
        category: firstSku.category,
        collection: firstSku.collection,
        size: Number(firstSku.size), // Convert to number
        goldType: firstSku.goldType,
        stoneType: firstSku.stoneType,
        diamondType: firstSku.diamondType,
        weight: firstSku.weight,
        image: firstSku.image ? URL.createObjectURL(firstSku.image) : "/placeholder.svg?height=80&width=80",
      }

      onSKUCreated(newSKU)
    }

    onOpenChange(false)
  }

  // Helper function to get size constraints for a category
  const getSizeConstraints = (category) => {
    return {
      min: MIN_SIZES[category] ?? undefined,
      max: MAX_SIZES[category] ?? undefined,
      step: SIZE_DENOMINATIONS[category] ?? 1,
      unit: SIZE_UNITS[category] ?? "",
    }
  }

  // Group stone types for better organization in the dropdown
  const groupedStoneTypes = Object.values(STONE_TYPE).reduce((acc, stoneType) => {
    // Simple grouping by first letter
    const firstLetter = stoneType.charAt(0).toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(stoneType)
    return acc
  }, {})

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Increased width for the sheet content */}
      <SheetContent className="sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New SKU</SheetTitle>
          <SheetDescription>Add a new SKU to your inventory</SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {!showPreview ? (
            <div className="space-y-4">
              <Alert className="bg-blue-50">
                <AlertTitle>SKU ID Generation</AlertTitle>
                <AlertDescription>
                  SKU IDs will be automatically generated by the system when the SKU is created based on the category.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createMultiple"
                    checked={createMultiple}
                    onCheckedChange={(checked) => setCreateMultiple(checked === true)}
                  />
                  <Label htmlFor="createMultiple">Create multiple SKU categories</Label>
                </div>
              </div>

              <div className="space-y-4">
                {multipleSkus.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">No.</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Collection</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Gold Type</TableHead>
                          <TableHead>Stone Type</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {multipleSkus.map((sku, index) => {
                          const { min, max, step, unit } = getSizeConstraints(sku.category)
                          const hasSizeConstraints = min !== undefined && max !== undefined

                          return (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Select
                                  value={sku.category}
                                  onValueChange={(value) => {
                                    const newSkus = [...multipleSkus]
                                    newSkus[index].category = value
                                    newSkus[index].size = DEFAULT_SIZES[value] ?? 0 // Add fallback
                                    setMultipleSkus(newSkus)
                                  }}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(SKU_CATEGORY).map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={sku.collection}
                                  onValueChange={(value) => {
                                    const newSkus = [...multipleSkus]
                                    newSkus[index].collection = value
                                    setMultipleSkus(newSkus)
                                  }}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Collection" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(COLLECTION_NAME).map((collection) => (
                                      <SelectItem key={collection} value={collection}>
                                        {collection}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Input
                                    type="number"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={sku.size}
                                    onChange={(e) => {
                                      const newSkus = [...multipleSkus]
                                      newSkus[index].size = e.target.value
                                      setMultipleSkus(newSkus)
                                    }}
                                    className="w-[80px]"
                                    disabled={!hasSizeConstraints}
                                  />
                                  {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={sku.goldType}
                                  onValueChange={(value) => {
                                    const newSkus = [...multipleSkus]
                                    newSkus[index].goldType = value
                                    setMultipleSkus(newSkus)
                                  }}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Gold Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(GOLD_TYPE).map((goldType) => (
                                      <SelectItem key={goldType} value={goldType}>
                                        {goldType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={sku.stoneType}
                                  onValueChange={(value) => {
                                    const newSkus = [...multipleSkus]
                                    newSkus[index].stoneType = value
                                    setMultipleSkus(newSkus)
                                  }}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Stone Type" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    {/* Group stone types alphabetically */}
                                    {Object.keys(groupedStoneTypes)
                                      .sort()
                                      .map((letter) => (
                                        <div key={letter}>
                                          <div className="px-2 py-1.5 text-xs font-semibold bg-muted/50">{letter}</div>
                                          {groupedStoneTypes[letter].map((stoneType) => (
                                            <SelectItem key={stoneType} value={stoneType}>
                                              {stoneType}
                                            </SelectItem>
                                          ))}
                                        </div>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fileInput = document.createElement("input")
                                      fileInput.type = "file"
                                      fileInput.accept = "image/*"
                                      fileInput.onchange = (e) => handleImageChange(e, index)
                                      fileInput.click()
                                    }}
                                  >
                                    Upload
                                  </Button>
                                  {sku.image && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {typeof sku.image === "object" ? sku.image.name : "Image selected"}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newSkus = [...multipleSkus]
                                    newSkus.splice(index, 1)
                                    setMultipleSkus(newSkus)
                                  }}
                                  disabled={(!createMultiple && index === 0) || multipleSkus.length <= 1}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-md text-muted-foreground">
                    No SKU variants added. Click "Add SKU Variant" to create multiple SKUs.
                  </div>
                )}

                {/* Moved Add SKU Variant button below the table and centered it */}
                <div className="flex justify-center mt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setMultipleSkus([
                        ...multipleSkus,
                        {
                          category: "Necklace",
                          collection: COLLECTION_NAME.FLORAL, // Default collection
                          size: DEFAULT_SIZES["Necklace"] ?? 0, // Add fallback
                          goldType: GOLD_TYPE.YELLOW_GOLD, // Use constant
                          stoneType: STONE_TYPE.NONE, // Use constant
                          diamondType: "",
                          weight: "",
                          image: null,
                        },
                      ])
                    }}
                    disabled={!createMultiple}
                  >
                    Add SKU Variant
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Preview Your SKUs</AlertTitle>
                <AlertDescription>Review the SKUs before creating them</AlertDescription>
              </Alert>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Collection</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Gold Type</TableHead>
                      <TableHead>Stone Type</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multipleSkus.map((sku, index) => {
                      const { unit } = getSizeConstraints(sku.category)
                      return (
                        <TableRow key={index}>
                          <TableCell>{sku.category}</TableCell>
                          <TableCell>{sku.collection}</TableCell>
                          <TableCell>{sku.size ? `${sku.size}${unit ? ` ${unit}` : ""}` : "N/A"}</TableCell>
                          <TableCell>{sku.goldType}</TableCell>
                          <TableCell>{sku.stoneType}</TableCell>
                          <TableCell>
                            {`${sku.goldType} ${sku.category}${sku.stoneType !== STONE_TYPE.NONE ? ` with ${sku.stoneType}` : ""}`}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          {!showPreview ? (
            <Button onClick={handleCreateSKU} disabled={multipleSkus.length === 0} className="w-full">
              {createMultiple ? "Preview SKUs" : "Create SKU"}
            </Button>
          ) : (
            <div className="w-full space-y-4">
              <Button variant="outline" onClick={() => setShowPreview(false)} className="w-full">
                Back to Edit
              </Button>
              <Button onClick={handleConfirmMultiple} className="w-full">
                Confirm & Create SKUs
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
