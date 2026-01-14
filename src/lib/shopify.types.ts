import type * as AdminTypes from "../../types/admin.types"

type ShippingAddress = {
  address: string | null | undefined
  city: string | null | undefined
  province: string | null | undefined
  zip: string | null | undefined
}

type LineItem = {
  name: string
  quantity: number
  sku: string | null | undefined
  variantApiId: string | null
  variantId: string | null
  variantTitle: string | null
}

export type Order = {
  id: string
  apiId: string
  name: string
  createdAt: string
  financialStatus: AdminTypes.OrderDisplayFinancialStatus | null | undefined
  fulfillmentStatus: AdminTypes.OrderDisplayFulfillmentStatus
  total: string
  subtotal: string
  currency: AdminTypes.CurrencyCode
  customerApiId: string | null
  customerId: string | null
  customerName: string | null
  email: string | null
  note: string
  shippingAddress: ShippingAddress | null
  lineItems: LineItem[]
  lineItemsTotal: number
}
