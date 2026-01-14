/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/shopify/streamJsonl.ts
import readline from "node:readline"
import { Readable } from "node:stream"

export async function streamJsonlFromUrl(
  url: string,
  processRecord: (record: any) => Promise<void>
) {
  const res = await fetch(url)
  if (!res.ok || !res.body) {
    throw new Error(`Error downloading bulk JSONL: ${res.status} ${res.statusText}`)
  }

  const nodeStream = Readable.fromWeb(res.body as any)

  const rl = readline.createInterface({
    input: nodeStream,
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    if (!line.trim()) continue
    const record = JSON.parse(line)
    await processRecord(record)
  }
}
