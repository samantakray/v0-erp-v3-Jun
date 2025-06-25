"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Loader2 } from "lucide-react"
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
  getCategoryCode,
} from "@/constants/categories"
import { getNextSkuNumber, createSkuBatch, getPredictedNextSkuNumber } from "@/app/actions/sku-sequence-actions"
import { logger } from "@/lib/logger"
import { ImageUpload } from "@/components/image-upload"


export function NewSKUSheet({ open, onOpenChange, onSKUCreated = () => {} }) {
  const [multipleSkus, setMultipleSkus] = useState([
    {
      category: "Necklace",
      collection: COLLECTION_NAME.NONE, // Default collection
      size: DEFAULT_SIZES["Necklace"] ?? 0, // Add fallback for missing default size
      goldType: GOLD_TYPE.YELLOW_GOLD, // Use constant
      stoneType: STONE_TYPE.NONE, // Use constant
      diamondType: "",
      weight: "",
      imageUrl: "", // Changed from image: null to imageUrl: ""
      imageFile: null, // Add this to store the actual File object
    },
  ])
  const [nextSequentialNumber, setNextSequentialNumber] = useState(null)
  const [formattedNumber, setFormattedNumber] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const skusCreatedRef = useRef(false)
  const [isPredictedNumber, setIsPredictedNumber] = useState(true)
  const [uploadErrors, setUploadErrors] = useState({})

  // Initialize the SKU in the set and fetch the predicted next number when the sheet is opened
  useEffect(() => {
    if (open) {
      setError(null)
      setUploadErrors({})
      // Reset the skusCreated flag when the sheet is opened
      skusCreatedRef.current = false
      setIsPredictedNumber(true)

      // Initialize with default SKU
      setMultipleSkus([
        {
          category: "Necklace",
          collection: COLLECTION_NAME.NONE, // Default collection
          size: DEFAULT_SIZES["Necklace"] ?? 0, // Add fallback for missing default size
          goldType: GOLD_TYPE.YELLOW_GOLD, // Use constant
          stoneType: STONE_TYPE.NONE, // Use constant
          diamondType: "",
          weight: "",
          imageUrl: "", // Changed from image: null to imageUrl: ""
          imageFile: null, // Add this to store the actual File object
        },
      ])

      // Fetch the predicted next number
      fetchPredictedNextNumber()
    }
  }, [open])

  // Custom handler for sheet open/close events
  const handleOpenChange = (newOpen: boolean) => {
    // Only log when the sheet is being closed (going from open to closed)
    if (open === true && newOpen === false && !skusCreatedRef.current) {
      logger.info("SKU form manually closed by user without creating SKUs")
    }

    // Call the original onOpenChange to maintain expected behavior
    onOpenChange(newOpen)
  }

  // Fetch the predicted next number from the server
  const fetchPredictedNextNumber = async () => {
    setIsLoading(true)
    try {
      const result = await getPredictedNextSkuNumber()
      if (result.success) {
        setNextSequentialNumber(result.predictedNumber)
        setFormattedNumber(result.formattedNumber)
        setIsPredictedNumber(true)
      } else {
        setError(result.error || "Failed to predict next SKU number")
      }
    } catch (err) {
      setError("An unexpected error occurred while predicting the next SKU number")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle image URL change for a specific SKU in the set
  const handleImageChange = (imageUrl, file, index) => {
    // 🔍 DEBUG LOGGING - Client-side upload state tracking
    console.log("🔍 NewSKUSheet DEBUG - Image change:", {
      index,
      hasUrl: !!imageUrl,
      hasFile: !!file,
      fileName: file?.name,
      shouldReuseExisting: !!imageUrl,
      willClearFile: !!imageUrl // File will be cleared if URL exists
    })

    const newSkus = [...multipleSkus]
    newSkus[index].imageUrl = imageUrl
    // 🔍 OPTION A IMPLEMENTATION: Clear file if URL exists (successful upload)
    newSkus[index].imageFile = imageUrl ? null : file
    setMultipleSkus(newSkus)

    // Clear any previous error for this index
    if (uploadErrors[index]) {
      const newErrors = { ...uploadErrors }
      delete newErrors[index]
      setUploadErrors(newErrors)
    }
  }

  // Handle image upload error for a specific SKU in the set
  const handleImageError = (error, index) => {
    setUploadErrors((prev) => ({
      ...prev,
      [index]: error,
    }))
  }

  // Generate SKU ID preview based on category and sequential number
  const generateSkuIdPreview = (category) => {
    if (!formattedNumber) return "Generating..."
    // Use the helper function from constants/categories.ts
    const prefix = getCategoryCode(category) || "OO" // Default to "OO" if category not found
    return `${prefix}-${formattedNumber}`
  }

  const handleCreateSkusBatch = async () => {

// Check if any SKU has a category of "None"
const hasInvalidCategory = multipleSkus.some(sku => sku.category === "None");
if (hasInvalidCategory) {
  setError("Cannot create SKUs: Category cannot be None.");
  return;
}

//// New duplicate category check
const categories = multipleSkus.map(sku => sku.category);
const hasDuplicates = new Set(categories).size !== categories.length;
if (hasDuplicates) {
  setError("Cannot create SKUs: Each variant must have a unique category.");
  return;
}

//check if the set is empty
    if (multipleSkus.length === 0) {
      setError("Cannot create SKUs: No SKUs in the set added.")
      return
    }

    // Check if there are any image upload errors
    if (Object.keys(uploadErrors).length > 0) {
      setError("Please fix image upload errors before creating SKUs.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get the actual next sequence number at submission time
      const sequenceResult = await getNextSkuNumber()
      if (!sequenceResult.success) {
        setError(sequenceResult.error || "Failed to fetch next SKU number")
        setIsLoading(false)
        return
      }

      // Update the state with the actual number
      setNextSequentialNumber(sequenceResult.nextNumber)
      setFormattedNumber(sequenceResult.formattedNumber)
      setIsPredictedNumber(false)

      // Prepare SKUs with generated SKU IDs using the actual number
      const skusToCreate = multipleSkus.map((sku, index) => {
        const prefix = getCategoryCode(sku.category) || "OO"
        const skuId = `${prefix}-${sequenceResult.formattedNumber}`

        // 🔍 DEBUG LOGGING - Batch creation input analysis
        console.log("🔍 NewSKUSheet DEBUG - Preparing SKU for batch:", {
          index,
          skuId,
          category: sku.category,
          hasImageUrl: !!sku.imageUrl,
          hasImageFile: !!sku.imageFile,
          imageUrl: sku.imageUrl,
          fileName: sku.imageFile?.name,
          fileSize: sku.imageFile?.size,
          shouldSkipFileUpload: !!sku.imageUrl && sku.imageUrl !== "/placeholder.svg?height=80&width=80",
          finalImageValue: sku.imageUrl || "/placeholder.svg?height=80&width=80",
          note: sku.imageFile ? "File retained (upload failed/pending)" : "File cleared after successful upload"
        })

        return {
          skuId,
          name: `${sku.goldType} ${sku.category}${sku.stoneType !== STONE_TYPE.NONE ? ` with ${sku.stoneType}` : ""}`,
          category: sku.category,
          collection: sku.collection,
          size: Number(sku.size),
          goldType: sku.goldType,
          stoneType: sku.stoneType,
          diamondType: sku.diamondType,
          weight: sku.weight,
          image: sku.imageUrl || "/placeholder.svg?height=80&width=80", // Use the stored image URL
          imageFile: sku.imageFile, // Add the File object
        }
      })

      // 🔍 DEBUG LOGGING - Summary of batch creation data
      console.log("🔍 NewSKUSheet DEBUG - Final batch creation summary:", {
        totalSkus: skusToCreate.length,
        sequenceNumber: sequenceResult.formattedNumber,
        skusWithImages: skusToCreate.filter(sku => sku.imageFile).length,
        skusWithUrls: skusToCreate.filter(sku => sku.image && sku.image !== "/placeholder.svg?height=80&width=80").length,
        allSkuIds: skusToCreate.map(sku => sku.skuId)
      })

      // 🔍 DEBUG LOGGING - About to call batch creation
      console.log("🔍 NewSKUSheet DEBUG - Calling createSkuBatch with:", {
        totalSkus: skusToCreate.length,
        skusWithFiles: skusToCreate.filter(sku => sku.imageFile).length,
        skusWithUrls: skusToCreate.filter(sku => sku.image && sku.image !== "/placeholder.svg?height=80&width=80").length
      })

      // Call the batch insertion server action
      const backendResponse = await createSkuBatch(skusToCreate)

      if (backendResponse.success && backendResponse.skus) {
        console.log("SkuIDs inserted successfully via batch action!", backendResponse.skus)

        // Set the flag to indicate SKUs were created successfully
        skusCreatedRef.current = true

        backendResponse.skus.forEach((insertedSku) => {
          onSKUCreated(insertedSku)
        })

        onOpenChange(false) // Close the sheet
      } else {
        // Handle backend insertion errors
        console.error("Error creating SkuID batch:", backendResponse.error)
        setError(backendResponse.error || "Failed to create SKUs batch")
      }
    } catch (err) {
      setError("An unexpected error occurred while creating SKUs")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Width of new SKU form - matches sidebar layout with force override */}
      <SheetContent className="w-full sm:max-w-xl md:w-[calc(100vw-240px)] md:max-w-none lg:w-[calc(100vw-240px)] xl:w-[calc(100vw-240px)] overflow-y-auto force-full-width-sheet">
        <SheetHeader>
          <SheetTitle>Create New SKU</SheetTitle>
          <SheetDescription>Add a new SKU to your inventory</SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {!isLoading && (
            <div className="space-y-4">
              <Alert className="bg-blue-50">
                <AlertTitle>SKU ID Generation</AlertTitle>
                <AlertDescription>
                  {nextSequentialNumber ? (
                    <>
                      All SKUs in this batch will share the sequential number <strong>{formattedNumber}</strong>
                      {isPredictedNumber && (
                        <span className="text-muted-foreground"> (predicted based on existing SKUs)</span>
                      )}
                      . The full SKU ID will be generated based on the category (e.g., RG-{formattedNumber} for Ring).
                    </>
                  ) : (
                    "Predicting next sequential number..."
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {multipleSkus.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No.</TableHead>
                          <TableHead>SKU ID</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Gold Type</TableHead>
                          <TableHead>Stone Type</TableHead>
                          <TableHead>Collection</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {multipleSkus.map((sku, index) => {
                          const { min, max, step, unit } = getSizeConstraints(sku.category)
                          const hasSizeConstraints = min !== undefined && max !== undefined
                          const skuIdPreview = generateSkuIdPreview(sku.category)

                          return (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-mono">{skuIdPreview}</TableCell>
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
                                    //disabled={!hasSizeConstraints}
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
                                <div className="w-[150px]">
                                  <ImageUpload
                                    value={sku.imageUrl}
                                    onChange={(url, file) => handleImageChange(url, file, index)}
                                    onError={(err) => handleImageError(err, index)}
                                    tempId={`sku-temp-${index}-${Date.now()}`}
                                    skuId={skuIdPreview !== "Generating..." ? skuIdPreview : undefined}
                                    compact={true}
                                  />
                                  {uploadErrors[index] && (
                                    <p className="text-xs text-red-500 mt-1">{uploadErrors[index]}</p>
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

                                    // Remove any errors for this index
                                    if (uploadErrors[index]) {
                                      const newErrors = { ...uploadErrors }
                                      delete newErrors[index]
                                      setUploadErrors(newErrors)
                                    }
                                  }}
                                  disabled={multipleSkus.length <= 1}
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
                    You haven't added any SKUs to the set. Click "Add SKU to Set" to create multiple SKUs with the same SKU ID # (Ex: RG-2000, NK-2000).
                  </div>
                )}

                {/* Moved Add SKU to Set button below the table and centered it */}
                <div className="flex justify-center mt-4">
                  <span title="This will add another SKU type with the same SKU-ID #">
                  <Button
                    type="button"
                    onClick={() => {
                      const lastSku = multipleSkus[multipleSkus.length - 1];
                      setMultipleSkus([
                        ...multipleSkus,
                        {
                          category: "None",
                          collection: lastSku.collection, // Use collection from the last SKU
                          size: 0,
                          goldType: GOLD_TYPE.NONE, // Use goldType from the last SKU
                          stoneType: STONE_TYPE.NONE,
                          diamondType: "",
                          weight: "",
                          imageUrl: "",
                          imageFile: null,
                        },
                      ])
                    }}
                  >
                    Add SKU to Set
                  </Button>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <Button
            onClick={handleCreateSkusBatch}
            disabled={
              multipleSkus.length === 0 ||
              nextSequentialNumber === null ||
              isLoading ||
              Object.keys(uploadErrors).length > 0
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create SKU${multipleSkus.length > 1 ? "s" : ""}`
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
