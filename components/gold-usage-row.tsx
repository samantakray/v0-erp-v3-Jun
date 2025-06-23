"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { GOLD_TYPE } from "@/constants/categories"

interface GoldUsageDetail {
  clientId: string
  description: string
  grossWeight: number
  scrapWeight: number
}

interface GoldUsageRowProps {
  index: number
  usage: GoldUsageDetail
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [field: string]: string }
}

export default function GoldUsageRow({
  index,
  usage,
  onChange,
  onDelete,
  isSubmitting,
  validationErrors,
}: GoldUsageRowProps) {
  return (
    <div className="grid grid-cols-[0.5fr_3fr_2fr_2fr_0.5fr] gap-4 mb-2 items-center">
      {/* Row Number */}
      <div className="text-sm text-muted-foreground text-center">{index + 1}</div>

      {/* Gold Type */}
      <div className="space-y-1">
        <Select
          value={usage.description}
          onValueChange={(value) => onChange(index, "description", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className={cn(validationErrors.description && "border-red-500")}>
            <SelectValue placeholder="Select gold type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(GOLD_TYPE).map((goldType) => (
              <SelectItem key={goldType} value={goldType}>
                {goldType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.description && (
          <p className="text-xs text-red-500">{validationErrors.description}</p>
        )}
      </div>

      {/* Gross Weight */}
      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={usage.grossWeight || ""}
          onChange={(e) => onChange(index, "grossWeight", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.grossWeight && "border-red-500")}
        />
        {validationErrors.grossWeight && (
          <p className="text-xs text-red-500">{validationErrors.grossWeight}</p>
        )}
      </div>

      {/* Scrap Weight */}
      <div className="space-y-1">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={usage.scrapWeight || ""}
          onChange={(e) => onChange(index, "scrapWeight", Number(e.target.value) || 0)}
          disabled={isSubmitting}
          className={cn(validationErrors.scrapWeight && "border-red-500")}
        />
        {validationErrors.scrapWeight && (
          <p className="text-xs text-red-500">{validationErrors.scrapWeight}</p>
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