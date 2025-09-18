import { LocalStorageService } from '../src/lib/local-storage'

async function initializeStorage() {
  console.log('Initializing storage directories...')
  await LocalStorageService.initialize()
  console.log('Storage directories initialized successfully!')
  
  console.log('\nSetup complete!')
  console.log('Upload directories are ready at:')
  console.log('- public/uploads/vehicles/')
  console.log('- public/uploads/users/')
}

initializeStorage().catch(console.error)