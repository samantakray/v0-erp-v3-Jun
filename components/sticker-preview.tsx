"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Download, Printer } from "lucide-react"

interface StickerPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  phase: string
  data: Record<string, any>
}

export function StickerPreview({ open, onOpenChange, jobId, phase, data }: StickerPreviewProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("Sticker downloaded")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Work Sticker - {phase}</DialogTitle>
        </DialogHeader>
        <div className="p-4 border rounded-md bg-white">
          <div className="text-center mb-4 border-b pb-2">
            <h3 className="font-bold text-lg">Exquisite Fine Jewellery</h3>
            <p className="text-sm text-muted-foreground">Work Sticker</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Job ID:</span>
              <span>{jobId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phase:</span>
              <span>{phase}</span>
            </div>
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
