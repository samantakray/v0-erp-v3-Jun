"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StoneLotData } from "@/types"

interface ColoredStoneUsageDetail {
  clientId: string
  type: string
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}

interface ColoredStoneUsageRowProps {
  index: number
  usage: ColoredStoneUsageDetail
  stoneLots: StoneLotData[]
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [field: string]: string }
}

export default function ColoredStoneUsageRow({
  index,
  usage,
  stoneLots,
  onChange,
  onDelete,
  isSubmitting,
  validationErrors,
}: ColoredStoneUsageRowProps) {
  return (
    <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 items-center">
      {/* Row Number */}
      <div className="text-sm text-muted-foreground text-center">{index + 1}</div>

      {/* Type */}
      <div className="space-y-1">
        <Select
          value={usage.type}
          onValueChange={(value) => onChange(index, "type", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className={cn(validationErrors.type && "border-red-500")}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {stoneLots.map((lot) => (
              <SelectItem key={lot.id} value={lot.lot_number}>
                {lot.lot_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.type && (
          <p className="text-xs text-red-500">{validationErrors.type}</p>
        )}
      </div>

      {/* Return Quantity */}
      <div className="space-y-1">
        <Input
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={usage.returnQuantity || ""}
          onChange={(e) => onChange(index, "returnQuantity", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.returnQuantity && "border-red-500")}
        />
        {validationErrors.returnQuantity && (
          <p className="text-xs text-red-500">{validationErrors.returnQuantity}</p>
        )}
      </div>

      {/* Return Weight */}
      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={usage.returnWeight || ""}
          onChange={(e) => onChange(index, "returnWeight", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.returnWeight && "border-red-500")}
        />
        {validationErrors.returnWeight && (
          <p className="text-xs text-red-500">{validationErrors.returnWeight}</p>
        )}
      </div>

      {/* Loss Quantity */}
      <div className="space-y-1">
        <Input
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={usage.lossQuantity || ""}
          onChange={(e) => onChange(index, "lossQuantity", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.lossQuantity && "border-red-500")}
        />
        {validationErrors.lossQuantity && (
          <p className="text-xs text-red-500">{validationErrors.lossQuantity}</p>
        )}
      </div>

      {/* Loss Weight */}
      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={usage.lossWeight || ""}
          onChange={(e) => onChange(index, "lossWeight", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.lossWeight && "border-red-500")}
        />
        {validationErrors.lossWeight && (
          <p className="text-xs text-red-500">{validationErrors.lossWeight}</p>
        )}
      </div>

      {/* Break Quantity */}
      <div className="space-y-1">
        <Input
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={usage.breakQuantity || ""}
          onChange={(e) => onChange(index, "breakQuantity", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.breakQuantity && "border-red-500")}
        />
        {validationErrors.breakQuantity && (
          <p className="text-xs text-red-500">{validationErrors.breakQuantity}</p>
        )}
      </div>

      {/* Break Weight */}
      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={usage.breakWeight || ""}
          onChange={(e) => onChange(index, "breakWeight", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.breakWeight && "border-red-500")}
        />
        {validationErrors.breakWeight && (
          <p className="text-xs text-red-500">{validationErrors.breakWeight}</p>
        )}
      </div>

      {/* Delete Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(index)}
          disabled={isSubmitting}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 