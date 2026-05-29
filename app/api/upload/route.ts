import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { verifyTokenFromHeader, unauthorized } from '../../../lib/auth'

// optional S3 support
const S3_BUCKET = process.env.S3_BUCKET
const S3_REGION = process.env.S3_REGION

async function saveLocal(fileName: string, buffer: Buffer) {
  const uploadsDir = path.join(process.cwd(), 'public', 'products')
  await fs.mkdir(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, fileName)
  await fs.writeFile(filePath, buffer)
  return `/products/${fileName}`
}

async function saveToS3(fileName: string, buffer: Buffer) {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const s3 = new S3Client({ region: S3_REGION })
  const bucket = S3_BUCKET!
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: `products/${fileName}`, Body: buffer, ACL: 'public-read' }))
  // construct public URL (depends on bucket config)
  const url = `https://${bucket}.s3.${S3_REGION}.amazonaws.com/products/${fileName}`
  return url
}

export async function POST(request: Request) {
  // require auth for uploads
  try {
    verifyTokenFromHeader(request)
  } catch (e) {
    return unauthorized()
  }

  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = `${Date.now()}-${(file as any).name || 'upload'}`

    if (S3_BUCKET && S3_REGION) {
      try {
        const url = await saveToS3(filename, buffer)
        return NextResponse.json({ path: url })
      } catch (s3err) {
        console.warn('S3 upload failed, falling back to local', s3err)
      }
    }

    const localPath = await saveLocal(filename, buffer)
    return NextResponse.json({ path: localPath })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
