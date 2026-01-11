import { DATABASE_URL } from "$env/static/private"
import * as schema from "$lib/server/db/schema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString = DATABASE_URL
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })
