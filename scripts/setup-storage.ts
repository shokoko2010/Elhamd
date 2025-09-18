import { LocalStorageService } from '../src/lib/local-storage'
import ZAI from 'z-ai-web-dev-sdk'

async function initializeStorage() {
  console.log('Initializing storage directories...')
  await LocalStorageService.initialize()
  console.log('Storage directories initialized successfully!')
}

async function generateSampleImages() {
  console.log('Generating sample vehicle images...')
  
  try {
    const zai = await ZAI.create()
    
    // Sample vehicle images to generate
    const vehicles = [
      { id: '1', make: 'Tata', model: 'Nexon' },
      { id: '2', make: 'Tata', model: 'Punch' },
      { id: '3', make: 'Tata', model: 'Tiago' },
      { id: '4', make: 'Tata', model: 'Harrier' },
      { id: '5', make: 'Tata', model: 'Altroz' },
      { id: '6', make: 'Tata', model: 'Tigor' }
    ]

    for (const vehicle of vehicles) {
      console.log(`Generating images for ${vehicle.make} ${vehicle.model}...`)
      
      // Generate 3 images for each vehicle
      for (let i = 1; i <= 3; i++) {
        const prompt = `Professional car photo of ${vehicle.make} ${vehicle.model}, ${i === 1 ? 'front view' : i === 2 ? 'side view' : 'rear view'}, studio lighting, high quality, realistic`
        
        try {
          const response = await zai.images.generations.create({
            prompt,
            size: '1024x768'
          })

          const base64Image = response.data[0].base64
          
          // Convert base64 to File
          const byteCharacters = atob(base64Image)
          const byteNumbers = new Array(byteCharacters.length)
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'image/jpeg' })
          const file = new File([blob], `${vehicle.make}-${vehicle.model}-${i}.jpg`, { type: 'image/jpeg' })

          // Upload the image
          const result = await LocalStorageService.uploadVehicleImage(
            file,
            vehicle.id,
            i === 1, // First image is primary
            i - 1
          )

          console.log(`✓ Generated and uploaded ${vehicle.make} ${vehicle.model} image ${i}`)
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`Failed to generate image for ${vehicle.make} ${vehicle.model} image ${i}:`, error)
        }
      }
    }

    console.log('Sample images generated successfully!')
    
  } catch (error) {
    console.error('Error generating sample images:', error)
    console.log('You can manually upload images to the public/uploads/vehicles directory')
  }
}

async function main() {
  await initializeStorage()
  
  // Ask user if they want to generate sample images
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.question('Do you want to generate sample vehicle images? (y/N): ', async (answer) => {
    readline.close()
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await generateSampleImages()
    } else {
      console.log('You can manually upload images to the public/uploads/vehicles directory')
    }
    
    console.log('\nSetup complete!')
    console.log('Upload directories are ready at:')
    console.log('- public/uploads/vehicles/')
    console.log('- public/uploads/users/')
  })
}

main().catch(console.error)