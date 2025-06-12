"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { logger } from "@/lib/logger"

interface DiamondLotData {
  id: string
  lot_number: string
  size: string
  shape: string
  quality: string
  a_type: string
  stonegroup: string
  quantity: number // Available quantity in the lot
  weight: number // Total weight of the lot in carats
  price: number
  status: string
}

interface DiamondAllocation {
  clientId: string // For React key prop
  lot_number: string
  size: string
  shape: string
  quality: string
  quantity: number // User-allocated quantity
  weight: number // User-allocated weight in carats (direct input)
  available_quantity?: number // Stored from DiamondLotData for validation
}

interface DiamondAllocationRowProps {
  index: number
  allocation: DiamondAllocation
  diamondLots: DiamondLotData[]
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [key: string]: string }
  diamondAllocations: DiamondAllocation[]
}

export default function DiamondAllocationRow({
  index,
  allocation,
  diamondLots,
  onChange,
  onDelete,
  isSubmitting,
  validationErrors,
  diamondAllocations,
}: DiamondAllocationRowProps) {
  // --- ENHANCED LOGGING FOR DIAMOND ALLOCATION ROW ---
  logger.debug("DiamondAllocationRow: Component rendering with detailed props analysis", {
    index,
    allocation: {
      clientId: allocation.clientId,
      lot_number: allocation.lot_number,
      lot_number_type: typeof allocation.lot_number,
      lot_number_valid: !!(allocation.lot_number && allocation.lot_number.trim()),
      size: allocation.size,
      shape: allocation.shape,
      quality: allocation.quality,
      quantity: allocation.quantity,
      weight: allocation.weight,
      available_quantity: allocation.available_quantity,
    },
    diamondLots: {
      isArray: Array.isArray(diamondLots),
      count: diamondLots ? diamondLots.length : 0,
      sample: diamondLots?.[0] || null,
      allLotNumbers: diamondLots?.map((lot) => lot.lot_number) || [],
      detailedLots:
        diamondLots?.map((lot) => ({
          id: lot.id,
          lot_number: lot.lot_number,
          lot_number_type: typeof lot.lot_number,
          lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
          size: lot.size,
          shape: lot.shape,
          quality: lot.quality,
          quantity: lot.quantity,
          weight: lot.weight,
          status: lot.status,
        })) || [],
    },
    diamondAllocations: diamondAllocations ? `Array(${diamondAllocations.length})` : diamondAllocations,
    isSubmitting,
    validationErrors,
  })
  // --- END ENHANCED LOGGING ---

  const uniqueId = useId()
  const lotSelectId = `diamond-lot-select-${uniqueId}`
  const quantityInputId = `diamond-quantity-input-${uniqueId}`
  const weightInputId = `diamond-weight-input-${uniqueId}`

  const handleLotChange = (value: string) => {
    logger.debug("DiamondAllocationRow: handleLotChange called with detailed analysis", {
      index,
      value,
      value_type: typeof value,
      value_valid: !!(value && value.trim()),
      availableLotsCount: diamondLots.length,
      availableLotNumbers: diamondLots.map((lot) => lot.lot_number),
      firstAvailableLot: diamondLots[0],
    })

    const selectedLot = diamondLots.find((lot) => lot.lot_number === value)

    if (selectedLot) {
      logger.debug("DiamondAllocationRow: Selected lot found with detailed data", {
        selectedLot: {
          id: selectedLot.id,
          lot_number: selectedLot.lot_number,
          lot_number_type: typeof selectedLot.lot_number,
          size: selectedLot.size,
          size_type: typeof selectedLot.size,
          shape: selectedLot.shape,
          shape_type: typeof selectedLot.shape,
          quality: selectedLot.quality,
          quality_type: typeof selectedLot.quality,
          quantity: selectedLot.quantity,
          quantity_type: typeof selectedLot.quantity,
          weight: selectedLot.weight,
          weight_type: typeof selectedLot.weight,
          status: selectedLot.status,
        },
        mappingActions: {
          lot_number: selectedLot.lot_number,
          size: selectedLot.size,
          shape: selectedLot.shape,
          quality: selectedLot.quality,
          available_quantity: selectedLot.quantity,
        },
      })

      onChange(index, "lot_number", selectedLot.lot_number)
      onChange(index, "size", selectedLot.size)
      onChange(index, "shape", selectedLot.shape)
      onChange(index, "quality", selectedLot.quality)
      onChange(index, "available_quantity", selectedLot.quantity)
    } else {
      logger.warn("DiamondAllocationRow: Selected lot NOT found with detailed analysis", {
        searchValue: value,
        searchValue_type: typeof value,
        searchValue_valid: !!(value && value.trim()),
        availableLotNumbers: diamondLots.map((l) => l.lot_number),
        exactMatches: diamondLots.filter((l) => l.lot_number === value),
        partialMatches: diamondLots.filter((l) => l.lot_number && l.lot_number.includes(value)),
        caseInsensitiveMatches: diamondLots.filter(
          (l) => l.lot_number && l.lot_number.toLowerCase() === value.toLowerCase(),
        ),
      })

      onChange(index, "lot_number", value)
      onChange(index, "size", "")
      onChange(index, "shape", "")
      onChange(index, "quality", "")
      onChange(index, "available_quantity", undefined)
    }
  }

  // Log Select options rendering
  logger.debug("DiamondAllocationRow: Preparing Select options for rendering", {
    index,
    diamondLots_count: diamondLots.length,
    options_to_render: diamondLots.map((lot, optionIndex) => ({
      optionIndex,
      id: lot.id,
      lot_number: lot.lot_number,
      lot_number_type: typeof lot.lot_number,
      lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
      will_render: !!(lot.lot_number && lot.lot_number.trim()),
      display_text: lot.lot_number,
    })),
  })

  return (
    <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1.5fr_1.5fr_0.5fr] gap-4 items-start py-2 border-b last:border-b-0">
      <div className="text-sm text-muted-foreground pt-2">{index + 1}.</div>
      <div>
        <Select value={allocation.lot_number} onValueChange={handleLotChange} disabled={isSubmitting}>
          <SelectTrigger id={lotSelectId} className={validationErrors.lot_number ? "border-destructive" : ""}>
            <SelectValue placeholder="Select diamond lot" />
          </SelectTrigger>
          <SelectContent>
            {diamondLots.map((lot, optionIndex) => {
              // Log each option as it's being rendered
              logger.debug(`DiamondAllocationRow: Rendering Select option ${optionIndex}`, {
                index,
                optionIndex,
                lot: {
                  id: lot.id,
                  lot_number: lot.lot_number,
                  lot_number_type: typeof lot.lot_number,
                  lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
                  size: lot.size,
                  shape: lot.shape,
                  quality: lot.quality,
                },
                selectItem_key: lot.id,
                selectItem_value: lot.lot_number,
                selectItem_display: lot.lot_number,
              })

              return (
                <SelectItem key={lot.id} value={lot.lot_number}>
                  {lot.lot_number}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {validationErrors.lot_number && <p className="text-destructive text-xs mt-1">{validationErrors.lot_number}</p>}
      </div>
      <Input value={allocation.size || "-"} disabled className="mt-0" />
      <Input value={allocation.shape || "-"} disabled className="mt-0" />
      <Input value={allocation.quality || "-"} disabled className="mt-0" />
      <div>
        <Input
          id={quantityInputId}
          type="number"
          value={allocation.quantity === 0 ? "" : allocation.quantity}
          onChange={(e) => onChange(index, "quantity", Number(e.target.value))}
          disabled={isSubmitting}
          placeholder="0"
          className={`${validationErrors.quantity ? "border-destructive" : ""} mt-0`}
        />
        {validationErrors.quantity && <p className="text-destructive text-xs mt-1">{validationErrors.quantity}</p>}
      </div>
      <div>
        <Input
          id={weightInputId}
          type="number"
          step="0.01"
          value={allocation.weight === 0 ? "" : allocation.weight}
          onChange={(e) => onChange(index, "weight", Number(e.target.value))}
          disabled={isSubmitting}
          placeholder="0.00"
          className={`${validationErrors.weight ? "border-destructive" : ""} mt-0`}
        />
        {validationErrors.weight && <p className="text-destructive text-xs mt-1">{validationErrors.weight}</p>}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(index)}
        disabled={isSubmitting || (diamondAllocations && diamondAllocations.length <= 1)}
        className="text-muted-foreground hover:text-destructive mt-0"
      >
        <XCircle className="h-4 w-4" />
        <span className="sr-only">Delete row</span>
      </Button>
    </div>
  )
}
