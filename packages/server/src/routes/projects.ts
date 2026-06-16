import { Router, Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client.js'
import { projects } from '../db/schema.js'

export const projectsRouter = Router()

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
})

// GET /api/projects
projectsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(projects).orderBy(projects.createdAt)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects', details: err })
  }
})

// GET /api/projects/:id
projectsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(projects).where(eq(projects.id, req.params.id))
    if (rows.length === 0) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project', details: err })
  }
})

// POST /api/projects
projectsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }
  try {
    const rows = await db
      .insert(projects)
      .values({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      })
      .returning()
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project', details: err })
  }
})

// PATCH /api/projects/:id
projectsRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }
  try {
    const rows = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, req.params.id))
      .returning()
    if (rows.length === 0) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project', details: err })
  }
})

// DELETE /api/projects/:id
projectsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .delete(projects)
      .where(eq(projects.id, req.params.id))
      .returning()
    if (rows.length === 0) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project', details: err })
  }
})
