"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Job } from "@/types"

// Create the Job Context with null default
// This will hold the job data fetched from the server component
export const JobContext = createContext<Job | null>(null)

// Custom hook for consuming job context with proper error handling
// This ensures useJob is only used within a JobContextProvider
export function useJob() {
  const context = useContext(JobContext)
  if (context === null) {
    throw new Error("useJob must be used within a JobContextProvider")
  }
  return context
}

// Provider component that wraps children with job context
// This receives job data from the server component and provides it to all children
export function JobContextProvider({ 
  job, 
  children 
}: { 
  job: Job
  children: ReactNode 
}) {
  return (
    <JobContext.Provider value={job}>
      {children}
    </JobContext.Provider>
  )
} 