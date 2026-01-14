export const BULK_PRODUCTS_MUTATION = /* GraphQL */ `
  #graphql
  mutation RunProductsBulkOperation($query: String!) {
    bulkOperationRunQuery(query: $query, groupObjects: false) {
      bulkOperation {
        id
        status
        url
      }
      userErrors {
        field
        message
      }
    }
  }
`
