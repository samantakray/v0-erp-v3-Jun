
export const SKU_CATEGORY = {
  NONE: "None",
  NECKLACE: "Necklace",
  BANGLE: "Bangle",
  RING: "Ring",
  EARRING: "Earring",
  PENDANT: "Pendant",
  BALL_LOCK: "Ball Lock",
  BROUCH: "Brouch",
  BRACELET: "Bracelet",
  CUFF_LINK: "Cuff Link",
  CHAIN: "Chain",
  EXTRAS: "Extras",
  TYRE: "Tyre",
  KADI: "Kadi",
  EARRING_PART: "Earring Part",
} as const

export type SkuCategory = (typeof SKU_CATEGORY)[keyof typeof SKU_CATEGORY]

// Collection names constant
export const COLLECTION_NAME = {
  NONE: "None",
ART_CARVED: "Art Carved",
AZULIK: "Azulik",
CARNIVAL: "Carnival",
CARNIVAL_BUNCH: "Carnival Bunch",
CATERPILLAR: "Caterpillar",
CHAKRA: "Chakra",
CLOVER: "Clover",
CRESCENT: "Crescent",
DECO_CHIC: "Deco Chic",
EMBRACE: "Embrace",
ETERNITY: "Eternity",
FLORAL: "Floral",
FLORAL_SYMPHONY: "Floral Symphony",
GEM_LACES: "Gem Laces",
JAIPORE: "Jaipore",
KALEIDOSCOPE: "Kaleidoscope",
MIDNIGHT: "Midnight",
MONACO: "Monaco",
PADMA: "Padma",
PEACOCK: "Peacock",
PEBBLES: "Pebbles",
PRISM_PERFECTION: "Prism Perfection",
RATAN: "Ratan",
ROCK_CANDY: "Rock Candy",
ROYAL: "Royal",
SUMMER: "Summer",
TALISMAN: "Talisman",
TUTTI_FRUTTI: "Tutti Frutti",


} as const

export type CollectionName = (typeof COLLECTION_NAME)[keyof typeof COLLECTION_NAME]

// Gold types constant
export const GOLD_TYPE = {
  YELLOW_GOLD: "Yellow Gold",
  WHITE_GOLD: "White Gold",
  ROSE_GOLD: "Rose Gold",
  NONE: "None",
} as const

// Gold type codes for reference (not stored in database)
export const GOLD_TYPE_CODES = {
  [GOLD_TYPE.YELLOW_GOLD]: "18KYG",
  [GOLD_TYPE.WHITE_GOLD]: "18KWG",
  [GOLD_TYPE.ROSE_GOLD]: "18KRG",
  [GOLD_TYPE.NONE]: "n/a",
} as const

export type GoldType = (typeof GOLD_TYPE)[keyof typeof GOLD_TYPE]

// Stone types constant
export const STONE_TYPE = {
  NONE: "None",
  AKOYA_PEARL: "Akoya Pearl",
  AMAZONITE: "Amazonite",
  AMETHYST: "Amethyst",
  APATITE: "Apatite",
  AQUAMARINE: "Aquamarine",
  BEER_QUARTZ: "Beer Quartz",
  BLACK_JASPER: "Black Jasper",
  BLACK_ONYX: "Black Onyx",
  BLUE_CHALCEDONY: "Blue Chalcedony",
  BLUE_KYANITE: "Blue Kyanite",
  AUSTRIAN_BLUE_OPAL: "Austrian Blue Opal",
  BLUE_SAPPHIRE: "Blue Sapphire",
  BLUE_TOPAZ: "Blue Topaz",
  CAMEL_JASPER: "Camel Jasper",
  CARNELIAN: "Carnelian",
  CHAMPAGNE_QUARTZ: "Champagne Quartz",
  CHRYSOPRASE: "Chrysoprase",
  CITRINE: "Citrine",
  CORAL: "Coral",
  CRYSTAL: "Crystal",
  CULTURE_PEARL: "Culture Pearl",
  EMERALD: "Emerald",
  EMERALD_RUBYLITE: "Emerald & Rubylite",
  ETHIOPIAN_OPAL: "Ethiopian Opal",
  FIRE_OPAL: "Fire Opal",
  FRESH_WATER_PEARL: "Fresh Water Pearl",
  GLASS_FILLED_BLUE_SAPPHIRE: "Glass Filled Blue Sapphire",
  GLASS_FILLED_RUBY: "Glass Filled Ruby",
  GREEN_AMETHYST_DARK: "Green Amethyst Dark",
  HESSONITE_GARNET: "Hessonite Garnet",
  HONEY_QUARTZ: "Honey Quartz",
  JADE: "Jade",
  KESHI_PEARL: "Keshi Pearl",
  KUNZITE: "Kunzite",
  KYANITE: "Kyanite",
  LAPIS_LAZULI: "Lapis Lazuli",
  LEMON_QUARTZ: "Lemon Quartz",
  MALACHITE: "Malachite",
  MOON_STONE: "Moon Stone",
  MORGANITE: "Morganite",
  MULTI_SAPPHIRE: "Multi Sapphire",
  MULTI_SPINEL: "Multi Spinel",
  OLIVE_QUARTZ: "Olive Quartz",
  OPAL: "Opal",
  PEARL: "Pearl",
  PERIDOT: "Peridot",
  PINK_AMETHYST: "Pink Amethyst",
  PINK_OPAL: "Pink Opal",
  PINK_SAPPHIRE: "Pink Sapphire",
  PINK_TOURMALINE: "Pink Tourmaline",
  PURPLE_GARNET: "Purple Garnet",
  RECON_TURQUIES: "Recon Turquies",
  RED_JASPER: "Red Jasper",
  ROSE_QUARTZ: "Rose Quartz",
  RUBELITE: "Rubelite",
  RUBELITE_QUARTZ: "Rubelite Quartz",
  SAPPHIRE: "Sapphire",
  SKY_BLUE_TOPAZ: "Sky Blue Topaz",
  SMOKY_QUARTZ: "Smoky Quartz",
  SNOWFLAKE_OBSIDIAN: "Snowflake Obsidian",
  SOUTH_SEA_PEARL: "South Sea Pearl",
  TAHITI_PEARL: "Tahiti Pearl",
  TANZANITE: "Tanzanite",
  TIGERS_EYE: "Tigers Eye",
  TOURMALINE: "Tourmaline",
  T_SAVORITE: "T-Savorite",
  TURQUOISE: "Turquoise",
  WHISKEY_QUARTZ: "Whiskey Quartz",
  WHITE_SAPPHIRE: "White Sapphire",
  YELLOW_SAPPHIRE: "Yellow Sapphire",
  GARNET: "Garnet",
  RHODOLITE_GARNET: "Rhodolite Garnet",
  GREEN_AMETHYST_REGULAR: "Green Amethyst Regular",
  GOLDEN_PEARL: "Golden Pearl",
  CATS_EYE: "Cats Eye",
  ETY_TURQULOIS: "Ety Turqulois",
  MADEIRA_CITRINE: "Madeira Citrine",
  RUBY: "Ruby", // Keep existing options
  
} as const

// Stone type codes for reference (not stored in database)
export const STONE_TYPE_CODES = {
  [STONE_TYPE.NONE]: "None",
  [STONE_TYPE.AKOYA_PEARL]: "KW",
  [STONE_TYPE.AMAZONITE]: "AZ",
  [STONE_TYPE.AMETHYST]: "AM",
  [STONE_TYPE.APATITE]: "AT",
  [STONE_TYPE.AQUAMARINE]: "AQ",
  [STONE_TYPE.BEER_QUARTZ]: "BQ",
  [STONE_TYPE.BLACK_JASPER]: "BJ",
  [STONE_TYPE.BLACK_ONYX]: "BO",
  [STONE_TYPE.BLUE_CHALCEDONY]: "BC",
  [STONE_TYPE.BLUE_KYANITE]: "BK",
  [STONE_TYPE.AUSTRIAN_BLUE_OPAL]: "AO",
  [STONE_TYPE.BLUE_SAPPHIRE]: "BS",
  [STONE_TYPE.BLUE_TOPAZ]: "BT",
  [STONE_TYPE.CAMEL_JASPER]: "CJ",
  [STONE_TYPE.CARNELIAN]: "CA",
  [STONE_TYPE.CHAMPAGNE_QUARTZ]: "CQ",
  [STONE_TYPE.CHRYSOPRASE]: "CH",
  [STONE_TYPE.CITRINE]: "CI",
  [STONE_TYPE.CORAL]: "CO",
  [STONE_TYPE.CRYSTAL]: "CR",
  [STONE_TYPE.CULTURE_PEARL]: "CP",
  [STONE_TYPE.EMERALD]: "EM",
  [STONE_TYPE.EMERALD_RUBYLITE]: "ER",
  [STONE_TYPE.ETHIOPIAN_OPAL]: "EO",
  [STONE_TYPE.FIRE_OPAL]: "FO",
  [STONE_TYPE.FRESH_WATER_PEARL]: "FP",
  [STONE_TYPE.GLASS_FILLED_BLUE_SAPPHIRE]: "FS",
  [STONE_TYPE.GLASS_FILLED_RUBY]: "GR",
  [STONE_TYPE.GREEN_AMETHYST_DARK]: "AD",
  [STONE_TYPE.HESSONITE_GARNET]: "HG",
  [STONE_TYPE.HONEY_QUARTZ]: "HQ",
  [STONE_TYPE.JADE]: "JD",
  [STONE_TYPE.KESHI_PEARL]: "GK",
  [STONE_TYPE.KUNZITE]: "KU",
  [STONE_TYPE.KYANITE]: "KY",
  [STONE_TYPE.LAPIS_LAZULI]: "LA",
  [STONE_TYPE.LEMON_QUARTZ]: "LQ",
  [STONE_TYPE.MALACHITE]: "ML",
  [STONE_TYPE.MOON_STONE]: "MT",
  [STONE_TYPE.MORGANITE]: "MG",
  [STONE_TYPE.MULTI_SAPPHIRE]: "MS",
  [STONE_TYPE.MULTI_SPINEL]: "SP",
  [STONE_TYPE.OLIVE_QUARTZ]: "OQ",
  [STONE_TYPE.OPAL]: "OP",
  [STONE_TYPE.PEARL]: "PE",
  [STONE_TYPE.PERIDOT]: "PR",
  [STONE_TYPE.PINK_AMETHYST]: "AP",
  [STONE_TYPE.PINK_OPAL]: "KO",
  [STONE_TYPE.PINK_SAPPHIRE]: "PS",
  [STONE_TYPE.PINK_TOURMALINE]: "PT",
  [STONE_TYPE.PURPLE_GARNET]: "UE",
  [STONE_TYPE.RECON_TURQUIES]: "RT",
  [STONE_TYPE.RED_JASPER]: "RJ",
  [STONE_TYPE.ROSE_QUARTZ]: "RQ",
  [STONE_TYPE.RUBELITE]: "RL",
  [STONE_TYPE.RUBELITE_QUARTZ]: "RBQ",
  [STONE_TYPE.RUBY]: "RB", 
  [STONE_TYPE.SAPPHIRE]: "SE",
  [STONE_TYPE.SKY_BLUE_TOPAZ]: "LZ",
  [STONE_TYPE.SMOKY_QUARTZ]: "SQ",
  [STONE_TYPE.SNOWFLAKE_OBSIDIAN]: "SN",
  [STONE_TYPE.SOUTH_SEA_PEARL]: "SS",
  [STONE_TYPE.TAHITI_PEARL]: "TP",
  [STONE_TYPE.TANZANITE]: "TZ",
  [STONE_TYPE.TIGERS_EYE]: "TE",
  [STONE_TYPE.TOURMALINE]: "TO",
  [STONE_TYPE.T_SAVORITE]: "TS",
  [STONE_TYPE.TURQUOISE]: "TQ",
  [STONE_TYPE.WHISKEY_QUARTZ]: "WQ",
  [STONE_TYPE.WHITE_SAPPHIRE]: "WS",
  [STONE_TYPE.YELLOW_SAPPHIRE]: "YS",
  [STONE_TYPE.GARNET]: "GA",
  [STONE_TYPE.RHODOLITE_GARNET]: "RG",
  [STONE_TYPE.GREEN_AMETHYST_REGULAR]: "PL",
  [STONE_TYPE.GOLDEN_PEARL]: "GP",
  [STONE_TYPE.CATS_EYE]: "CE",
  [STONE_TYPE.ETY_TURQULOIS]: "STQ",
  [STONE_TYPE.MADEIRA_CITRINE]: "MCI",
  
} as const

export type StoneType = (typeof STONE_TYPE)[keyof typeof STONE_TYPE]

// New constants for Stone Lot properties
export const STONE_SHAPE = {
  FC: "FC",
  CB: "CB",
  CR: "CR",
} as const

export type StoneShape = (typeof STONE_SHAPE)[keyof typeof STONE_SHAPE]

export const STONE_CUT = {
  CL: "CL",
  OP: "OP",
  TM: "TM",
} as const

export type StoneCut = (typeof STONE_CUT)[keyof typeof STONE_CUT]

export const STONE_QUALITY = {
  A: "A",
  B: "B",
} as const

export type StoneQuality = (typeof STONE_QUALITY)[keyof typeof STONE_QUALITY]

export const STONE_LOCATION = {
  PRIMARY: "Primary",
  NONE: "None",
  OTHER: "Other",
} as const

export type StoneLocation = (typeof STONE_LOCATION)[keyof typeof STONE_LOCATION]

// New constants for Diamond Lot properties
export const DIAMOND_SHAPE = {
  RD: 'RD',
  BG: 'BG',
} as const

export type DiamondShape = (typeof DIAMOND_SHAPE)[keyof typeof DIAMOND_SHAPE]

export const DIAMOND_SIZE = {
  PLUS_2: '+2',
  PLUS_6: '+6',
  MINUS_2: '-2',
  NONE: 'none',
} as const

export type DiamondSize = (typeof DIAMOND_SIZE)[keyof typeof DIAMOND_SIZE]

export const DIAMOND_QUALITY = {
  HI_SI: 'HI/SI',
  UNKNOWN: 'unknown',
} as const

export type DiamondQuality = (typeof DIAMOND_QUALITY)[keyof typeof DIAMOND_QUALITY]

export const DIAMOND_TYPE = {
  ACTUAL: 'Actual',
  UNKNOWN: 'unknown',
} as const

export type DiamondType = (typeof DIAMOND_TYPE)[keyof typeof DIAMOND_TYPE]

// Map for category codes used in SKU ID generation
export const CATEGORY_CODES: Record<SkuCategory, string> = {
  [SKU_CATEGORY.NECKLACE]: "NK",
  [SKU_CATEGORY.BANGLE]: "BN",
  [SKU_CATEGORY.RING]: "RG",
  [SKU_CATEGORY.EARRING]: "ER",
  [SKU_CATEGORY.PENDANT]: "PN",
  [SKU_CATEGORY.BALL_LOCK]: "BL",
  [SKU_CATEGORY.BROUCH]: "BO",
  [SKU_CATEGORY.BRACELET]: "BR",
  [SKU_CATEGORY.CUFF_LINK]: "CF",
  [SKU_CATEGORY.CHAIN]: "CH",
  [SKU_CATEGORY.EXTRAS]: "EX",
  [SKU_CATEGORY.TYRE]: "TY",
  [SKU_CATEGORY.KADI]: "EX", // Using EX as per database function
  [SKU_CATEGORY.EARRING_PART]: "EX", // Using EX as per database function
  [SKU_CATEGORY.NONE]: "??",
}

/**
 * Get the category code for a given category name string
 * @param categoryName The category name (e.g., "Ring", "Necklace")
 * @returns The category code (e.g., "RG", "NK") or "OO" if not found
 */
export function getCategoryCode(categoryName: string): string {
  // Direct lookup for exact matches
  for (const [key, value] of Object.entries(SKU_CATEGORY)) {
    if (value === categoryName) {
      return CATEGORY_CODES[value]
    }
  }

  // Default fallback
  return "OO"
}

// Default sizes for each category - now using a partial record
export const DEFAULT_SIZES: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.NECKLACE]: 16, // 16 inches
  [SKU_CATEGORY.BANGLE]: 2.5, // 2.5 inches
  [SKU_CATEGORY.RING]: 14, // 14mm
  [SKU_CATEGORY.PENDANT]: 18, // 18 inches
  [SKU_CATEGORY.BRACELET]: 7.5, // 7.5 inches
  [SKU_CATEGORY.CHAIN]: 9, // 9 inches
}

// Minimum sizes for each category
export const MIN_SIZES: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.RING]: 8, // 8mm
  [SKU_CATEGORY.BRACELET]: 6, // 6 inches
  [SKU_CATEGORY.BANGLE]: 6, // 6 inches
  [SKU_CATEGORY.NECKLACE]: 9, // 9 inches
  [SKU_CATEGORY.PENDANT]: 9, // 9 inches
  [SKU_CATEGORY.CHAIN]: 9, // 9 inches
}

// Maximum sizes for each category
export const MAX_SIZES: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.RING]: 20, // 20mm
  [SKU_CATEGORY.BRACELET]: 18, // 18 inches
  [SKU_CATEGORY.BANGLE]: 18, // 18 inches
  [SKU_CATEGORY.NECKLACE]: 35, // 35 inches
  [SKU_CATEGORY.PENDANT]: 35, // 35 inches
  [SKU_CATEGORY.CHAIN]: 35, // 35 inches
}

// Size denominations (increments) for each category
export const SIZE_DENOMINATIONS: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.RING]: 0.5, // 0.5mm increments
  [SKU_CATEGORY.BRACELET]: 0.25, // 0.25 inch increments
  [SKU_CATEGORY.BANGLE]: 0.25, // 0.25 inch increments
  [SKU_CATEGORY.NECKLACE]: 0.5, // 0.5 inch increments
  [SKU_CATEGORY.PENDANT]: 0.5, // 0.5 inch increments
  [SKU_CATEGORY.CHAIN]: 0.5, // 0.5 inch increments
}

// Units of measurement for each category
export const SIZE_UNITS: Partial<Record<SkuCategory, string>> = {
  [SKU_CATEGORY.RING]: "mm",
  [SKU_CATEGORY.BRACELET]: "inch",
  [SKU_CATEGORY.BANGLE]: "ana",
  [SKU_CATEGORY.NECKLACE]: "inch",
  [SKU_CATEGORY.PENDANT]: "inch",
  [SKU_CATEGORY.CHAIN]: "inch",
}
