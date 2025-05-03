export interface DiamondLot {
  id: string
  lotNumber: string
  diamondType: string
  clarity: string
  color: string
  cut: string
  totalQuantity: number
  availableQuantity: number
  totalWeight: number
  availableWeight: number
  pricePerCarat: number
  supplier: string
  receivedDate: string
}

export const DIAMOND_LOTS: DiamondLot[] = [
  {
    id: "dl001",
    lotNumber: "LOT-DM-B6-001",
    diamondType: "B6",
    clarity: "VS1",
    color: "F",
    cut: "Excellent",
    totalQuantity: 30,
    availableQuantity: 24,
    totalWeight: 15.6,
    availableWeight: 12.5,
    pricePerCarat: 1200,
    supplier: "Diamond Elite",
    receivedDate: "2025-03-10",
  },
  {
    id: "dl002",
    lotNumber: "LOT-DM-B12-002",
    diamondType: "B12",
    clarity: "VVS2",
    color: "D",
    cut: "Ideal",
    totalQuantity: 25,
    availableQuantity: 20,
    totalWeight: 12.8,
    availableWeight: 10.2,
    pricePerCarat: 1800,
    supplier: "Premium Diamond Co.",
    receivedDate: "2025-03-18",
  },
  {
    id: "dl003",
    lotNumber: "LOT-DM-A-003",
    diamondType: "A",
    clarity: "IF",
    color: "D",
    cut: "Ideal",
    totalQuantity: 15,
    availableQuantity: 12,
    totalWeight: 7.5,
    availableWeight: 6.0,
    pricePerCarat: 2500,
    supplier: "Luxury Diamond Traders",
    receivedDate: "2025-04-02",
  },
]
