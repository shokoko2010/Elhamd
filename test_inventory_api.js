const fetch = require('node-fetch');

async function testInventoryAPI() {
  try {
    console.log('Testing inventory API with unified auth...');
    
    // Test login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@alhamdcars.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', {
      status: loginResponse.status,
      success: loginResponse.ok,
      hasToken: !!loginData.token
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed, cannot proceed with API tests');
      return;
    }
    
    // Test inventory items API with Bearer token
    const itemsResponse = await fetch('http://localhost:3000/api/inventory/items', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const itemsData = await itemsResponse.json();
    console.log('Inventory items API response:', {
      endpoint: '/api/inventory/items',
      status: itemsResponse.status,
      success: itemsResponse.ok,
      hasItems: itemsData.items && Array.isArray(itemsData.items)
    });
    
    // Test warehouses API
    const warehousesResponse = await fetch('http://localhost:3000/api/inventory/warehouses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const warehousesData = await warehousesResponse.json();
    console.log('Warehouses API response:', {
      endpoint: '/api/inventory/warehouses',
      status: warehousesResponse.status,
      success: warehousesResponse.ok,
      isArray: Array.isArray(warehousesData)
    });
    
    // Test suppliers API
    const suppliersResponse = await fetch('http://localhost:3000/api/inventory/suppliers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const suppliersData = await suppliersResponse.json();
    console.log('Suppliers API response:', {
      endpoint: '/api/inventory/suppliers',
      status: suppliersResponse.status,
      success: suppliersResponse.ok,
      isArray: Array.isArray(suppliersData)
    });
    
    // Test branches API
    const branchesResponse = await fetch('http://localhost:3000/api/branches', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const branchesData = await branchesResponse.json();
    console.log('Branches API response:', {
      endpoint: '/api/branches',
      status: branchesResponse.status,
      success: branchesResponse.ok,
      hasBranches: branchesData.branches && Array.isArray(branchesData.branches)
    });
    
    // Test alerts API
    const alertsResponse = await fetch('http://localhost:3000/api/inventory/alerts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const alertsData = await alertsResponse.json();
    console.log('Alerts API response:', {
      endpoint: '/api/inventory/alerts',
      status: alertsResponse.status,
      success: alertsResponse.ok,
      isArray: Array.isArray(alertsData)
    });
    
    console.log('Inventory API test completed!');
    
  } catch (error) {
    console.error('Error during inventory API test:', error.message);
  }
}

testInventoryAPI();