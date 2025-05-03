export interface SKU {
  id: string
  name: string
  category: string
  size: string
  goldType: string
  stoneType: string
  diamondType: string
  image: string
}

export interface Job {
  id: string
  orderId: string
  skuId: string
  name: string
  category: string
  goldType: string
  stoneType: string
  diamondType: string
  size: string
  status: string
  manufacturer: string
  productionDate: string
  dueDate: string
  createdAt: string
  image: string
  currentPhase: string
  stoneData?: any
  diamondData?: any
  manufacturerData?: any
  qcData?: any
}

export interface Order {
  id: string
  orderType: string
  customerName: string
  skus: {
    id: string
    name: string
    quantity: number
    category?: string
    goldType?: string
    stoneType?: string
    diamondType?: string
    size: string
    remarks: string
    image: string
  }[]
  dueDate?: string
  deliveryDate?: string
  productionDate?: string
  productionDueDate?: string
  status: string
  action: string
  daysToDue?: number
  remarks: string
  history?: {
    date: string
    action: string
    user: string
  }[]
  createdAt?: string
}
