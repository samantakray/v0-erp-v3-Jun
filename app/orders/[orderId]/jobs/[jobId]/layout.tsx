"use client"

import { createContext, useContext, type ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"

export const JobContext = createContext<any>(null)
export function useJob() {
  return useContext(JobContext)
}

export default async function JobLayout({
  params,
  children,
}: {
  params: { jobId: string; orderId: string }
  children: ReactNode
}) {
  const { data: job, error } = await supabase.from("jobs").select("*").eq("id", params.jobId).single()

  if (error || !job) throw new Error("Job not found")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <JobContext.Provider value={job}>{children}</JobContext.Provider>
      </div>
    </div>
  )
}
