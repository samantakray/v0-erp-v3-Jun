"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save } from "lucide-react"
import { SKU_CATEGORY } from "@/constants/categories"

export default function SettingsPage() {
  // Initial data for each category
  const [categories, setCategories] = useState(Object.values(SKU_CATEGORY))

  const [goldTypes, setGoldTypes] = useState(["Yellow Gold", "White Gold", "Rose Gold"])

  const [stoneTypes, setStoneTypes] = useState(["None", "Rubies", "Emeralds", "Sapphires"])

  const [diamondTypes, setDiamondTypes] = useState(["0", "0.25", "0.5", "0.75", "1.0"])

  // New item inputs
  const [newCategory, setNewCategory] = useState("")
  const [newGoldType, setNewGoldType] = useState("")
  const [newStoneType, setNewStoneType] = useState("")
  const [newDiamondType, setNewDiamondType] = useState("")

  // Add new items
  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory("")
    }
  }

  const addGoldType = () => {
    if (newGoldType && !goldTypes.includes(newGoldType)) {
      setGoldTypes([...goldTypes, newGoldType])
      setNewGoldType("")
    }
  }

  const addStoneType = () => {
    if (newStoneType && !stoneTypes.includes(newStoneType)) {
      setStoneTypes([...stoneTypes, newStoneType])
      setNewStoneType("")
    }
  }

  const addDiamondType = () => {
    if (newDiamondType && !diamondTypes.includes(newDiamondType)) {
      setDiamondTypes([...diamondTypes, newDiamondType])
      setNewDiamondType("")
    }
  }

  // Remove items
  const removeCategory = (item) => {
    setCategories(categories.filter((category) => category !== item))
  }

  const removeGoldType = (item) => {
    setGoldTypes(goldTypes.filter((goldType) => goldType !== item))
  }

  const removeStoneType = (item) => {
    setStoneTypes(stoneTypes.filter((stoneType) => stoneType !== item))
  }

  const removeDiamondType = (item) => {
    setDiamondTypes(diamondTypes.filter((diamondType) => diamondType !== item))
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="categories">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="goldTypes">Gold Types</TabsTrigger>
                <TabsTrigger value="stoneTypes">Stone Types</TabsTrigger>
                <TabsTrigger value="diamondTypes">Diamond Types</TabsTrigger>
              </TabsList>

              <TabsContent value="categories">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add new category..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button onClick={addCategory}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category Name</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category, index) => (
                          <TableRow key={index}>
                            <TableCell>{category}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeCategory(category)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="goldTypes">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add new gold type..."
                      value={newGoldType}
                      onChange={(e) => setNewGoldType(e.target.value)}
                    />
                    <Button onClick={addGoldType}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gold Type</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goldTypes.map((goldType, index) => (
                          <TableRow key={index}>
                            <TableCell>{goldType}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeGoldType(goldType)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stoneTypes">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add new stone type..."
                      value={newStoneType}
                      onChange={(e) => setNewStoneType(e.target.value)}
                    />
                    <Button onClick={addStoneType}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stone Type</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stoneTypes.map((stoneType, index) => (
                          <TableRow key={index}>
                            <TableCell>{stoneType}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeStoneType(stoneType)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="diamondTypes">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add new diamond type (karat)..."
                      value={newDiamondType}
                      onChange={(e) => setNewDiamondType(e.target.value)}
                    />
                    <Button onClick={addDiamondType}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Diamond Type (karat)</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diamondTypes.map((diamondType, index) => (
                          <TableRow key={index}>
                            <TableCell>{diamondType}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeDiamondType(diamondType)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
