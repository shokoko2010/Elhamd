// Test script for offline payment API
const testOfflinePayment = async () => {
  try {
    console.log('Testing offline payment API...')
    
    // Test data - you'll need to replace these with actual values
    const testData = {
      invoiceId: 'your-invoice-id-here',
      amount: '1000',
      paymentMethod: 'CASH',
      notes: 'Test offline payment',
      referenceNumber: 'TEST-001',
      paymentDate: new Date().toISOString()
    }
    
    const response = await fetch('https://elhamdimport.com/api/finance/payments/offline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': document?.cookie || '' // This will need to be set manually
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', result)
    
    if (response.ok) {
      console.log('✅ Test passed - Payment recorded successfully')
    } else {
      console.log('❌ Test failed - Error:', result.error)
      console.log('Error code:', result.code)
      console.log('Error details:', result.details)
    }
  } catch (error) {
    console.error('❌ Test failed with exception:', error)
  }
}

// Uncomment to run in browser console
// testOfflinePayment()