export const GET_ORDERS_QUERY = /* GraphQL */ `
  #graphql
  query getOrders($first: Int!) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          subtotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            displayName
            id
          }
          note
          email
          shippingAddress {
            address1
            city
            provinceCode
            zip
          }
          lineItems(first: 5) {
            edges {
              node {
                name
                quantity
                sku
                variant {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`

export const COUNT_ORDERS_QUERY = /* GraphQL */ `
  #graphql
  query OrdersCount {
    ordersCount(limit: null) {
      count
      precision
    }
  }
`
