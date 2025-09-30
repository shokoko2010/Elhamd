import { promises as fs } from 'fs'
import path from 'path'

async function initializeStorage() {
  console.log('Initializing storage directories...')
  
  const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
  const directories = [
    path.join(UPLOADS_DIR, 'vehicles'),
    path.join(UPLOADS_DIR, 'users'),
    path.join(UPLOADS_DIR, 'banners'),
    path.join(UPLOADS_DIR, 'company'),
    path.join(UPLOADS_DIR, 'brand'),
    path.join(UPLOADS_DIR, 'general')
  ]
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`Error creating directory ${dir}:`, error)
      }
    }
  }
  
  console.log('Storage directories initialized successfully!')
  
  console.log('\nSetup complete!')
  console.log('Upload directories are ready at:')
  console.log('- public/uploads/vehicles/')
  console.log('- public/uploads/users/')
}

initializeStorage().catch(console.error)