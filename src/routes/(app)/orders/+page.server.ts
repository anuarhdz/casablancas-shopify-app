import { requireLogin } from "$lib/server/login"
import { fetchOrders, withShopifyLoad } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const data = await withShopifyLoad(() => fetchOrders())
  const user = requireLogin()

  const orders = data.orders.edges.map(({ node }) => {
    const lineItems = node.lineItems.edges.map(({ node: item }) => ({
      name: item.name,
      quantity: item.quantity,
      sku: item.sku,
      variantApiId: item.variant?.id ?? null,
      variantId: item.variant?.id.replace("gid://shopify/ProductVariant/", "") ?? null,
      variantTitle: item.variant?.title ?? null,
    }))

    return {
      id: node.id.replace("gid://shopify/Order/", ""),
      apiId: node.id,
      name: node.name,
      createdAt: node.createdAt,
      financialStatus: node.displayFinancialStatus,
      fulfillmentStatus: node.displayFulfillmentStatus,
      total: `$${parseFloat(node.totalPriceSet.shopMoney.amount).toFixed(2)}`,
      subtotal: node.subtotalPriceSet?.shopMoney.amount,
      currency: node.totalPriceSet.shopMoney.currencyCode,
      customerApiId: node.customer?.id ?? null,
      customerId: node.customer?.id.replace("gid://shopify/Customer/", "") ?? null,
      customerName: node.customer?.displayName ?? null,
      note: node.note ?? "",
      email: node.email ?? null,
      shippingAddress: node.shippingAddress
        ? {
            address: node.shippingAddress.address1,
            city: node.shippingAddress.city,
            province: node.shippingAddress.provinceCode,
            zip: node.shippingAddress.zip,
          }
        : null,
      lineItems,
      lineItemsTotal: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    }
  })

  return { user, orders }
}
