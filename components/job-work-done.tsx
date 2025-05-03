"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Printer, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { JOB_STATUS } from "@/constants/job-workflow"
import { STONE_LOTS } from "@/mocks/stones"
import { DIAMOND_LOTS } from "@/mocks/diamonds"
import { MANUFACTURERS } from "@/mocks/manufacturers"

interface JobWorkDoneProps {
  status: string
  onComplete: (data: any) => void
}

interface LotAllocation {
  lotNumber: string
  quantity: string
  weight: string
}

interface ManufacturerSelection {
  manufacturerId: string
  expectedCompletionDate: string
  specialInstructions: string
}

export function JobWorkDone({ status, onComplete }: JobWorkDoneProps) {
  // State for different job statuses
  const [bagCreated, setBagCreated] = useState<string | null>(null)
  const [printStickerDialogOpen, setPrintStickerDialogOpen] = useState(false)
  const [allocations, setAllocations] = useState<LotAllocation[]>([{ lotNumber: "", quantity: "", weight: "" }])
  const [manufacturerData, setManufacturerData] = useState<ManufacturerSelection>({
    manufacturerId: "",
    expectedCompletionDate: "",
    specialInstructions: "",
  })

  // Determine which form to show based on job status
  const isNewJob = status === JOB_STATUS.NEW
  const isBagCreated = status === JOB_STATUS.BAG_CREATED
  const isStoneSelected = status === JOB_STATUS.STONE_SELECTED
  const isDiamondSelected = status === JOB_STATUS.DIAMOND_SELECTED

  // Add a new empty allocation
  const addAllocation = () => {
    setAllocations([...allocations, { lotNumber: "", quantity: "", weight: "" }])
  }

  // Remove an allocation at a specific index
  const removeAllocation = (index: number) => {
    if (allocations.length > 1) {
      setAllocations(allocations.filter((_, i) => i !== index))
    }
  }

  // Update an allocation field
  const updateAllocation = (index: number, field: keyof LotAllocation, value: string) => {
    const updatedAllocations = [...allocations]
    updatedAllocations[index] = { ...updatedAllocations[index], [field]: value }
    setAllocations(updatedAllocations)
  }

  // Update manufacturer selection data
  const updateManufacturerData = (field: keyof ManufacturerSelection, value: string) => {
    setManufacturerData({ ...manufacturerData, [field]: value })
  }

  // Check if stone/diamond allocation form is valid
  const isAllocationFormValid = () => {
    return allocations.every(
      (alloc) =>
        alloc.lotNumber &&
        alloc.quantity &&
        !isNaN(Number(alloc.quantity)) &&
        Number(alloc.quantity) > 0 &&
        alloc.weight &&
        !isNaN(Number(alloc.weight)) &&
        Number(alloc.weight) > 0,
    )
  }

  // Check if manufacturer selection form is valid
  const isManufacturerFormValid = () => {
    return manufacturerData.manufacturerId && manufacturerData.expectedCompletionDate
  }

  // Handle bag creation response
  const handleBagCreationResponse = (response: string) => {
    setBagCreated(response)
    if (response === "no") {
      setPrintStickerDialogOpen(true)
    } else if (response === "yes") {
      onComplete({ bagCreated: true })
    }
  }

  // Handle print sticker
  const handlePrintSticker = () => {
    // In a real app, this would print a sticker
    console.log("Printing sticker...")
    alert("Sticker would be printed here")
    setPrintStickerDialogOpen(false)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isBagCreated && isAllocationFormValid()) {
      onComplete(allocations)
    } else if (isStoneSelected && isAllocationFormValid()) {
      onComplete(allocations)
    } else if (isDiamondSelected && isManufacturerFormValid()) {
      onComplete(manufacturerData)
    }
  }

  // Get the appropriate title based on status
  const getTitle = () => {
    if (isNewJob) return "Bag Creation"
    if (isBagCreated) return "Stone Selection"
    if (isStoneSelected) return "Diamond Selection"
    if (isDiamondSelected) return "Manufacturer Selection"
    return "Work Done"
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* New Job - Bag Creation Form */}
        {isNewJob && (
          <div className="space-y-6">
            <div className="text-center p-6 border rounded-md">
              <h3 className="text-lg font-semibold mb-6">Have you created the bag?</h3>
              <div className="flex justify-center gap-4">
                <Button variant="default" size="lg" onClick={() => handleBagCreationResponse("yes")} className="px-8">
                  Yes
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleBagCreationResponse("no")} className="px-8">
                  No
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bag Created - Stone Selection Form */}
        {isBagCreated && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {allocations.map((allocation, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-md relative">
                {allocations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeAllocation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`lotNumber-${index}`}>Stone Lot Number</Label>
                  <Select
                    value={allocation.lotNumber}
                    onValueChange={(value) => updateAllocation(index, "lotNumber", value)}
                  >
                    <SelectTrigger id={`lotNumber-${index}`}>
                      <SelectValue placeholder="Select stone lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {STONE_LOTS.map((lot) => (
                        <SelectItem key={lot.id} value={lot.lotNumber}>
                          {lot.lotNumber} - {lot.stoneType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Number of Stones</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="Enter number of stones"
                    value={allocation.quantity}
                    onChange={(e) => updateAllocation(index, "quantity", e.target.value)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`weight-${index}`}>Stone Weight (g)</Label>
                  <Input
                    id={`weight-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="Enter stone weight in grams"
                    value={allocation.weight}
                    onChange={(e) => updateAllocation(index, "weight", e.target.value)}
                    min="0.01"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addAllocation} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Stone Lot
            </Button>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={!isAllocationFormValid()}>
                Complete Stone Selection
              </Button>
            </div>
          </form>
        )}

        {/* Stone Selected - Diamond Selection Form */}
        {isStoneSelected && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {allocations.map((allocation, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-md relative">
                {allocations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeAllocation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`lotNumber-${index}`}>Diamond Lot Number</Label>
                  <Select
                    value={allocation.lotNumber}
                    onValueChange={(value) => updateAllocation(index, "lotNumber", value)}
                  >
                    <SelectTrigger id={`lotNumber-${index}`}>
                      <SelectValue placeholder="Select diamond lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAMOND_LOTS.map((lot) => (
                        <SelectItem key={lot.id} value={lot.lotNumber}>
                          {lot.lotNumber} - {lot.diamondType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Number of Diamonds</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="Enter number of diamonds"
                    value={allocation.quantity}
                    onChange={(e) => updateAllocation(index, "quantity", e.target.value)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`weight-${index}`}>Diamond Weight (g)</Label>
                  <Input
                    id={`weight-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="Enter diamond weight in grams"
                    value={allocation.weight}
                    onChange={(e) => updateAllocation(index, "weight", e.target.value)}
                    min="0.01"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addAllocation} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Diamond Lot
            </Button>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={!isAllocationFormValid()}>
                Complete Diamond Selection
              </Button>
            </div>
          </form>
        )}

        {/* Diamond Selected - Manufacturer Selection Form */}
        {isDiamondSelected && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Select Manufacturer</Label>
                <Select
                  value={manufacturerData.manufacturerId}
                  onValueChange={(value) => updateManufacturerData("manufacturerId", value)}
                >
                  <SelectTrigger id="manufacturer">
                    <SelectValue placeholder="Select a manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUFACTURERS.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {manufacturerData.manufacturerId && (
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="font-medium mb-2">Manufacturer Details</h4>
                  <p className="text-sm">{MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)?.name}</p>
                  <p className="text-sm">
                    {MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)?.address}
                  </p>
                  <p className="text-sm">
                    Specialties:{" "}
                    {MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)?.specialties.join(", ")}
                  </p>
                  <p className="text-sm">
                    Lead Time: {MANUFACTURERS.find((m) => m.id === manufacturerData.manufacturerId)?.leadTime}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expectedCompletionDate">Expected Completion Date</Label>
                <div className="relative">
                  <Input
                    id="expectedCompletionDate"
                    type="date"
                    value={manufacturerData.expectedCompletionDate}
                    onChange={(e) => updateManufacturerData("expectedCompletionDate", e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Enter any special instructions for the manufacturer"
                  value={manufacturerData.specialInstructions}
                  onChange={(e) => updateManufacturerData("specialInstructions", e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={!isManufacturerFormValid()}>
                Assign Manufacturer
              </Button>
            </div>
          </form>
        )}

        {/* Print Sticker Dialog */}
        <Dialog open={printStickerDialogOpen} onOpenChange={setPrintStickerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Print Bag Sticker</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>You need to print a sticker for the bag before proceeding.</p>
            </div>
            <DialogFooter>
              <Button onClick={handlePrintSticker}>
                <Printer className="mr-2 h-4 w-4" />
                Print Sticker
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
