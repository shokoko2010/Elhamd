// Test script to verify authentication and API endpoints
const fetch = require('node-fetch');

async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing API endpoints...\n');
  
  // Test 1: Login to get token
  console.log('1. Testing login...');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
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
    
    if (loginResponse.ok) {
      console.log('✓ Login successful');
      console.log('Token received:', loginData.token ? 'Yes' : 'No');
      
      const token = loginData.token;
      
      // Test 2: Try accessing inventory items with token
      console.log('\n2. Testing inventory items API...');
      try {
        const itemsResponse = await fetch(`${baseUrl}/api/inventory/items`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const itemsData = await itemsResponse.json();
        
        if (itemsResponse.ok) {
          console.log('✓ Inventory items API successful');
          console.log('Items count:', itemsData.items ? itemsData.items.length : 0);
        } else {
          console.log('✗ Inventory items API failed:', itemsResponse.status, itemsData.error);
        }
      } catch (error) {
        console.log('✗ Inventory items API error:', error.message);
      }
      
      // Test 3: Try accessing warehouses
      console.log('\n3. Testing warehouses API...');
      try {
        const warehousesResponse = await fetch(`${baseUrl}/api/inventory/warehouses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const warehousesData = await warehousesResponse.json();
        
        if (warehousesResponse.ok) {
          console.log('✓ Warehouses API successful');
          console.log('Warehouses count:', Array.isArray(warehousesData) ? warehousesData.length : 'Not an array');
        } else {
          console.log('✗ Warehouses API failed:', warehousesResponse.status, warehousesData.error);
        }
      } catch (error) {
        console.log('✗ Warehouses API error:', error.message);
      }
      
      // Test 4: Try accessing suppliers
      console.log('\n4. Testing suppliers API...');
      try {
        const suppliersResponse = await fetch(`${baseUrl}/api/inventory/suppliers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const suppliersData = await suppliersResponse.json();
        
        if (suppliersResponse.ok) {
          console.log('✓ Suppliers API successful');
          console.log('Suppliers count:', Array.isArray(suppliersData) ? suppliersData.length : 'Not an array');
        } else {
          console.log('✗ Suppliers API failed:', suppliersResponse.status, suppliersData.error);
        }
      } catch (error) {
        console.log('✗ Suppliers API error:', error.message);
      }
      
      // Test 5: Try accessing alerts
      console.log('\n5. Testing alerts API...');
      try {
        const alertsResponse = await fetch(`${baseUrl}/api/inventory/alerts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const alertsData = await alertsResponse.json();
        
        if (alertsResponse.ok) {
          console.log('✓ Alerts API successful');
          console.log('Alerts count:', Array.isArray(alertsData) ? alertsData.length : 'Not an array');
        } else {
          console.log('✗ Alerts API failed:', alertsResponse.status, alertsData.error);
        }
      } catch (error) {
        console.log('✗ Alerts API error:', error.message);
      }
      
      // Test 6: Try accessing branches
      console.log('\n6. Testing branches API...');
      try {
        const branchesResponse = await fetch(`${baseUrl}/api/branches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const branchesData = await branchesResponse.json();
        
        if (branchesResponse.ok) {
          console.log('✓ Branches API successful');
          console.log('Branches count:', branchesData.branches ? branchesData.branches.length : 0);
        } else {
          console.log('✗ Branches API failed:', branchesResponse.status, branchesData.error);
        }
      } catch (error) {
        console.log('✗ Branches API error:', error.message);
      }
      
    } else {
      console.log('✗ Login failed:', loginResponse.status, loginData.error);
    }
  } catch (error) {
    console.log('✗ Login error:', error.message);
  }
  
  console.log('\nTest completed!');
}

testAPI().catch(console.error);