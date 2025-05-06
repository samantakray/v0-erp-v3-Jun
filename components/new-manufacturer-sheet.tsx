"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createManufacturer } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { logger } from "@/lib/logger"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NewManufacturerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NewManufacturerSheet({ open, onOpenChange, onSuccess }: NewManufacturerSheetProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    current_load: 0,
    past_job_count: 0,
    rating: 0,
    active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "number") {
      // Handle empty string for number inputs
      const numValue = value === "" ? 0 : Number.parseFloat(value)
      setFormData({
        ...formData,
        [name]: numValue,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }

    // Clear submit error when any field changes
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      active: checked,
    })

    // Clear submit error when any field changes
    if (submitError) {
      setSubmitError(null)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Manufacturer name is required"
    }

    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5"
    }

    if (formData.current_load < 0) {
      newErrors.current_load = "Current load cannot be negative"
    }

    if (formData.past_job_count < 0) {
      newErrors.past_job_count = "Past job count cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: "",
      current_load: 0,
      past_job_count: 0,
      rating: 0,
      active: true,
    })
    setErrors({})
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      logger.info("Creating new manufacturer", { data: formData })

      // Create a clean version of the data for submission
      const dataToSubmit = {
        name: formData.name.trim(),
        current_load: formData.current_load || null,
        past_job_count: formData.past_job_count || null,
        rating: formData.rating || null,
        active: formData.active,
      }

      const result = await createManufacturer(dataToSubmit)

      if (result.success) {
        toast({
          title: "Manufacturer created",
          description: `${formData.name} has been added successfully.`,
        })

        // Reset form
        resetForm()

        // Close sheet and refresh data
        onOpenChange(false)
        onSuccess()
      } else {
        logger.error("Error response from createManufacturer", { error: result.error })
        setSubmitError(result.error || "Failed to create manufacturer. Please try again.")
        toast({
          title: "Error",
          description: result.error || "Failed to create manufacturer",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      logger.error("Exception in handleSubmit", { error: error.message, stack: error.stack })
      setSubmitError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add New Manufacturer</SheetTitle>
          <SheetDescription>Create a new manufacturer in the system. Fill in the details below.</SheetDescription>
        </SheetHeader>

        {submitError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Manufacturer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter manufacturer name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_load">Current Load</Label>
              <Input
                id="current_load"
                name="current_load"
                type="number"
                min="0"
                placeholder="0"
                value={formData.current_load === 0 ? "" : formData.current_load}
                onChange={handleChange}
                className={errors.current_load ? "border-red-500" : ""}
              />
              {errors.current_load && <p className="text-sm text-red-500">{errors.current_load}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="past_job_count">Past Job Count</Label>
              <Input
                id="past_job_count"
                name="past_job_count"
                type="number"
                min="0"
                placeholder="0"
                value={formData.past_job_count === 0 ? "" : formData.past_job_count}
                onChange={handleChange}
                className={errors.past_job_count ? "border-red-500" : ""}
              />
              {errors.past_job_count && <p className="text-sm text-red-500">{errors.past_job_count}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="0.0"
              value={formData.rating === 0 ? "" : formData.rating}
              onChange={handleChange}
              className={errors.rating ? "border-red-500" : ""}
            />
            {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="active" checked={formData.active} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Manufacturer"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
