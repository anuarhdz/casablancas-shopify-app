export const GET_ORDERS_QUERY = /* GraphQL */ `
  #graphql
  query getOrders($first: Int!, $query: String) {
    orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      edges {
        cursor
        node {
          id
          name
          createdAt
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          displayFinancialStatus
        }
      }
      pageInfo {
        hasNextPage
        endCursor
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
