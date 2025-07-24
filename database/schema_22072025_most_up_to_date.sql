
--ALL Tables and their columns 

[
  {
    "table_name": "customers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "customers",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "customers",
    "column_name": "contact_person",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "customers",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "customers",
    "column_name": "phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "customers",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true",
    "character_maximum_length": null
  },
  {
    "table_name": "customers",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "lot_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "quantity",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "weight",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'Available'::text",
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "shape",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": 10
  },
  {
    "table_name": "diamond_lots",
    "column_name": "quality",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": 10
  },
  {
    "table_name": "diamond_lots",
    "column_name": "size",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": 10
  },
  {
    "table_name": "diamond_lots",
    "column_name": "price",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "diamond_lots",
    "column_name": "stonegroup",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": 20
  },
  {
    "table_name": "diamond_lots",
    "column_name": "a_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "job_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "action",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "job_history",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "job_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "order_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "order_item_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "sku_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "manufacturer_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "production_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "due_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "current_phase",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "stone_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "diamond_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "manufacturer_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "qc_data",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "jobs",
    "column_name": "size",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "current_load",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0",
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "past_job_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0",
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "rating",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true",
    "character_maximum_length": null
  },
  {
    "table_name": "manufacturers",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "order_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "sku_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "quantity",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1",
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "size",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "remarks",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "individual_production_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "individual_delivery_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "order_items",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "order_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "order_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "customer_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "production_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "delivery_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "remarks",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "customer_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "orders",
    "column_name": "action",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "sku_id",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "category",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "size",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "gold_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "stone_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "diamond_type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "weight",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "image_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "skus",
    "column_name": "collection",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": 255
  },
  {
    "table_name": "stone_lots",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "lot_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "stone_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "quantity",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "weight",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'Available'::text",
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "shape",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "quality",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "type",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "location",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "stone_lots",
    "column_name": "stone_size",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "users",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "character_maximum_length": null
  },
  {
    "table_name": "users",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "users",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "users",
    "column_name": "role",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null,
    "character_maximum_length": null
  },
  {
    "table_name": "users",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()",
    "character_maximum_length": null
  }
]



--- primary keys

[
  {
    "table_name": "customers",
    "column_name": "id",
    "constraint_name": "customers_pkey"
  },
  {
    "table_name": "diamond_lots",
    "column_name": "id",
    "constraint_name": "diamond_lots_pkey"
  },
  {
    "table_name": "job_history",
    "column_name": "id",
    "constraint_name": "job_history_pkey"
  },
  {
    "table_name": "jobs",
    "column_name": "id",
    "constraint_name": "jobs_pkey"
  },
  {
    "table_name": "manufacturers",
    "column_name": "id",
    "constraint_name": "manufacturers_pkey"
  },
  {
    "table_name": "order_items",
    "column_name": "id",
    "constraint_name": "order_items_pkey"
  },
  {
    "table_name": "orders",
    "column_name": "id",
    "constraint_name": "orders_pkey"
  },
  {
    "table_name": "skus",
    "column_name": "id",
    "constraint_name": "skus_pkey"
  },
  {
    "table_name": "stone_lots",
    "column_name": "id",
    "constraint_name": "stone_lots_pkey"
  },
  {
    "table_name": "users",
    "column_name": "id",
    "constraint_name": "users_pkey"
  }
]
---foreign keys


[
  {
    "table_name": "order_items",
    "column_name": "order_id",
    "foreign_table_name": "orders",
    "foreign_column_name": "id"
  },
  {
    "table_name": "order_items",
    "column_name": "sku_id",
    "foreign_table_name": "skus",
    "foreign_column_name": "id"
  },
  {
    "table_name": "job_history",
    "column_name": "job_id",
    "foreign_table_name": "jobs",
    "foreign_column_name": "id"
  },
  {
    "table_name": "job_history",
    "column_name": "user_id",
    "foreign_table_name": "users",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "column_name": "manufacturer_id",
    "foreign_table_name": "manufacturers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "column_name": "order_id",
    "foreign_table_name": "orders",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "column_name": "order_item_id",
    "foreign_table_name": "order_items",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "column_name": "sku_id",
    "foreign_table_name": "skus",
    "foreign_column_name": "id"
  },
  {
    "table_name": "orders",
    "column_name": "customer_id",
    "foreign_table_name": "customers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "orders",
    "column_name": "customer_id",
    "foreign_table_name": "customers",
    "foreign_column_name": "id"
  }
]


---indexes


[
  {
    "tablename": "customers",
    "indexname": "customers_name_key",
    "indexdef": "CREATE UNIQUE INDEX customers_name_key ON public.customers USING btree (name)"
  },
  {
    "tablename": "customers",
    "indexname": "customers_pkey",
    "indexdef": "CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id)"
  },
  {
    "tablename": "diamond_lots",
    "indexname": "diamond_lots_lot_number_key",
    "indexdef": "CREATE UNIQUE INDEX diamond_lots_lot_number_key ON public.diamond_lots USING btree (lot_number)"
  },
  {
    "tablename": "diamond_lots",
    "indexname": "diamond_lots_pkey",
    "indexdef": "CREATE UNIQUE INDEX diamond_lots_pkey ON public.diamond_lots USING btree (id)"
  },
  {
    "tablename": "job_history",
    "indexname": "job_history_job_id_idx",
    "indexdef": "CREATE INDEX job_history_job_id_idx ON public.job_history USING btree (job_id)"
  },
  {
    "tablename": "job_history",
    "indexname": "job_history_pkey",
    "indexdef": "CREATE UNIQUE INDEX job_history_pkey ON public.job_history USING btree (id)"
  },
  {
    "tablename": "jobs",
    "indexname": "idx_jobs_created",
    "indexdef": "CREATE INDEX idx_jobs_created ON public.jobs USING btree (created_at DESC)"
  },
  {
    "tablename": "jobs",
    "indexname": "idx_jobs_filtering",
    "indexdef": "CREATE INDEX idx_jobs_filtering ON public.jobs USING btree (status, created_at DESC)"
  },
  {
    "tablename": "jobs",
    "indexname": "idx_jobs_order",
    "indexdef": "CREATE INDEX idx_jobs_order ON public.jobs USING btree (order_id)"
  },
  {
    "tablename": "jobs",
    "indexname": "idx_jobs_status",
    "indexdef": "CREATE INDEX idx_jobs_status ON public.jobs USING btree (status)"
  },
  {
    "tablename": "jobs",
    "indexname": "idx_pending_jobs",
    "indexdef": "CREATE INDEX idx_pending_jobs ON public.jobs USING btree (created_at) WHERE (status = 'pending'::text)"
  },
  {
    "tablename": "jobs",
    "indexname": "jobs_current_phase_idx",
    "indexdef": "CREATE INDEX jobs_current_phase_idx ON public.jobs USING btree (current_phase)"
  },
  {
    "tablename": "jobs",
    "indexname": "jobs_job_id_key",
    "indexdef": "CREATE UNIQUE INDEX jobs_job_id_key ON public.jobs USING btree (job_id)"
  },
  {
    "tablename": "jobs",
    "indexname": "jobs_order_id_idx",
    "indexdef": "CREATE INDEX jobs_order_id_idx ON public.jobs USING btree (order_id)"
  },
  {
    "tablename": "jobs",
    "indexname": "jobs_pkey",
    "indexdef": "CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id)"
  },
  {
    "tablename": "jobs",
    "indexname": "jobs_status_idx",
    "indexdef": "CREATE INDEX jobs_status_idx ON public.jobs USING btree (status)"
  },
  {
    "tablename": "manufacturers",
    "indexname": "manufacturers_name_key",
    "indexdef": "CREATE UNIQUE INDEX manufacturers_name_key ON public.manufacturers USING btree (name)"
  },
  {
    "tablename": "manufacturers",
    "indexname": "manufacturers_pkey",
    "indexdef": "CREATE UNIQUE INDEX manufacturers_pkey ON public.manufacturers USING btree (id)"
  },
  {
    "tablename": "order_items",
    "indexname": "order_items_order_id_idx",
    "indexdef": "CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id)"
  },
  {
    "tablename": "order_items",
    "indexname": "order_items_pkey",
    "indexdef": "CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id)"
  },
  {
    "tablename": "orders",
    "indexname": "orders_customer_id_idx",
    "indexdef": "CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id)"
  },
  {
    "tablename": "orders",
    "indexname": "orders_delivery_date_idx",
    "indexdef": "CREATE INDEX orders_delivery_date_idx ON public.orders USING btree (delivery_date)"
  },
  {
    "tablename": "orders",
    "indexname": "orders_order_id_key",
    "indexdef": "CREATE UNIQUE INDEX orders_order_id_key ON public.orders USING btree (order_id)"
  },
  {
    "tablename": "orders",
    "indexname": "orders_pkey",
    "indexdef": "CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id)"
  },
  {
    "tablename": "orders",
    "indexname": "orders_status_idx",
    "indexdef": "CREATE INDEX orders_status_idx ON public.orders USING btree (status)"
  },
  {
    "tablename": "skus",
    "indexname": "idx_skus_collection",
    "indexdef": "CREATE INDEX idx_skus_collection ON public.skus USING btree (collection)"
  },
  {
    "tablename": "skus",
    "indexname": "skus_category_idx",
    "indexdef": "CREATE INDEX skus_category_idx ON public.skus USING btree (category)"
  },
  {
    "tablename": "skus",
    "indexname": "skus_gold_type_idx",
    "indexdef": "CREATE INDEX skus_gold_type_idx ON public.skus USING btree (gold_type)"
  },
  {
    "tablename": "skus",
    "indexname": "skus_pkey",
    "indexdef": "CREATE UNIQUE INDEX skus_pkey ON public.skus USING btree (id)"
  },
  {
    "tablename": "skus",
    "indexname": "skus_sku_id_key",
    "indexdef": "CREATE UNIQUE INDEX skus_sku_id_key ON public.skus USING btree (sku_id)"
  },
  {
    "tablename": "skus",
    "indexname": "skus_stone_type_idx",
    "indexdef": "CREATE INDEX skus_stone_type_idx ON public.skus USING btree (stone_type)"
  },
  {
    "tablename": "stone_lots",
    "indexname": "stone_lots_lot_number_key",
    "indexdef": "CREATE UNIQUE INDEX stone_lots_lot_number_key ON public.stone_lots USING btree (lot_number)"
  },
  {
    "tablename": "stone_lots",
    "indexname": "stone_lots_pkey",
    "indexdef": "CREATE UNIQUE INDEX stone_lots_pkey ON public.stone_lots USING btree (id)"
  },
  {
    "tablename": "users",
    "indexname": "users_email_key",
    "indexdef": "CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)"
  },
  {
    "tablename": "users",
    "indexname": "users_pkey",
    "indexdef": "CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)"
  }
]

---functions 
[
  {
    "routine_name": "generate_order_id",
    "routine_definition": "\nDECLARE\n  max_id INTEGER := 0;\nBEGIN\n  -- Get the maximum existing order number\n  SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 3) AS INTEGER)), 0)\n  INTO max_id\n  FROM orders\n  WHERE order_id LIKE 'O-%';\n  \n  -- Increment the maximum ID\n  NEW.order_id := 'O-' || LPAD((max_id + 1)::TEXT, 4, '0');\n  \n  RETURN NEW;\nEND;\n"
  },
  {
    "routine_name": "generate_job_id",
    "routine_definition": "\r\nDECLARE\r\n  next_number INT;\r\nBEGIN\r\n  SELECT COUNT(*) + 1 INTO next_number FROM jobs;\r\n  NEW.job_id := 'J-' || LPAD(next_number::TEXT, 4, '0');\r\n  RETURN NEW;\r\nEND;\r\n"
  },
  {
    "routine_name": "get_next_sku_sequence_value",
    "routine_definition": "\nBEGIN\n  RETURN nextval('sku_sequential_number_seq');\nEND;\n"
  },
  {
    "routine_name": "generate_sku_id",
    "routine_definition": "\nDECLARE\n  category_prefix TEXT;\n  next_sequential_number INT;\nBEGIN\n  -- Check if the sku_id is already set in the NEW row (provided by the application)\n  IF NEW.sku_id IS NULL THEN\n    -- If sku_id is NULL, proceed with automatic generation:\n\n    -- Define category-to-prefix mapping based on the category of the new row\n    category_prefix := CASE LOWER(NEW.category) -- Convert category to lowercase for consistent matching\n      WHEN 'ring' THEN 'RG'\n      WHEN 'bangle' THEN 'BN'\n      WHEN 'bracelet' THEN 'BR'\n      WHEN 'necklace' THEN 'NK'\n      WHEN 'earring' THEN 'ER'\n      WHEN 'ball lock' THEN 'BL'\n      WHEN 'brouch' THEN 'BO'\n      WHEN 'cuff link' THEN 'CF'\n      WHEN 'chain' THEN 'CH'\n      WHEN 'extras' THEN 'EX'\n      WHEN 'tyre' THEN 'TY'\n      WHEN 'pendant' THEN 'PN'\n      WHEN 'kadi' THEN 'EX'\n      WHEN 'earring part' THEN 'EX'\n      ELSE 'OO' -- fallback: Use 'OO' for any category not explicitly mapped\n    END;\n\n    -- Get the next sequential number from the global sequence.\n    -- nextval() automatically increments the sequence and returns the new value.\n    SELECT nextval('sku_sequential_number_seq') INTO next_sequential_number;\n\n    -- Construct the new SkuID: Category Prefix + Hyphen + Sequential Number (formatted to 4 digits with leading zeros)\n    NEW.sku_id := category_prefix || '-' || LPAD(next_sequential_number::TEXT, 4, '0');\n\n    -- Optional: Log that a new ID was generated (useful for debugging)\n    -- RAISE NOTICE 'Generated new SkuID: %', NEW.sku_id;\n\n  END IF; -- End of the block that runs only if sku_id was NULL\n\n  -- Return the NEW row. This row will either have the newly generated sku_id\n  -- (if it was initially NULL) or the sku_id provided by the application.\n  RETURN NEW;\nEND;\n"
  }
]

--- triggers:

[
  {
    "trigger_name": "set_order_id",
    "event_object_table": "orders",
    "action_statement": "EXECUTE FUNCTION generate_order_id()"
  },
  {
    "trigger_name": "set_job_id",
    "event_object_table": "jobs",
    "action_statement": "EXECUTE FUNCTION generate_job_id()"
  },
  {
    "trigger_name": "set_sku_id_trigger",
    "event_object_table": "skus",
    "action_statement": "EXECUTE FUNCTION generate_sku_id()"
  }
]


--- sequences
[
  {
    "sequence_name": "sku_sequential_number_seq",
    "start_value": "50",
    "minimum_value": "1",
    "maximum_value": "9999",
    "increment": "1",
    "cycle_option": "NO"
  }
]


--- Constraints

[
  {
    "table_name": "customers",
    "constraint_name": "2200_17385_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "customers",
    "constraint_name": "2200_17385_2_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "customers",
    "constraint_name": "customers_name_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "name",
    "foreign_table_name": "customers",
    "foreign_column_name": "name"
  },
  {
    "table_name": "customers",
    "constraint_name": "customers_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "customers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "diamond_lots",
    "constraint_name": "2200_17393_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "diamond_lots",
    "constraint_name": "diamond_lots_lot_number_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "lot_number",
    "foreign_table_name": "diamond_lots",
    "foreign_column_name": "lot_number"
  },
  {
    "table_name": "diamond_lots",
    "constraint_name": "diamond_lots_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "diamond_lots",
    "foreign_column_name": "id"
  },
  {
    "table_name": "job_history",
    "constraint_name": "2200_17401_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "job_history",
    "constraint_name": "2200_17401_3_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "job_history",
    "constraint_name": "2200_17401_4_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "job_history",
    "constraint_name": "job_history_job_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "job_id",
    "foreign_table_name": "jobs",
    "foreign_column_name": "id"
  },
  {
    "table_name": "job_history",
    "constraint_name": "job_history_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "job_history",
    "foreign_column_name": "id"
  },
  {
    "table_name": "job_history",
    "constraint_name": "job_history_user_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "user_id",
    "foreign_table_name": "users",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "constraint_name": "2200_17408_10_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "jobs",
    "constraint_name": "2200_17408_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "jobs",
    "constraint_name": "2200_17408_6_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "jobs",
    "constraint_name": "jobs_job_id_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "job_id",
    "foreign_table_name": "jobs",
    "foreign_column_name": "job_id"
  },
  {
    "table_name": "jobs",
    "constraint_name": "jobs_manufacturer_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "manufacturer_id",
    "foreign_table_name": "manufacturers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "constraint_name": "jobs_order_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "order_id",
    "foreign_table_name": "orders",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "constraint_name": "jobs_order_item_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "order_item_id",
    "foreign_table_name": "order_items",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "constraint_name": "jobs_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "jobs",
    "foreign_column_name": "id"
  },
  {
    "table_name": "jobs",
    "constraint_name": "jobs_sku_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "sku_id",
    "foreign_table_name": "skus",
    "foreign_column_name": "id"
  },
  {
    "table_name": "manufacturers",
    "constraint_name": "2200_17416_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "manufacturers",
    "constraint_name": "2200_17416_2_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "manufacturers",
    "constraint_name": "manufacturers_name_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "name",
    "foreign_table_name": "manufacturers",
    "foreign_column_name": "name"
  },
  {
    "table_name": "manufacturers",
    "constraint_name": "manufacturers_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "manufacturers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "order_items",
    "constraint_name": "2200_17426_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "order_items",
    "constraint_name": "order_items_order_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "order_id",
    "foreign_table_name": "orders",
    "foreign_column_name": "id"
  },
  {
    "table_name": "order_items",
    "constraint_name": "order_items_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "order_items",
    "foreign_column_name": "id"
  },
  {
    "table_name": "order_items",
    "constraint_name": "order_items_sku_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "sku_id",
    "foreign_table_name": "skus",
    "foreign_column_name": "id"
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_17435_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_17435_3_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "orders",
    "constraint_name": "2200_17435_7_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "orders",
    "constraint_name": "fk_customer",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "customer_id",
    "foreign_table_name": "customers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "orders",
    "constraint_name": "orders_customer_id_fkey",
    "constraint_type": "FOREIGN KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "customer_id",
    "foreign_table_name": "customers",
    "foreign_column_name": "id"
  },
  {
    "table_name": "orders",
    "constraint_name": "orders_order_id_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "order_id",
    "foreign_table_name": "orders",
    "foreign_column_name": "order_id"
  },
  {
    "table_name": "orders",
    "constraint_name": "orders_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "orders",
    "foreign_column_name": "id"
  },
  {
    "table_name": "skus",
    "constraint_name": "2200_17444_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "skus",
    "constraint_name": "2200_17444_3_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "skus",
    "constraint_name": "2200_17444_4_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "skus",
    "constraint_name": "2200_17444_6_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "skus",
    "constraint_name": "2200_17444_7_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "skus",
    "constraint_name": "skus_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "skus",
    "foreign_column_name": "id"
  },
  {
    "table_name": "skus",
    "constraint_name": "skus_sku_id_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "sku_id",
    "foreign_table_name": "skus",
    "foreign_column_name": "sku_id"
  },
  {
    "table_name": "stone_lots",
    "constraint_name": "2200_17452_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "stone_lots",
    "constraint_name": "2200_17452_3_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "stone_lots",
    "constraint_name": "stone_lots_lot_number_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "lot_number",
    "foreign_table_name": "stone_lots",
    "foreign_column_name": "lot_number"
  },
  {
    "table_name": "stone_lots",
    "constraint_name": "stone_lots_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "stone_lots",
    "foreign_column_name": "id"
  },
  {
    "table_name": "users",
    "constraint_name": "2200_17460_1_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "users",
    "constraint_name": "2200_17460_2_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "users",
    "constraint_name": "2200_17460_3_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "users",
    "constraint_name": "2200_17460_4_not_null",
    "constraint_type": "CHECK",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": null,
    "foreign_table_name": null,
    "foreign_column_name": null
  },
  {
    "table_name": "users",
    "constraint_name": "users_email_key",
    "constraint_type": "UNIQUE",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "email",
    "foreign_table_name": "users",
    "foreign_column_name": "email"
  },
  {
    "table_name": "users",
    "constraint_name": "users_pkey",
    "constraint_type": "PRIMARY KEY",
    "is_deferrable": "NO",
    "initially_deferred": "NO",
    "column_name": "id",
    "foreign_table_name": "users",
    "foreign_column_name": "id"
  }
]


---Policies and Row Level Security

[
  {
    "schema_name": "public",
    "table_name": "customers",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 72} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 86 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 84}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 123} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 137 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 135}"
  },
  {
    "schema_name": "public",
    "table_name": "customers",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for customers",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 96 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "customers",
    "owner": "postgres",
    "policy_name": "Allow service role to delete customers",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 94} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 108 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 106}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "customers",
    "owner": "postgres",
    "policy_name": "Allow service role to insert customers",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 99} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 113 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 111}"
  },
  {
    "schema_name": "public",
    "table_name": "customers",
    "owner": "postgres",
    "policy_name": "Allow service role to update customers",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 94} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 108 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 106}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "diamond_lots",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 75} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 89 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 87}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 126} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 140 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 138}"
  },
  {
    "schema_name": "public",
    "table_name": "diamond_lots",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for diamond_lots",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 102 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "diamond_lots",
    "owner": "postgres",
    "policy_name": "Allow service role to delete diamond_lots",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 100} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 114 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 112}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "diamond_lots",
    "owner": "postgres",
    "policy_name": "Allow service role to insert diamond_lots",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 105} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 119 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 117}"
  },
  {
    "schema_name": "public",
    "table_name": "diamond_lots",
    "owner": "postgres",
    "policy_name": "Allow service role to update diamond_lots",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 100} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 114 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 112}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "job_history",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 74} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 88 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 86}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 125} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 139 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 137}"
  },
  {
    "schema_name": "public",
    "table_name": "job_history",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for job_history",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 100 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "job_history",
    "owner": "postgres",
    "policy_name": "Allow service role to delete job_history",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 98} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 112 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 110}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "job_history",
    "owner": "postgres",
    "policy_name": "Allow service role to insert job_history",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 103} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 117 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 115}"
  },
  {
    "schema_name": "public",
    "table_name": "job_history",
    "owner": "postgres",
    "policy_name": "Allow service role to update job_history",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 98} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 112 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 110}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "jobs",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 67} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 81 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 79}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 118} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 132 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 130}"
  },
  {
    "schema_name": "public",
    "table_name": "jobs",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for jobs",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 86 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "jobs",
    "owner": "postgres",
    "policy_name": "Allow service role to delete jobs",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 84} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 98 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 96}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "jobs",
    "owner": "postgres",
    "policy_name": "Allow service role to insert jobs",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 89} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 103 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 101}"
  },
  {
    "schema_name": "public",
    "table_name": "jobs",
    "owner": "postgres",
    "policy_name": "Allow service role to update jobs",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 84} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 98 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 96}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "manufacturers",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 76} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 90 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 88}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 127} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 141 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 139}"
  },
  {
    "schema_name": "public",
    "table_name": "manufacturers",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for manufacturers",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 104 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "manufacturers",
    "owner": "postgres",
    "policy_name": "Allow service role to delete manufacturers",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 102} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 116 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 114}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "manufacturers",
    "owner": "postgres",
    "policy_name": "Allow service role to insert manufacturers",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 107} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 121 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 119}"
  },
  {
    "schema_name": "public",
    "table_name": "manufacturers",
    "owner": "postgres",
    "policy_name": "Allow service role to update manufacturers",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 102} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 116 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 114}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "order_items",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 74} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 88 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 86}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 125} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 139 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 137}"
  },
  {
    "schema_name": "public",
    "table_name": "order_items",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for order_items",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 100 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "order_items",
    "owner": "postgres",
    "policy_name": "Allow service role to delete order_items",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 98} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 112 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 110}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "order_items",
    "owner": "postgres",
    "policy_name": "Allow service role to insert order_items",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 103} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 117 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 115}"
  },
  {
    "schema_name": "public",
    "table_name": "order_items",
    "owner": "postgres",
    "policy_name": "Allow service role to update order_items",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 98} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 112 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 110}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "orders",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 69} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 83 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 81}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 120} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 134 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 132}"
  },
  {
    "schema_name": "public",
    "table_name": "orders",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for orders",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 90 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "orders",
    "owner": "postgres",
    "policy_name": "Allow service role to delete orders",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 88} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 102 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 100}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "orders",
    "owner": "postgres",
    "policy_name": "Allow service role to insert orders",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 93} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 107 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 105}"
  },
  {
    "schema_name": "public",
    "table_name": "orders",
    "owner": "postgres",
    "policy_name": "Allow service role to update orders",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 88} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 102 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 100}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "skus",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 67} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 81 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 79}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 118} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 132 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 130}"
  },
  {
    "schema_name": "public",
    "table_name": "skus",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for skus",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 86 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "skus",
    "owner": "postgres",
    "policy_name": "Allow service role to delete skus",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 84} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 98 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 96}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "skus",
    "owner": "postgres",
    "policy_name": "Allow service role to insert skus",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 89} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 103 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 101}"
  },
  {
    "schema_name": "public",
    "table_name": "skus",
    "owner": "postgres",
    "policy_name": "Allow service role to update skus",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 84} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 98 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 96}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "stone_lots",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 73} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 87 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 85}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 124} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 138 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 136}"
  },
  {
    "schema_name": "public",
    "table_name": "stone_lots",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for stone_lots",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 98 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "stone_lots",
    "owner": "postgres",
    "policy_name": "Allow service role to delete stone_lots",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 96} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 110 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 108}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "stone_lots",
    "owner": "postgres",
    "policy_name": "Allow service role to insert stone_lots",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 101} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 115 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 113}"
  },
  {
    "schema_name": "public",
    "table_name": "stone_lots",
    "owner": "postgres",
    "policy_name": "Allow service role to update stone_lots",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 96} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 110 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 108}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "users",
    "owner": "postgres",
    "policy_name": "Allow all for authenticated",
    "polpermissive": true,
    "cmd": "*",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 68} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 82 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 80}",
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 119} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 133 :constvalue 17 [ 68 0 0 0 97 117 116 104 101 110 116 105 99 97 116 101 100 ]}) :location 131}"
  },
  {
    "schema_name": "public",
    "table_name": "users",
    "owner": "postgres",
    "policy_name": "Allow anonymous read access for users",
    "polpermissive": true,
    "cmd": "r",
    "using_expression": "{CONST :consttype 16 :consttypmod -1 :constcollid 0 :constlen 1 :constbyval true :constisnull false :location 88 :constvalue 1 [ 1 0 0 0 0 0 0 0 ]}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "users",
    "owner": "postgres",
    "policy_name": "Allow service role to delete users",
    "polpermissive": true,
    "cmd": "d",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 86} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 100 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 98}",
    "with_check_expression": null
  },
  {
    "schema_name": "public",
    "table_name": "users",
    "owner": "postgres",
    "policy_name": "Allow service role to insert users",
    "polpermissive": true,
    "cmd": "a",
    "using_expression": null,
    "with_check_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 91} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 105 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 103}"
  },
  {
    "schema_name": "public",
    "table_name": "users",
    "owner": "postgres",
    "policy_name": "Allow service role to update users",
    "polpermissive": true,
    "cmd": "w",
    "using_expression": "{OPEXPR :opno 98 :opfuncid 67 :opresulttype 16 :opretset false :opcollid 0 :inputcollid 100 :args ({FUNCEXPR :funcid 17248 :funcresulttype 25 :funcretset false :funcvariadic false :funcformat 0 :funccollid 100 :inputcollid 0 :args <> :location 86} {CONST :consttype 25 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 100 :constvalue 16 [ 64 0 0 0 115 101 114 118 105 99 101 95 114 111 108 101 ]}) :location 98}",
    "with_check_expression": null
  }
]