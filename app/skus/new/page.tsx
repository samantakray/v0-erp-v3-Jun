"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSku } from "@/app/actions/sku-actions"
import {
  SKU_CATEGORY,
  DEFAULT_SIZES,
  MIN_SIZES,
  MAX_SIZES,
  SIZE_DENOMINATIONS,
  SIZE_UNITS,
} from "@/constants/categories"

export default function NewSKUPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createMultiple, setCreateMultiple] = useState(true)
  const [category, setCategory] = useState("Necklace")
  const [size, setSize] = useState(DEFAULT_SIZES["Necklace"] ?? 0)
  const [goldType, setGoldType] = useState("Yellow Gold")
  const [stoneType, setStoneType] = useState("None")
  const [diamondType, setDiamondType] = useState("")
  const [weight, setWeight] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [multipleSkus, setMultipleSkus] = useState([])
  const [uploadErrors, setUploadErrors] = useState({})

  // Initialize with one SKU variant when the component mounts
  useEffect(() => {
    if (multipleSkus.length === 0) {
      setMultipleSkus([
        {
          category: "Necklace",
          size: DEFAULT_SIZES["Necklace"] ?? 0,
          goldType: "Yellow Gold",
          stoneType: "None",
          diamondType: "",
          weight: "",
          imageUrl: "",
        },
      ])
    }
  }, [])

  // Update size when category changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setSize(DEFAULT_SIZES[newCategory] ?? 0)
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

  // Handle image URL change for a specific SKU variant
  const handleImageUrlChange = (index, url) => {
    const newSkus = [...multipleSkus]
    newSkus[index].imageUrl = url
    setMultipleSkus(newSkus)

    // Clear any upload errors for this variant
    if (uploadErrors[index]) {
      const newErrors = { ...uploadErrors }
      delete newErrors[index]
      setUploadErrors(newErrors)
    }
  }

  // Handle image upload error for a specific SKU variant
  const handleImageError = (index, error) => {
    setUploadErrors((prev) => ({
      ...prev,
      [index]: error,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!createMultiple) {
      // For single SKU creation
      setIsSubmitting(true)

      try {
        // Generate a temporary SKU ID for the image path
        const tempSkuId = `SKU-${Date.now()}`

        // 🔍 DEBUG LOGGING - Before createSku call
        console.log("🔍 Form DEBUG - Before createSku call:", {
          imageUrl,
          tempSkuId,
          skuData: {
            name: `${category} - ${goldType}`,
            image: imageUrl,
          },
        })

        const result = await createSku(
          {
            name: `${category} - ${goldType}`, // Generate a basic name
            category,
            size: Number(size),
            goldType,
            stoneType,
            diamondType,
            weight: weight ? Number(weight) : null,
            image: imageUrl,
          },
          tempSkuId,
          // NOTE: Currently no imageFile is being passed here!
        )

        // 🔍 DEBUG LOGGING - createSku result
        console.log("🔍 Form DEBUG - createSku result:", result)

        if (!result.success) {
          throw new Error(result.error || "Failed to create SKU")
        }

        toast({
          title: "SKU Created",
          description: `Successfully created SKU: ${result.sku.sku_id}`,
        })

        router.push("/skus")
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "An unexpected error occurred",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // For multiple SKU creation, show preview first
      setShowPreview(true)
    }
  }

  const handleConfirmMultiple = async () => {
    setIsSubmitting(true)

    try {
      // Check if there are any upload errors
      if (Object.keys(uploadErrors).length > 0) {
        throw new Error("Please fix all image upload errors before continuing")
      }

      // Create all SKUs one by one
      const results = []

      for (const sku of multipleSkus) {
        // Generate a temporary SKU ID for each SKU
        const tempSkuId = `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

        // 🔍 DEBUG LOGGING - Before createSku call for multiple
        console.log("🔍 Form DEBUG - Before createSku call (multiple):", {
          imageUrl: sku.imageUrl,
          tempSkuId,
          skuData: {
            name: `${sku.category} - ${sku.goldType}`,
            image: sku.imageUrl,
          },
        })

        const result = await createSku(
          {
            name: `${sku.category} - ${sku.goldType}`, // Generate a basic name
            category: sku.category,
            size: Number(sku.size),
            goldType: sku.goldType,
            stoneType: sku.stoneType,
            diamondType: sku.diamondType,
            weight: sku.weight ? Number(sku.weight) : null,
            image: sku.imageUrl,
          },
          tempSkuId,
          // NOTE: Currently no imageFile is being passed here either!
        )

        // 🔍 DEBUG LOGGING - createSku result for multiple
        console.log("🔍 Form DEBUG - createSku result (multiple):", result)

        results.push(result)

        if (!result.success) {
          throw new Error(`Failed to create SKU: ${result.error}`)
        }
      }

      toast({
        title: "SKUs Created",
        description: `Successfully created ${results.length} SKUs`,
      })

      router.push("/skus")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get size constraints for the current category
  const { min, max, step, unit } = getSizeConstraints(category)
  const hasSizeConstraints = min !== undefined && max !== undefined

  // Check if there are any upload errors
  const hasUploadErrors = Object.keys(uploadErrors).length > 0

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <Link href="/skus">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Create New SKU</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>SKU Details</CardTitle>
          </CardHeader>
          {!showPreview ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="skuNumber">SKU Number (Auto-generated)</Label>
                    <Input id="skuNumber" value="Will be generated by the system" disabled />
                  </div>

                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createMultiple"
                        checked={createMultiple}
                        onCheckedChange={(checked) => setCreateMultiple(checked === true)}
                      />
                      <Label htmlFor="createMultiple">Create multiple SKU categories with same number</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={handleCategoryChange} disabled={createMultiple}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SKU_CATEGORY).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Item Size {unit && `(${unit})`}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="size"
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        placeholder="Enter size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        disabled={createMultiple || !hasSizeConstraints}
                      />
                      {hasSizeConstraints && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Range: {min}-{max}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goldType">Gold Type</Label>
                    <Select value={goldType} onValueChange={setGoldType} disabled={createMultiple}>
                      <SelectTrigger id="goldType">
                        <SelectValue placeholder="Select gold type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                        <SelectItem value="White Gold">White Gold</SelectItem>
                        <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stoneType">Colored Stone Type</Label>
                    <Select value={stoneType} onValueChange={setStoneType} disabled={createMultiple}>
                      <SelectTrigger id="stoneType">
                        <SelectValue placeholder="Select stone type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Rubies">Rubies</SelectItem>
                        <SelectItem value="Emeralds">Emeralds</SelectItem>
                        <SelectItem value="Sapphires">Sapphires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diamondType">Diamond Type (karat)</Label>
                    <Input
                      id="diamondType"
                      type="number"
                      step="0.01"
                      placeholder="Enter diamond karat size"
                      value={diamondType}
                      onChange={(e) => setDiamondType(e.target.value)}
                      disabled={createMultiple}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (grams)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      placeholder="Enter weight in grams"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      disabled={createMultiple}
                    />
                  </div>
                </div>

                {/* Always show the SKU Variants table */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">SKU Variants</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        setMultipleSkus([
                          ...multipleSkus,
                          {
                            category: "Necklace",
                            size: DEFAULT_SIZES["Necklace"] ?? 0,
                            goldType: "Yellow Gold",
                            stoneType: "None",
                            diamondType: "",
                            weight: "",
                            imageUrl: "",
                          },
                        ])
                      }}
                      disabled={!createMultiple}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add SKU Variant
                    </Button>
                  </div>

                  {multipleSkus.length > 0 || !createMultiple ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">No.</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Gold Type</TableHead>
                            <TableHead>Stone Type</TableHead>
                            <TableHead>Diamond (kt)</TableHead>
                            <TableHead>Weight (g)</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {createMultiple ? (
                            multipleSkus.map((sku, index) => {
                              const { min, max, step, unit } = getSizeConstraints(sku.category)
                              const hasSizeConstraints = min !== undefined && max !== undefined

                              return (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{index + 1}</TableCell>
                                  <TableCell>
                                    <Select
                                      value={sku.category}
                                      onValueChange={(value) => {
                                        const newSkus = [...multipleSkus]
                                        newSkus[index].category = value
                                        newSkus[index].size = DEFAULT_SIZES[value] ?? 0
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
                                        <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                                        <SelectItem value="White Gold">White Gold</SelectItem>
                                        <SelectItem value="Rose Gold">Rose Gold</SelectItem>
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
                                      <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="Rubies">Rubies</SelectItem>
                                        <SelectItem value="Emeralds">Emeralds</SelectItem>
                                        <SelectItem value="Sapphires">Sapphires</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={sku.diamondType}
                                      onChange={(e) => {
                                        const newSkus = [...multipleSkus]
                                        newSkus[index].diamondType = e.target.value
                                        setMultipleSkus(newSkus)
                                      }}
                                      className="w-[80px]"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={sku.weight}
                                      onChange={(e) => {
                                        const newSkus = [...multipleSkus]
                                        newSkus[index].weight = e.target.value
                                        setMultipleSkus(newSkus)
                                      }}
                                      className="w-[80px]"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="w-[120px]">
                                      <ImageUpload
                                        value={sku.imageUrl}
                                        onChange={(url) => handleImageUrlChange(index, url)}
                                        skuId={`temp-sku-${index}`}
                                        showPreview={false}
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

                                        // Clear any upload errors for this variant
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
                            })
                          ) : (
                            <TableRow>
                              <TableCell className="font-medium">1</TableCell>
                              <TableCell>
                                <Select value={category} onValueChange={handleCategoryChange}>
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
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-[80px]"
                                    placeholder="Enter size"
                                    disabled={!hasSizeConstraints}
                                  />
                                  {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select value={goldType} onValueChange={setGoldType}>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Gold Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                                    <SelectItem value="White Gold">White Gold</SelectItem>
                                    <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select value={stoneType} onValueChange={setStoneType}>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Stone Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="Rubies">Rubies</SelectItem>
                                    <SelectItem value="Emeralds">Emeralds</SelectItem>
                                    <SelectItem value="Sapphires">Sapphires</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={diamondType}
                                  onChange={(e) => setDiamondType(e.target.value)}
                                  className="w-[80px]"
                                  placeholder="Enter karat"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={weight}
                                  onChange={(e) => setWeight(e.target.value)}
                                  className="w-[80px]"
                                  placeholder="Enter weight"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="w-[120px]">
                                  <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                    skuId="temp-single-sku"
                                    showPreview={false}
                                  />
                                </div>
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-4 border rounded-md text-muted-foreground">
                      No SKU variants added. Click "Add SKU Variant" to create multiple SKUs with the same number.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" asChild>
                  <Link href="/skus">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting || hasUploadErrors}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : createMultiple && multipleSkus.length > 0 ? (
                    "Preview SKUs"
                  ) : (
                    "Create SKU"
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <div>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTitle>Preview Your SKUs</AlertTitle>
                  <AlertDescription>Review the SKUs before creating them</AlertDescription>
                </Alert>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Gold Type</TableHead>
                        <TableHead>Stone Type</TableHead>
                        <TableHead>Diamond (kt)</TableHead>
                        <TableHead>Weight (g)</TableHead>
                        <TableHead>Image</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {createMultiple ? (
                        multipleSkus.map((sku, index) => {
                          const { unit } = getSizeConstraints(sku.category)
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">[Will be generated]</TableCell>
                              <TableCell>{sku.category}</TableCell>
                              <TableCell>{sku.size ? `${sku.size}${unit ? ` ${unit}` : ""}` : "N/A"}</TableCell>
                              <TableCell>{sku.goldType}</TableCell>
                              <TableCell>{sku.stoneType}</TableCell>
                              <TableCell>{sku.diamondType || "N/A"}</TableCell>
                              <TableCell>{sku.weight || "N/A"}</TableCell>
                              <TableCell>
                                {sku.imageUrl ? (
                                  <div className="w-12 h-12 relative">
                                    <img
                                      src={sku.imageUrl || "/placeholder.svg"}
                                      alt={`${sku.category} preview`}
                                      className="w-full h-full object-cover rounded-md"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "/placeholder.svg?height=48&width=48&text=Error"
                                      }}
                                    />
                                  </div>
                                ) : (
                                  "No image"
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell className="font-medium">[Will be generated]</TableCell>
                          <TableCell>{category}</TableCell>
                          <TableCell>{size ? `${size}${unit ? ` ${unit}` : ""}` : "N/A"}</TableCell>
                          <TableCell>{goldType}</TableCell>
                          <TableCell>{stoneType}</TableCell>
                          <TableCell>{diamondType || "N/A"}</TableCell>
                          <TableCell>{weight || "N/A"}</TableCell>
                          <TableCell>
                            {imageUrl ? (
                              <div className="w-12 h-12 relative">
                                <img
                                  src={imageUrl || "/placeholder.svg"}
                                  alt="SKU preview"
                                  className="w-full h-full object-cover rounded-md"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=48&width=48&text=Error"
                                  }}
                                />
                              </div>
                            ) : (
                              "No image"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPreview(false)} disabled={isSubmitting}>
                  Back to Edit
                </Button>
                <Button onClick={handleConfirmMultiple} disabled={isSubmitting || hasUploadErrors}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating SKUs...
                    </>
                  ) : (
                    "Confirm & Create SKUs"
                  )}
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
