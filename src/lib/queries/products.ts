export const GET_PRODUCTS_QUERY = /* GraphQL */ `
  #graphql
  query getProducts($first: Int!) {
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
    products(first: 250, sortKey: TITLE, reverse: true) {
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
