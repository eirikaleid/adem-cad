import { Router, Request, Response } from 'express'
import multer from 'multer'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client.js'
import { projectFiles, projects } from '../db/schema.js'
import { uploadFile, deleteFile, getPresignedUrl } from '../storage/minioClient.js'

export const filesRouter = Router()

// multer stores file in memory so we can pass the buffer directly to MinIO
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 * 1024 }, // 512 MB
})

const ALLOWED_FORMATS = ['step', 'gltf', 'stl', 'json'] as const
type FileFormat = (typeof ALLOWED_FORMATS)[number]

function detectFormat(filename: string): FileFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ALLOWED_FORMATS.includes(ext as FileFormat)) return ext as FileFormat
  return null
}

async function projectExists(projectId: string): Promise<boolean> {
  const rows = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId))
  return rows.length > 0
}

// POST /api/projects/:projectId/files
filesRouter.post(
  '/:projectId/files',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params

    if (!(await projectExists(projectId))) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const format = detectFormat(req.file.originalname)
    if (!format) {
      res.status(400).json({
        error: 'Unsupported file format',
        details: `Allowed: ${ALLOWED_FORMATS.join(', ')}`,
      })
      return
    }

    try {
      // Insert DB record first to obtain the generated file ID for the MinIO key
      const [record] = await db
        .insert(projectFiles)
        .values({
          projectId,
          filename: req.file.originalname,
          format,
          minioKey: 'pending', // temporary placeholder
          sizeBytes: String(req.file.size),
        })
        .returning()

      const minioKey = `projects/${projectId}/${record.id}/${req.file.originalname}`

      await uploadFile(minioKey, req.file.buffer, req.file.mimetype)

      const [updated] = await db
        .update(projectFiles)
        .set({ minioKey })
        .where(eq(projectFiles.id, record.id))
        .returning()

      res.status(201).json(updated)
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload file', details: err })
    }
  },
)

// GET /api/projects/:projectId/files
filesRouter.get('/:projectId/files', async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params

  if (!(await projectExists(projectId))) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  try {
    const rows = await db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, projectId))
      .orderBy(projectFiles.createdAt)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files', details: err })
  }
})

// GET /api/projects/:projectId/files/:fileId/download
filesRouter.get(
  '/:projectId/files/:fileId/download',
  async (req: Request, res: Response): Promise<void> => {
    const { projectId, fileId } = req.params

    const expirySchema = z.coerce.number().int().positive().max(604800).optional()
    const expiryParsed = expirySchema.safeParse(req.query.expiry)
    if (!expiryParsed.success) {
      res.status(400).json({ error: 'Invalid expiry parameter' })
      return
    }

    try {
      const rows = await db
        .select()
        .from(projectFiles)
        .where(and(eq(projectFiles.id, fileId), eq(projectFiles.projectId, projectId)))

      if (rows.length === 0) {
        res.status(404).json({ error: 'File not found' })
        return
      }

      const url = await getPresignedUrl(rows[0].minioKey, expiryParsed.data)
      res.redirect(url)
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate download URL', details: err })
    }
  },
)

// DELETE /api/projects/:projectId/files/:fileId
filesRouter.delete(
  '/:projectId/files/:fileId',
  async (req: Request, res: Response): Promise<void> => {
    const { projectId, fileId } = req.params

    try {
      const rows = await db
        .select()
        .from(projectFiles)
        .where(and(eq(projectFiles.id, fileId), eq(projectFiles.projectId, projectId)))

      if (rows.length === 0) {
        res.status(404).json({ error: 'File not found' })
        return
      }

      await deleteFile(rows[0].minioKey)

      await db
        .delete(projectFiles)
        .where(and(eq(projectFiles.id, fileId), eq(projectFiles.projectId, projectId)))

      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete file', details: err })
    }
  },
)
