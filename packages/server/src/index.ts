import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { projectsRouter } from './routes/projects.js'
import { filesRouter } from './routes/files.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/projects', projectsRouter)
app.use('/api/projects', filesRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' })
})

app.listen(PORT, () => {
  // intentional startup log — not a debug console.log
  process.stdout.write(`[server] Running on http://localhost:${PORT}\n`)
})
