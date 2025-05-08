// ./lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"
import { logger } from "./logger"

// Create a single supabase client for browser-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a wrapped client with logging
function createLoggingClient(url: string, key: string, isServiceClient = false) {
  const client = createClient(url, key)

  // Log the initialization
  logger.info(`Supabase client initialized`, {
    data: {
      url,
      type: isServiceClient ? "service_role" : "anon",
      hasKey: !!key,
    },
  })

  // Wrap the client methods with logging
  const originalFrom = client.from.bind(client)

  client.from = (table: string) => {
    logger.debug(`Accessing table: ${table}`)

    const queryBuilder = originalFrom(table)
    const originalSelect = queryBuilder.select.bind(queryBuilder)
    const originalInsert = queryBuilder.insert.bind(queryBuilder)
    const originalUpdate = queryBuilder.update.bind(queryBuilder)
    const originalDelete = queryBuilder.delete.bind(queryBuilder)

    // Wrap select with logging
    queryBuilder.select = (columns: any) => {
      const startTime = performance.now()
      logger.debug(`SELECT operation initiated on ${table}`, { data: { columns } })

      const query = originalSelect(columns)
      const originalThen = query.then.bind(query)

      query.then = (onfulfilled, onrejected) =>
        originalThen(
          (result) => {
            const duration = performance.now() - startTime
            logger.info(`SELECT operation completed on ${table}`, {
              data: {
                count: result.data?.length || 0,
                hasError: !!result.error,
                columns,
              },
              error: result.error,
              duration,
            })
            return onfulfilled ? onfulfilled(result) : result
          },
          (error) => {
            const duration = performance.now() - startTime
            logger.error(`SELECT operation failed on ${table}`, {
              data: { columns },
              error,
              duration,
            })
            return onrejected ? onrejected(error) : Promise.reject(error)
          },
        )

      return query
    }

    // Wrap insert with logging
    queryBuilder.insert = (values: any, options: any) => {
      const startTime = performance.now()
      logger.debug(`INSERT operation initiated on ${table}`, {
        data: {
          recordCount: Array.isArray(values) ? values.length : 1,
          options,
        },
      })

      const query = originalInsert(values, options)
      const originalThen = query.then.bind(query)

      query.then = (onfulfilled, onrejected) =>
        originalThen(
          (result) => {
            const duration = performance.now() - startTime
            logger.info(`INSERT operation completed on ${table}`, {
              data: {
                count: result.data?.length || 0,
                hasError: !!result.error,
                options,
              },
              error: result.error,
              duration,
            })
            return onfulfilled ? onfulfilled(result) : result
          },
          (error) => {
            const duration = performance.now() - startTime
            logger.error(`INSERT operation failed on ${table}`, {
              data: {
                recordCount: Array.isArray(values) ? values.length : 1,
                options,
              },
              error,
              duration,
            })
            return onrejected ? onrejected(error) : Promise.reject(error)
          },
        )

      return query
    }

    // Wrap update with logging
    queryBuilder.update = (values: any, options: any) => {
      const startTime = performance.now()
      logger.debug(`UPDATE operation initiated on ${table}`, {
        data: { values, options },
      })

      const query = originalUpdate(values, options)
      const originalThen = query.then.bind(query)

      query.then = (onfulfilled, onrejected) =>
        originalThen(
          (result) => {
            const duration = performance.now() - startTime
            logger.info(`UPDATE operation completed on ${table}`, {
              data: {
                count: result.data?.length || 0,
                hasError: !!result.error,
                options,
              },
              error: result.error,
              duration,
            })
            return onfulfilled ? onfulfilled(result) : result
          },
          (error) => {
            const duration = performance.now() - startTime
            logger.error(`UPDATE operation failed on ${table}`, {
              data: { values, options },
              error,
              duration,
            })
            return onrejected ? onrejected(error) : Promise.reject(error)
          },
        )

      return query
    }

    // Wrap delete with logging
    queryBuilder.delete = (options: any) => {
      const startTime = performance.now()
      logger.debug(`DELETE operation initiated on ${table}`, {
        data: { options },
      })

      const query = originalDelete(options)
      const originalThen = query.then.bind(query)

      query.then = (onfulfilled, onrejected) =>
        originalThen(
          (result) => {
            const duration = performance.now() - startTime
            logger.info(`DELETE operation completed on ${table}`, {
              data: {
                count: result.data?.length || 0,
                hasError: !!result.error,
                options,
              },
              error: result.error,
              duration,
            })
            return onfulfilled ? onfulfilled(result) : result
          },
          (error) => {
            const duration = performance.now() - startTime
            logger.error(`DELETE operation failed on ${table}`, {
              data: { options },
              error,
              duration,
            })
            return onrejected ? onrejected(error) : Promise.reject(error)
          },
        )

      return query
    }

    return queryBuilder
  }

  return client
}

// Export the wrapped clients
export const supabase = createLoggingClient(supabaseUrl, supabaseAnonKey)

// Create a service role client for server-side operations that need elevated permissions
export const createServiceClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  return createLoggingClient(supabaseUrl, supabaseServiceKey, true)
}
