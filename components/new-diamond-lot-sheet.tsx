"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createDiamondLot } from "@/app/actions/diamond-actions"
import type { NewDiamondLotData } from "@/types"
import { Loader2 } from "lucide-react"
import {
  DIAMOND_SHAPE,
  DIAMOND_SIZE,
  DIAMOND_QUALITY,
  DIAMOND_TYPE,
} from "@/constants/categories"

interface NewDiamondLotSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function NewDiamondLotSheet({ isOpen, onClose }: NewDiamondLotSheetProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getInitialState = () => ({
    lot_number: "",
    shape: DIAMOND_SHAPE.RD,
    size: DIAMOND_SIZE.NONE,
    quality: DIAMOND_QUALITY.UNKNOWN,
    a_type: DIAMOND_TYPE.ACTUAL,
    quantity: "",
    weight: "",
    price: "",
    stonegroup: "diamond",
  })

  const [formState, setFormState] = useState<NewDiamondLotData>(getInitialState())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormState((prevState) => ({ ...prevState, [id]: value }))
  }

  const handleSelectChange = (field: keyof NewDiamondLotData, value: string) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }))
  }

  const resetForm = () => {
    setFormState(getInitialState())
    setError(null)
    setIsLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleCreate = async () => {
    setIsLoading(true)
    setError(null)

    const result = await createDiamondLot(formState)

    setIsLoading(false)

    if (result.success) {
      toast({
        title: "Success",
        description: `Diamond lot ${formState.lot_number} has been created.`,
      })
      handleClose()
    } else {
      setError(result.error || "An unknown error occurred.")
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to create diamond lot.",
      })
    }
  }

  const isFormValid = formState.lot_number && formState.quantity && formState.weight && formState.price

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl md:w-[calc(100vw-240px)] overflow-y-auto force-full-width-sheet">
        <SheetHeader>
          <SheetTitle>Add New Diamond Lot</SheetTitle>
          <SheetDescription>
            Enter the details for the new diamond lot. Click create when you're done.
          </SheetDescription>
        </SheetHeader>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Number</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Diamond Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Input
                    id="lot_number"
                    value={formState.lot_number}
                    onChange={handleInputChange}
                    className="w-[120px]"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.shape}
                    onValueChange={(value) => handleSelectChange("shape", value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select a shape" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DIAMOND_SHAPE).map((shape) => (
                        <SelectItem key={shape} value={shape}>
                          {shape}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.size}
                    onValueChange={(value) => handleSelectChange("size", value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DIAMOND_SIZE).map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.quality}
                    onValueChange={(value) => handleSelectChange("quality", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select a quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DIAMOND_QUALITY).map((quality) => (
                        <SelectItem key={quality} value={quality}>
                          {quality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.a_type}
                    onValueChange={(value) => handleSelectChange("a_type", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DIAMOND_TYPE).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    id="quantity"
                    type="number"
                    value={formState.quantity}
                    onChange={handleInputChange}
                    className="w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    id="weight"
                    type="number"
                    value={formState.weight}
                    onChange={handleInputChange}
                    className="w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    id="price"
                    type="number"
                    value={formState.price}
                    onChange={handleInputChange}
                    className="w-[100px]"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" onClick={handleCreate} disabled={!isFormValid || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Diamond Lot"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
