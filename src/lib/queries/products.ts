export const GET_PRODUCTS_QUERY = /* GraphQL */ `
  #graphql
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: TITLE, reverse: true) {
      edges {
        node {
          id
          title
          descriptionHtml
          handle
          status
          vendor
          productType
          createdAt
          updatedAt
          publishedAt
          tags
          featuredMedia {
            ... on MediaImage {
              id
              image {
                url
                altText
              }
            }
          }
          media(first: 10) {
            edges {
              node {
                ... on MediaImage {
                  id
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                price
                sku
                inventoryPolicy
                inventoryQuantity
                media(first: 1) {
                  edges {
                    node {
                      ... on MediaImage {
                        id
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const BULK_PRODUCTS_QUERY = /* GraphQL */ `
  #graphql
  query BulkProducts {
    products {
      edges {
        node {
          __typename
          id
          title
          descriptionHtml
          handle
          status
          vendor
          productType
          createdAt
          updatedAt
          publishedAt
          tags
          featuredMedia {
            __typename
            ... on MediaImage {
              id
              image {
                url
                altText
              }
            }
          }
          variants {
            edges {
              node {
                __typename
                id
                title
                price
                sku
                inventoryPolicy
                inventoryQuantity
              }
            }
          }
          media {
            edges {
              node {
                __typename
                ... on MediaImage {
                  id
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const BULK_PRODUCTS_OPERATION_BY_ID = `#graphql
query BulkOperationById($id: ID!) {
  node(id: $id) {
    ... on BulkOperation {
      id
      status
      url
      errorCode
      objectCount
    }
  }
}
`
