/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from "./admin.types.d.ts"

export type GetOrdersQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars["Int"]["input"]
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars["String"]["input"]>
}>

export type GetOrdersQuery = {
  orders: {
    edges: Array<
      Pick<AdminTypes.OrderEdge, "cursor"> & {
        node: Pick<
          AdminTypes.Order,
          "id" | "name" | "createdAt" | "displayFinancialStatus"
        > & {
          totalPriceSet: {
            shopMoney: Pick<AdminTypes.MoneyV2, "amount" | "currencyCode">
          }
        }
      }
    >
    pageInfo: Pick<AdminTypes.PageInfo, "hasNextPage" | "endCursor">
  }
}

export type OrdersCountQueryVariables = AdminTypes.Exact<{ [key: string]: never }>

export type OrdersCountQuery = {
  ordersCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, "count" | "precision">>
}

interface GeneratedQueryTypes {
  "\n  #graphql\n  query getOrders($first: Int!, $query: String) {\n    orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {\n      edges {\n        cursor\n        node {\n          id\n          name\n          createdAt\n          totalPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          displayFinancialStatus\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {
    return: GetOrdersQuery
    variables: GetOrdersQueryVariables
  }
  "\n  #graphql\n  query OrdersCount {\n    ordersCount(limit: null) {\n      count\n      precision\n    }\n  }\n": {
    return: OrdersCountQuery
    variables: OrdersCountQueryVariables
  }
}

interface GeneratedMutationTypes {}
declare module "@shopify/admin-api-client" {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
