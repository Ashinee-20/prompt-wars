import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.join(rootDir, 'frontend', 'dist')
const targetDir = path.join(rootDir, 'backend', 'public')

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true })
  const entries = await fs.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

await fs.rm(targetDir, { recursive: true, force: true })
await copyDirectory(sourceDir, targetDir)
console.log(`Copied frontend build from ${sourceDir} to ${targetDir}`)
