"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { JOB_STATUS } from "@/constants/job-workflow"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Job } from "@/types"

interface JobContextProps {
  job: Job
  status: string
}

export function JobContext({ job, status }: JobContextProps) {
  // Determine which section to highlight based on job status
  const isNewJob = status === JOB_STATUS.NEW
  const isBagCreated = status === JOB_STATUS.BAG_CREATED
  const isStoneSelected = status === JOB_STATUS.STONE_SELECTED
  const isDiamondSelected = status === JOB_STATUS.DIAMOND_SELECTED

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF or CSV
    console.log("Downloading job details...")
    alert("Job details would be downloaded here")
  }

  const handlePrint = () => {
    // In a real app, this would open a print dialog
    console.log("Printing job details...")
    window.print()
  }

  // Sample data for new job detailed view
  // In a real app, this would come from the job object or be fetched from an API
  const metalWeightData = {
    gWeight: "12.5g",
    nWeight: "10.2g",
    dWeight: "2.3g",
    csWeight: "0.5g",
    otherMetalWeight: "0.3g",
  }

  const issueReturnData = [
    {
      process: "Setting",
      worker: "John Smith",
      issueDateTime: "2023-10-15 09:30",
      issueGWeight: "12.5g",
      issueNWeight: "10.2g",
      issueEXWeight: "2.3g",
      returnDateTime: "2023-10-17 14:45",
      returnGWeight: "12.4g",
      returnNWeight: "10.1g",
      scrap: "0.1g",
      loss: "0.1g",
      remark: "Clean work",
    },
    {
      process: "Polishing",
      worker: "Alice Johnson",
      issueDateTime: "2023-10-17 15:00",
      issueGWeight: "12.4g",
      issueNWeight: "10.1g",
      issueEXWeight: "2.3g",
      returnDateTime: "2023-10-18 16:30",
      returnGWeight: "12.3g",
      returnNWeight: "10.0g",
      scrap: "0.1g",
      loss: "0.1g",
      remark: "Minor scratches",
    },
  ]

  const diamondDetailsData = [
    {
      date: "2023-10-15",
      ssku: "D001",
      stone: "Diamond",
      shape: "Round",
      quality: "VS",
      color: "F",
      size: "2mm",
      pcs: 12,
      wt: "0.24ct",
      rPcs: 12,
      rtnWt: "0.24ct",
      brkPcs: 0,
      brkWt: "0ct",
      losPcs: 0,
      losWt: "0ct",
      usePcs: 12,
      useWt: "0.24ct",
      sType: "Natural",
    },
    {
      date: "2023-10-15",
      ssku: "D002",
      stone: "Diamond",
      shape: "Princess",
      quality: "SI1",
      color: "G",
      size: "3mm",
      pcs: 4,
      wt: "0.32ct",
      rPcs: 4,
      rtnWt: "0.32ct",
      brkPcs: 0,
      brkWt: "0ct",
      losPcs: 0,
      losWt: "0ct",
      usePcs: 4,
      useWt: "0.32ct",
      sType: "Natural",
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Job Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
        {/* Show large SKU image for all statuses except New Job */}
        {!isNewJob && (
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 rounded-md overflow-hidden">
              <img src={job.image || "/placeholder.svg"} alt={job.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {isNewJob ? (
          <div className="space-y-6">
            {/* Summary row with key job details */}
            <div className="bg-muted p-3 rounded-md">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Job ID:</p>
                  <p>{job.id}</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <Badge variant="outline">{status}</Badge>
                </div>
                <div>
                  <p className="font-semibold">Created:</p>
                  <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* 1. Order Information Section */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">1. Order Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Type</p>
                  <p className="font-medium">{job.orderType || "Customer"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(job.orderDate || job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Party Code</p>
                  <p className="font-medium">{job.partyCode || "PC-" + job.id.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Karat</p>
                  <p className="font-medium">{job.goldType || "18K"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Design Instructions</p>
                  <p className="font-medium">{job.designInstructions || "As per sample"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Customer Instructions</p>
                  <p className="font-medium">{job.customerInstructions || "None provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stamp</p>
                  <p className="font-medium">{job.stamp || "Standard"}</p>
                </div>
              </div>
            </div>

            {/* 2. Style & Delivery Details */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">2. Style & Delivery Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Style Code</p>
                  <p className="font-medium">{job.styleCode || job.skuId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Date</p>
                  <p className="font-medium">{new Date(job.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate</p>
                  <p className="font-medium">{job.certificate || "Standard"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{job.size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Colour</p>
                  <p className="font-medium">{job.color || "Yellow Gold"}</p>
                </div>
              </div>
            </div>

            {/* 3. Bag & Piece Details */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">3. Bag & Piece Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Bag No.</p>
                  <p className="font-medium">{job.bagNo || "Pending"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stamping</p>
                  <p className="font-medium">{job.stamping || "Required"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ref ID</p>
                  <p className="font-medium">{job.refId || "REF-" + job.id.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pieces</p>
                  <p className="font-medium">{job.pieces || "1"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rhodium</p>
                  <p className="font-medium">{job.rhodium || "No"}</p>
                </div>
              </div>
            </div>

            {/* 4. Metal Weight Summary */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">4. Metal Weight Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">G-Wt.</p>
                  <p className="font-medium">{metalWeightData.gWeight}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">N-Wt.</p>
                  <p className="font-medium">{metalWeightData.nWeight}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">D-Wt.</p>
                  <p className="font-medium">{metalWeightData.dWeight}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cs-Wt.</p>
                  <p className="font-medium">{metalWeightData.csWeight}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">O.Mtl Wt.</p>
                  <p className="font-medium">{metalWeightData.otherMetalWeight}</p>
                </div>
              </div>
            </div>

            {/* 5. Issue & Return Table */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">5. Issue & Return Table</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">PROCESS</TableHead>
                      <TableHead>WORKER</TableHead>
                      <TableHead>ISSUE DT/TIME</TableHead>
                      <TableHead>ISSUE G-Wt.</TableHead>
                      <TableHead>ISSUE N-Wt.</TableHead>
                      <TableHead>ISSUE EX-Wt.</TableHead>
                      <TableHead>RETURN DT/TIME</TableHead>
                      <TableHead>RETURN G-Wt.</TableHead>
                      <TableHead>RETURN N-Wt.</TableHead>
                      <TableHead>SCRAP</TableHead>
                      <TableHead>LOSS</TableHead>
                      <TableHead>REMARK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issueReturnData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.process}</TableCell>
                        <TableCell>{item.worker}</TableCell>
                        <TableCell>{item.issueDateTime}</TableCell>
                        <TableCell>{item.issueGWeight}</TableCell>
                        <TableCell>{item.issueNWeight}</TableCell>
                        <TableCell>{item.issueEXWeight}</TableCell>
                        <TableCell>{item.returnDateTime}</TableCell>
                        <TableCell>{item.returnGWeight}</TableCell>
                        <TableCell>{item.returnNWeight}</TableCell>
                        <TableCell>{item.scrap}</TableCell>
                        <TableCell>{item.loss}</TableCell>
                        <TableCell>{item.remark}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 6. Diamond Details Table */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">6. Diamond Details Table</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>SSKU</TableHead>
                      <TableHead>Stone</TableHead>
                      <TableHead>Shape</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Pcs</TableHead>
                      <TableHead>Wt</TableHead>
                      <TableHead>R-Pcs</TableHead>
                      <TableHead>RtnWt</TableHead>
                      <TableHead>BrkPcs</TableHead>
                      <TableHead>BrkWt</TableHead>
                      <TableHead>Los Pcs</TableHead>
                      <TableHead>Los Wt</TableHead>
                      <TableHead>Use Pcs</TableHead>
                      <TableHead>Use Wt</TableHead>
                      <TableHead>S-Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diamondDetailsData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.ssku}</TableCell>
                        <TableCell>{item.stone}</TableCell>
                        <TableCell>{item.shape}</TableCell>
                        <TableCell>{item.quality}</TableCell>
                        <TableCell>{item.color}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.pcs}</TableCell>
                        <TableCell>{item.wt}</TableCell>
                        <TableCell>{item.rPcs}</TableCell>
                        <TableCell>{item.rtnWt}</TableCell>
                        <TableCell>{item.brkPcs}</TableCell>
                        <TableCell>{item.brkWt}</TableCell>
                        <TableCell>{item.losPcs}</TableCell>
                        <TableCell>{item.losWt}</TableCell>
                        <TableCell>{item.usePcs}</TableCell>
                        <TableCell>{item.useWt}</TableCell>
                        <TableCell>{item.sType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 7. Totals */}
            <div className="bg-card border rounded-md p-4">
              <h3 className="text-base font-semibold mb-3">7. Totals</h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">TOTAL (Pcs)</p>
                  <p className="font-medium text-lg">16</p>
                </div>
                <div>
                  <p className="text-muted-foreground">TOTAL (Wt.)</p>
                  <p className="font-medium text-lg">0.56ct</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Details */}
            <div>
              <h3 className="text-md font-semibold mb-2">Job Details</h3>
              <div className="space-y-1 text-sm">
                <p>Job ID: {job.id}</p>
                <p>Order ID: {job.orderId}</p>
                <p>
                  Status: <Badge variant="outline">{status}</Badge>
                </p>
              </div>
            </div>

            {/* SKU Information */}
            <div>
              <h3 className="text-md font-semibold mb-2">SKU Information</h3>
              <div className="space-y-1 text-sm">
                <p>Name: {job.name}</p>
                <p>SKU ID: {job.skuId}</p>
                <p>Category: {job.category}</p>
              </div>
            </div>

            {/* Material Details */}
            <div>
              <h3 className="text-md font-semibold mb-2">Material Details</h3>
              <div className="space-y-1 text-sm">
                <p>Gold Type: {job.goldType}</p>

                {/* Highlight stone type if status is Bag Created */}
                <p className={isBagCreated ? "font-bold text-primary" : ""}>
                  Stone Type: {job.stoneType || "N/A"}
                  {isBagCreated && <Badge className="ml-2">Required</Badge>}
                </p>

                {/* Highlight diamond type if status is Stone Selected */}
                <p className={isStoneSelected ? "font-bold text-primary" : ""}>
                  Diamond Type: {job.diamondType || "N/A"}
                  {isStoneSelected && <Badge className="ml-2">Required</Badge>}
                </p>

                <p>Size: {job.size}</p>
              </div>
            </div>

            {/* Production Information */}
            <div>
              <h3 className="text-md font-semibold mb-2">Production Information</h3>
              <div className="space-y-1 text-sm">
                <p>Due Date: {new Date(job.dueDate).toLocaleDateString()}</p>
                {isDiamondSelected && <p>Manufacturer: Pending Selection</p>}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Show download and print buttons only for New Job */}
      {isNewJob && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
