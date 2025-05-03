export interface StoneLot {
  id: string
  lotNumber: string
  stoneType: string
  totalQuantity: number
  availableQuantity: number
  totalWeight: number
  availableWeight: number
  pricePerCarat: number
  supplier: string
  receivedDate: string
}

export const STONE_LOTS: StoneLot[] = [
  {
    id: "sl001",
    lotNumber: "LOT-EM-001",
    stoneType: "Emerald",
    totalQuantity: 50,
    availableQuantity: 32,
    totalWeight: 25.5,
    availableWeight: 16.8,
    pricePerCarat: 450,
    supplier: "GemSource International",
    receivedDate: "2025-03-15",
  },
  {
    id: "sl002",
    lotNumber: "LOT-RB-002",
    stoneType: "Ruby",
    totalQuantity: 40,
    availableQuantity: 28,
    totalWeight: 20.2,
    availableWeight: 14.5,
    pricePerCarat: 380,
    supplier: "Royal Gem Traders",
    receivedDate: "2025-03-22",
  },
  {
    id: "sl003",
    lotNumber: "LOT-SP-003",
    stoneType: "Sapphire",
    totalQuantity: 45,
    availableQuantity: 38,
    totalWeight: 22.8,
    availableWeight: 19.2,
    pricePerCarat: 420,
    supplier: "Blue Ocean Gems",
    receivedDate: "2025-04-05",
  },
]
