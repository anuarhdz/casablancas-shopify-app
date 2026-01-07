export const GET_ORDERS_QUERY = /* GraphQL */ `
  #graphql
  query getOrders($first: Int!) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          note
          tags
          customer {
            firstName
            lastName
            id
            numberOfOrders
            defaultAddress {
              address1
              address2
              city
              zip
              province
              country
              phone
              company
              latitude
              longitude
              name
            }
          }
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          displayFinancialStatus
        }
        cursor
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
