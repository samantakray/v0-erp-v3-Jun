import type { Job } from "@/types"
import { JOB_STATUS, JOB_PHASE } from "@/constants/job-workflow"

// Import orders and skus to generate jobs
import { orders } from "./orders"
import { skus } from "./skus"

// Generate jobs based on orders
const generateJobsForOrder = (orderId: string, skusInOrder: any[], orderStatus: string): Job[] => {
  const jobs: Job[] = []

  // Special case for Order O10002 - create 10 jobs with different statuses
  if (orderId === "O10002") {
    // Get the 2 SKUs in this order
    const orderSkus = skusInOrder.slice(0, 2)

    // Define all the statuses we want to use (excluding QC Failed)
    const allStatuses = [
      JOB_STATUS.NEW,
      JOB_STATUS.BAG_CREATED,
      JOB_STATUS.STONE_SELECTED,
      JOB_STATUS.DIAMOND_SELECTED,
      JOB_STATUS.IN_PRODUCTION,
      JOB_STATUS.QC_PASSED,
      JOB_STATUS.COMPLETED,
      JOB_STATUS.STONE_SELECTED, // Duplicate some statuses to get to 10
      JOB_STATUS.DIAMOND_SELECTED,
      JOB_STATUS.IN_PRODUCTION,
    ]

    // Create 5 jobs for each of the 2 SKUs
    let jobCounter = 0

    orderSkus.forEach((sku, skuIndex) => {
      // Find matching SKU details from skus.ts
      const skuDetails = skus.find((s) => s.id === sku.id)

      for (let itemIndex = 0; itemIndex < 5; itemIndex++) {
        const jobId = `J${orderId.substring(1)}-${skuIndex + 1}-${itemIndex + 1}`
        const currentStatus = allStatuses[jobCounter]

        // Determine the current phase based on the status
        let currentPhase = JOB_PHASE.STONE
        if (currentStatus === JOB_STATUS.STONE_SELECTED || currentStatus === JOB_STATUS.BAG_CREATED) {
          currentPhase = JOB_PHASE.DIAMOND
        } else if (currentStatus === JOB_STATUS.DIAMOND_SELECTED) {
          currentPhase = JOB_PHASE.MANUFACTURER
        } else if (currentStatus === JOB_STATUS.IN_PRODUCTION) {
          currentPhase = JOB_PHASE.QUALITY_CHECK
        } else if (currentStatus === JOB_STATUS.QC_PASSED || currentStatus === JOB_STATUS.COMPLETED) {
          currentPhase = JOB_PHASE.COMPLETE
        }

        // Determine manufacturer based on status
        const manufacturer =
          currentStatus === JOB_STATUS.IN_PRODUCTION ||
          currentStatus === JOB_STATUS.QC_PASSED ||
          currentStatus === JOB_STATUS.COMPLETED
            ? "Jewelry Crafters Inc."
            : "Pending"

        jobs.push({
          id: jobId,
          orderId: orderId,
          skuId: sku.id,
          name: sku.name,
          category: skuDetails?.category || "Unknown",
          goldType: skuDetails?.goldType || "Yellow Gold",
          stoneType: skuDetails?.stoneType || "None",
          diamondType: skuDetails?.diamondType || "0",
          size: sku.size,
          status: currentStatus,
          manufacturer: manufacturer,
          productionDate: "2025-05-03",
          dueDate: "2025-05-10",
          createdAt: "2025-04-25",
          image: sku.image,
          currentPhase: currentPhase,
        })

        jobCounter++
      }
    })

    return jobs
  }

  // Regular job generation for other orders
  skusInOrder.forEach((sku, skuIndex) => {
    // Find matching SKU details from skus.ts
    const skuDetails = skus.find((s) => s.id === sku.id)

    for (let itemIndex = 0; itemIndex < sku.quantity; itemIndex++) {
      const jobId = `J${orderId.substring(1)}-${skuIndex + 1}-${itemIndex + 1}`

      // Default job attributes
      let jobStatus = JOB_STATUS.NEW
      let currentPhase = JOB_PHASE.STONE
      let manufacturer = "Pending"

      // Set job status based on order status
      if (orderStatus === "New") {
        jobStatus = JOB_STATUS.NEW
        currentPhase = JOB_PHASE.STONE
        manufacturer = "Pending"
      } else if (orderStatus === "Pending") {
        // For Pending, make the first SKU's jobs have an intermediate status
        jobStatus = skuIndex === 0 ? JOB_STATUS.STONE_SELECTED : JOB_STATUS.NEW
        currentPhase = skuIndex === 0 ? JOB_PHASE.DIAMOND : JOB_PHASE.STONE
        manufacturer = "Pending"
      } else if (orderStatus === "Completed") {
        jobStatus = JOB_STATUS.COMPLETED
        currentPhase = JOB_PHASE.COMPLETE
        manufacturer = "Jewelry Crafters Inc."
      }

      jobs.push({
        id: jobId,
        orderId: orderId,
        skuId: sku.id,
        name: sku.name,
        category: skuDetails?.category || "Unknown",
        goldType: skuDetails?.goldType || "Yellow Gold",
        stoneType: skuDetails?.stoneType || "None",
        diamondType: skuDetails?.diamondType || "0",
        size: sku.size,
        status: jobStatus,
        manufacturer: manufacturer,
        productionDate: orderStatus === "Completed" ? "2025-04-21" : "2025-05-03",
        dueDate: orderStatus === "Completed" ? "2025-04-28" : "2025-05-10",
        createdAt: orderStatus === "Completed" ? "2025-04-14" : "2025-04-25",
        image: sku.image,
        currentPhase: currentPhase,
      })
    }
  })

  return jobs
}

// Create jobs for each order
export const jobsByOrder: Record<string, Job[]> = {}

orders.forEach((order) => {
  jobsByOrder[order.id] = generateJobsForOrder(order.id, order.skus, order.status)
})

// Flatten jobs for a single array
export const jobs: Job[] = Object.values(jobsByOrder).flat()
