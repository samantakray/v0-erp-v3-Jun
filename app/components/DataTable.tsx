"use client"

import type React from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Loader2 } from 'lucide-react' // For loading spinner
import { cn } from "@/lib/utils" // Utility for conditional classNames (common in Shadcn/UI)
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Column definition type for generic data
export type Column<T> = {
  header: string
  accessor: keyof T | string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  caption?: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  error,
  onRefresh,
  caption,
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="relative w-full rounded-lg border border-gray-200 shadow-sm bg-white">
      {/* Table Caption - MOVED INSIDE TABLE */}

      {/* Error Banner */}
      {error && (
        <div
          className="mb-4 mx-4 rounded-md bg-red-50 text-red-700 px-4 py-2 flex justify-between items-center"
          role="alert"
          aria-live="assertive"
        >
          <span>
            <strong>Error:</strong> {error}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            aria-label="Retry loading data"
            className="text-red-700 hover:text-red-900"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        {/* Caption moved inside Table component where it belongs */}
        {caption && <TableCaption className="text-gray-500 text-sm mt-2">{caption}</TableCaption>}
        
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((col) => (
              <TableHead key={col.header} className={cn("text-gray-700 font-semibold", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <div className="text-gray-500">
                  No data found.{" "}
                  {onRefresh && (
                    <Button variant="link" onClick={onRefresh} className="text-blue-600 hover:underline">
                      Try refreshing
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                {columns.map((col) => (
                  <TableCell key={col.header} className={cn("py-3", col.className)}>
                    {col.render ? col.render(row) : (row as any)[col.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination and Refresh Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        {/* Left: Page Info */}
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>

        {/* Center: Pagination Controls */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {currentPage > 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 h-auto rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs font-medium">Previous</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous Page</TooltipContent>
              </Tooltip>
            )}

            {currentPage < totalPages && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 h-auto rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                    aria-label="Go to next page"
                  >
                    <span className="text-xs font-medium">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next Page</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Right: Refresh Button */}
        {onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="flex items-center gap-1 px-3 py-1.5 h-auto rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                  aria-label="Refresh table data"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span className="text-xs font-medium">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
