import { createClient } from "@supabase/supabase-js"
import { mockOrders, mockSkus, mockJobs } from "../lib/mock-data"

// This script is meant to be run locally to migrate mock data to Supabase
// Run with: npx tsx scripts/migrate-mock-data.ts

async function migrateData() {
  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("Starting migration of mock data to Supabase...")

  try {
    // Migrate SKUs
    console.log("Migrating SKUs...")
    for (const sku of mockSkus) {
      const { error } = await supabase.from("skus").insert({
        sku_id: sku.id,
        name: sku.name,
        category: sku.category,
        gold_type: sku.goldType,
        stone_type: sku.stoneType,
        diamond_type: sku.diamondType,
        image_url: sku.image,
        created_at: sku.createdAt || new Date().toISOString(),
      })

      if (error) {
        console.error(`Error migrating SKU ${sku.id}:`, error)
      } else {
        console.log(`Migrated SKU ${sku.id}`)
      }
    }

    // Migrate Orders
    console.log("Migrating Orders...")
    const skuIdToUuidMap = new Map()
    const orderIdToUuidMap = new Map()

    // Get SKU UUIDs
    const { data: skuData } = await supabase.from("skus").select("id, sku_id")
    if (skuData) {
      for (const sku of skuData) {
        skuIdToUuidMap.set(sku.sku_id, sku.id)
      }
    }

    for (const order of mockOrders) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_id: order.id,
          order_type: order.orderType,
          customer_name: order.customerName,
          production_date: order.productionDate,
          delivery_date: order.dueDate,
          status: order.status,
          remarks: order.remarks,
          created_at: order.createdAt || new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error(`Error migrating Order ${order.id}:`, error)
      } else {
        console.log(`Migrated Order ${order.id}`)

        // Store order UUID for later use
        if (data && data.length > 0) {
          orderIdToUuidMap.set(order.id, data[0].id)

          // Migrate order items
          for (const sku of order.skus) {
            const skuUuid = skuIdToUuidMap.get(sku.id)
            if (skuUuid) {
              const { error: itemError } = await supabase.from("order_items").insert({
                order_id: data[0].id,
                sku_id: skuUuid,
                quantity: sku.quantity || 1,
                size: sku.size,
                remarks: sku.remarks,
              })

              if (itemError) {
                console.error(`Error migrating Order Item ${order.id}-${sku.id}:`, itemError)
              } else {
                console.log(`Migrated Order Item ${order.id}-${sku.id}`)
              }
            }
          }
        }
      }
    }

    // Migrate Jobs
    console.log("Migrating Jobs...")
    for (const job of mockJobs) {
      const orderUuid = orderIdToUuidMap.get(job.orderId)
      const skuUuid = skuIdToUuidMap.get(job.skuId)

      if (orderUuid && skuUuid) {
        const { error } = await supabase.from("jobs").insert({
          job_id: job.id,
          order_id: orderUuid,
          sku_id: skuUuid,
          size: job.size,
          status: job.status,
          current_phase: job.currentPhase,
          production_date: job.productionDate,
          due_date: job.dueDate,
          stone_data: job.stoneData,
          diamond_data: job.diamondData,
          manufacturer_data: job.manufacturerData,
          qc_data: job.qcData,
          created_at: job.createdAt || new Date().toISOString(),
        })

        if (error) {
          console.error(`Error migrating Job ${job.id}:`, error)
        } else {
          console.log(`Migrated Job ${job.id}`)
        }
      } else {
        console.error(`Missing order or SKU UUID for Job ${job.id}`)
      }
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Unexpected error during migration:", error)
  }
}

migrateData()
