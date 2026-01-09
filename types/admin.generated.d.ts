/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types.d.ts';

export type RunProductsBulkOperationMutationVariables = AdminTypes.Exact<{
  query: AdminTypes.Scalars['String']['input'];
}>;


export type RunProductsBulkOperationMutation = { bulkOperationRunQuery?: AdminTypes.Maybe<{ bulkOperation?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'id' | 'status' | 'url'>>, userErrors: Array<Pick<AdminTypes.BulkOperationUserError, 'field' | 'message'>> }> };

export type GetOrdersQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
}>;


export type GetOrdersQuery = { orders: { edges: Array<(
      Pick<AdminTypes.OrderEdge, 'cursor'>
      & { node: (
        Pick<AdminTypes.Order, 'id' | 'name' | 'createdAt' | 'note' | 'tags' | 'displayFinancialStatus'>
        & { customer?: AdminTypes.Maybe<(
          Pick<AdminTypes.Customer, 'firstName' | 'lastName' | 'id' | 'numberOfOrders'>
          & { defaultAddress?: AdminTypes.Maybe<Pick<AdminTypes.MailingAddress, 'address1' | 'address2' | 'city' | 'zip' | 'province' | 'country' | 'phone' | 'company' | 'latitude' | 'longitude' | 'name'>> }
        )>, totalPriceSet: { shopMoney: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> } }
      ) }
    )> } };

export type OrdersCountQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type OrdersCountQuery = { ordersCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count' | 'precision'>> };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
}>;


export type GetProductsQuery = { products: { edges: Array<{ node: (
        Pick<AdminTypes.Product, 'id' | 'title' | 'descriptionHtml' | 'handle' | 'status' | 'vendor' | 'productType' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'tags'>
        & { featuredMedia?: AdminTypes.Maybe<(
          Pick<AdminTypes.MediaImage, 'id'>
          & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
        )>, media: { edges: Array<{ node: (
              Pick<AdminTypes.MediaImage, 'id'>
              & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
            ) }> }, variants: { edges: Array<{ node: (
              Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'sku' | 'inventoryPolicy' | 'inventoryQuantity'>
              & { media: { edges: Array<{ node: (
                    Pick<AdminTypes.MediaImage, 'id'>
                    & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
                  ) }> } }
            ) }> } }
      ) }> } };

export type BulkProductsQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type BulkProductsQuery = { products: { edges: Array<{ node: (
        Pick<AdminTypes.Product, 'id' | 'title' | 'descriptionHtml' | 'handle' | 'status' | 'vendor' | 'productType' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'tags'>
        & { featuredMedia?: AdminTypes.Maybe<(
          Pick<AdminTypes.MediaImage, 'id'>
          & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
        )>, media: { edges: Array<{ node: (
              Pick<AdminTypes.MediaImage, 'id'>
              & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
            ) }> }, variants: { edges: Array<{ node: (
              Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'sku' | 'inventoryPolicy' | 'inventoryQuantity'>
              & { media: { edges: Array<{ node: (
                    Pick<AdminTypes.MediaImage, 'id'>
                    & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'altText'>> }
                  ) }> } }
            ) }> } }
      ) }> } };

export type BulkOperationByIdQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type BulkOperationByIdQuery = { node?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'id' | 'status' | 'url' | 'errorCode' | 'objectCount'>> };

interface GeneratedQueryTypes {
  "\n  #graphql\n  query getOrders($first: Int!) {\n    orders(first: $first, sortKey: CREATED_AT, reverse: true) {\n      edges {\n        node {\n          id\n          name\n          createdAt\n          note\n          tags\n          customer {\n            firstName\n            lastName\n            id\n            numberOfOrders\n            defaultAddress {\n              address1\n              address2\n              city\n              zip\n              province\n              country\n              phone\n              company\n              latitude\n              longitude\n              name\n            }\n          }\n          totalPriceSet {\n            shopMoney {\n              amount\n              currencyCode\n            }\n          }\n          displayFinancialStatus\n        }\n        cursor\n      }\n    }\n  }\n": {return: GetOrdersQuery, variables: GetOrdersQueryVariables},
  "\n  #graphql\n  query OrdersCount {\n    ordersCount(limit: null) {\n      count\n      precision\n    }\n  }\n": {return: OrdersCountQuery, variables: OrdersCountQueryVariables},
  "\n  #graphql\n  query getProducts($first: Int!) {\n    products(first: $first, sortKey: TITLE, reverse: true) {\n      edges {\n        node {\n          id\n          title\n          descriptionHtml\n          handle\n          status\n          vendor\n          productType\n          createdAt\n          updatedAt\n          publishedAt\n          tags\n          featuredMedia {\n            ... on MediaImage {\n              id\n              image {\n                url\n                altText\n              }\n            }\n          }\n          media(first: 10) {\n            edges {\n              node {\n                ... on MediaImage {\n                  id\n                  image {\n                    url\n                    altText\n                  }\n                }\n              }\n            }\n          }\n          variants(first: 50) {\n            edges {\n              node {\n                id\n                title\n                price\n                sku\n                inventoryPolicy\n                inventoryQuantity\n                media(first: 1) {\n                  edges {\n                    node {\n                      ... on MediaImage {\n                        id\n                        image {\n                          url\n                          altText\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "\n  #graphql\n  query BulkProducts {\n    products(first: 250, sortKey: TITLE, reverse: true) {\n      edges {\n        node {\n          id\n          title\n          descriptionHtml\n          handle\n          status\n          vendor\n          productType\n          createdAt\n          updatedAt\n          publishedAt\n          tags\n          featuredMedia {\n            ... on MediaImage {\n              id\n              image {\n                url\n                altText\n              }\n            }\n          }\n          media(first: 10) {\n            edges {\n              node {\n                ... on MediaImage {\n                  id\n                  image {\n                    url\n                    altText\n                  }\n                }\n              }\n            }\n          }\n          variants(first: 50) {\n            edges {\n              node {\n                id\n                title\n                price\n                sku\n                inventoryPolicy\n                inventoryQuantity\n                media(first: 1) {\n                  edges {\n                    node {\n                      ... on MediaImage {\n                        id\n                        image {\n                          url\n                          altText\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: BulkProductsQuery, variables: BulkProductsQueryVariables},
  "#graphql\nquery BulkOperationById($id: ID!) {\n  node(id: $id) {\n    ... on BulkOperation {\n      id\n      status\n      url\n      errorCode\n      objectCount\n    }\n  }\n}\n": {return: BulkOperationByIdQuery, variables: BulkOperationByIdQueryVariables},
}

interface GeneratedMutationTypes {
  "\n  #graphql\n  mutation RunProductsBulkOperation($query: String!) {\n    bulkOperationRunQuery(query: $query, groupObjects: false) {\n      bulkOperation {\n        id\n        status\n        url\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: RunProductsBulkOperationMutation, variables: RunProductsBulkOperationMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
