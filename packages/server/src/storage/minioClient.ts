import { Client } from 'minio'

const BUCKET = process.env.MINIO_BUCKET ?? 'adem-cad-files'

// Lazy-initialized so the bucket existence check runs only once
let bucketReady = false

const client = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: Number(process.env.MINIO_PORT ?? 9000),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
})

async function ensureBucket(): Promise<void> {
  if (bucketReady) return
  const exists = await client.bucketExists(BUCKET)
  if (!exists) {
    await client.makeBucket(BUCKET)
  }
  bucketReady = true
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  await ensureBucket()
  await client.putObject(BUCKET, key, buffer, buffer.length, { 'Content-Type': contentType })
}

export async function downloadFile(key: string): Promise<Buffer> {
  await ensureBucket()
  const stream = await client.getObject(BUCKET, key)
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export async function deleteFile(key: string): Promise<void> {
  await ensureBucket()
  await client.removeObject(BUCKET, key)
}

export async function getPresignedUrl(
  key: string,
  expirySeconds = 3600,
): Promise<string> {
  await ensureBucket()
  return client.presignedGetObject(BUCKET, key, expirySeconds)
}
