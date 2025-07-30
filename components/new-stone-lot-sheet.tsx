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
import { createStoneLot } from "@/app/actions/stone-actions"
import type { NewStoneLotData, StoneLotData } from "@/types"
import { Loader2 } from "lucide-react"
import {
  STONE_TYPE,
  STONE_TYPE_CODES,
  STONE_SHAPE,
  STONE_CUT,
  STONE_QUALITY,
  STONE_LOCATION,
} from "@/constants/categories"

interface NewStoneLotSheetProps {
  isOpen: boolean
  onClose: () => void
  onStoneLotCreated: (newLot: StoneLotData) => void
}

export function NewStoneLotSheet({ isOpen, onClose, onStoneLotCreated }: NewStoneLotSheetProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getInitialState = () => ({
    lot_number: "",
    stone_type: STONE_TYPE_CODES[STONE_TYPE.NONE], // Set default to 'None' code
    shape: STONE_SHAPE.FC,
    stone_size: "",
    quality: STONE_QUALITY.A,
    type: STONE_CUT.CL,
    quantity: "",
    weight: "",
    location: STONE_LOCATION.PRIMARY,
  })

  const [formState, setFormState] = useState<NewStoneLotData>(getInitialState())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormState((prevState) => ({ ...prevState, [id]: value }))
  }

  const handleSelectChange = (field: keyof NewStoneLotData, value: string) => {
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

    const result = await createStoneLot(formState)

    setIsLoading(false)

    if (result.success) {
      toast({
        title: "Success",
        description: `Stone lot ${formState.lot_number} has been created.`,
      })
      onStoneLotCreated(result.data)
      handleClose()
    } else {
      setError(result.error || "An unknown error occurred.")
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to create stone lot.",
      })
    }
  }

  const isFormValid = formState.lot_number && formState.stone_type && formState.stone_type !== STONE_TYPE_CODES[STONE_TYPE.NONE]

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl md:w-[calc(100vw-240px)] overflow-y-auto force-full-width-sheet">
        <SheetHeader>
          <SheetTitle>Add New Stone Lot</SheetTitle>
          <SheetDescription>
            Enter the details for the new stone lot. Click create when you're done.
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
                <TableHead>Stone Type</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Stone Cut</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Location</TableHead>
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
                    value={formState.stone_type}
                    onValueChange={(value) => handleSelectChange("stone_type", value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select a stone type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STONE_TYPE).map(([key, name]) => (
                        <SelectItem key={key} value={STONE_TYPE_CODES[name]}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {Object.values(STONE_SHAPE).map((shape) => (
                        <SelectItem key={shape} value={shape}>
                          {shape}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    id="stone_size"
                    value={formState.stone_size}
                    onChange={handleInputChange}
                    className="w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.quality}
                    onValueChange={(value) => handleSelectChange("quality", value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select a quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(STONE_QUALITY).map((quality) => (
                        <SelectItem key={quality} value={quality}>
                          {quality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select a cut" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(STONE_CUT).map((cut) => (
                        <SelectItem key={cut} value={cut}>
                          {cut}
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
                    step="0.01"
                    value={formState.weight}
                    onChange={handleInputChange}
                    className="w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={formState.location}
                    onValueChange={(value) => handleSelectChange("location", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(STONE_LOCATION).map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              "Create Stone Lot"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
