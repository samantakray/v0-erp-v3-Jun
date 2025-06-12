"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { logger } from "@/lib/logger"

interface StoneLotData {
  id: string
  lot_number: string
  stone_type: string
  size: string // This should be correctly populated now
  quantity: number // This is the available quantity
  weight: number // This is the available weight
  available: boolean
}

interface StoneAllocationRowProps {
  index: number
  allocation: {
    clientId: string
    lot_number: string
    stone_type: string
    size: string
    quantity: number
    weight: number
    available_quantity?: number
    available_weight?: number
  }
  stoneLots: StoneLotData[]
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [key: string]: string }
  stoneAllocations: any[] // Declare stoneAllocations here
}

export default function StoneAllocationRow({
  index,
  allocation,
  stoneLots,
  onChange,
  onDelete,
  isSubmitting,
  validationErrors,
  stoneAllocations, // Ensure this prop is received
}: StoneAllocationRowProps) {
  // --- ENHANCED LOGGING FOR STONE ALLOCATION ROW ---
  logger.debug("StoneAllocationRow: Component rendering with detailed props analysis", {
    index,
    allocation: {
      clientId: allocation.clientId,
      lot_number: allocation.lot_number,
      lot_number_type: typeof allocation.lot_number,
      lot_number_valid: !!(allocation.lot_number && allocation.lot_number.trim()),
      stone_type: allocation.stone_type,
      size: allocation.size,
      quantity: allocation.quantity,
      weight: allocation.weight,
      available_quantity: allocation.available_quantity,
      available_weight: allocation.available_weight,
    },
    stoneLots: {
      isArray: Array.isArray(stoneLots),
      count: stoneLots ? stoneLots.length : 0,
      sample: stoneLots?.[0] || null,
      allLotNumbers: stoneLots?.map((lot) => lot.lot_number) || [],
      detailedLots:
        stoneLots?.map((lot) => ({
          id: lot.id,
          lot_number: lot.lot_number,
          lot_number_type: typeof lot.lot_number,
          lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
          stone_type: lot.stone_type,
          size: lot.size,
          quantity: lot.quantity,
          weight: lot.weight,
          available: lot.available,
        })) || [],
    },
    stoneAllocations: stoneAllocations ? `Array(${stoneAllocations.length})` : stoneAllocations,
    isSubmitting,
    validationErrors,
  })
  // --- END ENHANCED LOGGING ---

  const uniqueId = useId()
  const lotSelectId = `lot-select-${uniqueId}`
  const quantityInputId = `quantity-input-${uniqueId}`
  const weightInputId = `weight-input-${uniqueId}`

  const handleLotChange = (value: string) => {
    logger.debug("StoneAllocationRow: handleLotChange called with detailed analysis", {
      index,
      value,
      value_type: typeof value,
      value_valid: !!(value && value.trim()),
      availableLotsCount: stoneLots.length,
      availableLotNumbers: stoneLots.map((lot) => lot.lot_number),
      firstAvailableLot: stoneLots[0],
    })

    const selectedLot = stoneLots.find((lot) => lot.lot_number === value)

    if (selectedLot) {
      logger.debug("StoneAllocationRow: Selected lot found with detailed data", {
        selectedLot: {
          id: selectedLot.id,
          lot_number: selectedLot.lot_number,
          lot_number_type: typeof selectedLot.lot_number,
          stone_type: selectedLot.stone_type,
          size: selectedLot.size,
          size_type: typeof selectedLot.size,
          quantity: selectedLot.quantity,
          quantity_type: typeof selectedLot.quantity,
          weight: selectedLot.weight,
          weight_type: typeof selectedLot.weight,
          available: selectedLot.available,
        },
        mappingActions: {
          lot_number: selectedLot.lot_number,
          stone_type: selectedLot.stone_type,
          size: selectedLot.size,
          available_quantity: selectedLot.quantity,
          available_weight: selectedLot.weight,
        },
      })

      onChange(index, "lot_number", selectedLot.lot_number)
      onChange(index, "stone_type", selectedLot.stone_type)
      onChange(index, "size", selectedLot.size) // Ensure this uses the correct 'size'
      onChange(index, "available_quantity", selectedLot.quantity)
      onChange(index, "available_weight", selectedLot.weight)
      // Clear previous quantity/weight when lot changes, or set to 1? For now, let user input.
      // onChange(index, "quantity", 0);
      // onChange(index, "weight", 0);
    } else {
      logger.warn("StoneAllocationRow: Selected lot NOT found with detailed analysis", {
        searchValue: value,
        searchValue_type: typeof value,
        searchValue_valid: !!(value && value.trim()),
        availableLotNumbers: stoneLots.map((l) => l.lot_number),
        exactMatches: stoneLots.filter((l) => l.lot_number === value),
        partialMatches: stoneLots.filter((l) => l.lot_number && l.lot_number.includes(value)),
        caseInsensitiveMatches: stoneLots.filter(
          (l) => l.lot_number && l.lot_number.toLowerCase() === value.toLowerCase(),
        ),
      })

      onChange(index, "lot_number", value) // Still set the lot_number for potential error display
      onChange(index, "stone_type", "")
      onChange(index, "size", "")
      onChange(index, "available_quantity", undefined)
      onChange(index, "available_weight", undefined)
      onChange(index, "quantity", 0)
      onChange(index, "weight", 0)
    }
  }

  // Log Select options rendering
  logger.debug("StoneAllocationRow: Preparing Select options for rendering", {
    index,
    stoneLots_count: stoneLots.length,
    options_to_render: stoneLots.map((lot, optionIndex) => ({
      optionIndex,
      id: lot.id,
      lot_number: lot.lot_number,
      lot_number_type: typeof lot.lot_number,
      lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
      will_render: !!(lot.lot_number && lot.lot_number.trim()),
      display_text: lot.lot_number + (lot.id.startsWith("fallback-") ? " (Demo Data)" : ""),
    })),
  })

  return (
    <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_0.5fr] gap-4 items-start py-2 border-b last:border-b-0">
      <div className="text-sm text-muted-foreground pt-2">{index + 1}.</div>
      <div>
        <Select value={allocation.lot_number} onValueChange={handleLotChange} disabled={isSubmitting}>
          <SelectTrigger id={lotSelectId} className={validationErrors.lot_number ? "border-destructive" : ""}>
            <SelectValue placeholder="Select lot" />
          </SelectTrigger>
          <SelectContent>
            {stoneLots.map((lot, optionIndex) => {
              // Log each option as it's being rendered
              logger.debug(`StoneAllocationRow: Rendering Select option ${optionIndex}`, {
                index,
                optionIndex,
                lot: {
                  id: lot.id,
                  lot_number: lot.lot_number,
                  lot_number_type: typeof lot.lot_number,
                  lot_number_valid: !!(lot.lot_number && lot.lot_number.trim()),
                  stone_type: lot.stone_type,
                  size: lot.size,
                },
                selectItem_key: lot.id,
                selectItem_value: lot.lot_number,
                selectItem_display: lot.lot_number + (lot.id.startsWith("fallback-") ? " (Demo Data)" : ""),
              })

              return (
                <SelectItem key={lot.id} value={lot.lot_number}>
                  {lot.lot_number}
                  {lot.id.startsWith("fallback-") && " (Demo Data)"}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {validationErrors.lot_number && <p className="text-destructive text-xs mt-1">{validationErrors.lot_number}</p>}
      </div>
      <Input value={allocation.stone_type || "-"} disabled className="mt-0" /> {/* Ensure size is displayed */}
      <Input value={allocation.size || "-"} disabled className="mt-0" />
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
        disabled={isSubmitting || (stoneAllocations && stoneAllocations.length <= 1)} // Safely access length
        className="text-muted-foreground hover:text-destructive mt-0"
      >
        <XCircle className="h-4 w-4" />
        <span className="sr-only">Delete row</span>
      </Button>
    </div>
  )
}
