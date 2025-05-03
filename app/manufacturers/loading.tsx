import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
        <Skeleton className="h-6 w-[200px]" />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-7 w-[200px]" />
        </div>
        <div className="rounded-md border">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </main>
    </div>
  )
}
