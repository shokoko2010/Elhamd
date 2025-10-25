#!/bin/bash

echo "🔧 Testing API fixes..."

# Test 1: Create Customer API
echo "📝 Testing Customer Creation API..."
curl -X POST https://elhamdimport.com/api/crm/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "+201234567890",
    "segment": "LEAD"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -o customer_response.json

# Test 2: Create Invoice API  
echo "🧾 Testing Invoice Creation API..."
curl -X POST https://elhamdimport.com/api/finance/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-customer-id",
    "type": "SERVICE",
    "items": [
      {
        "description": "Test Service",
        "quantity": 1,
        "unitPrice": 1000
      }
    ],
    "issueDate": "2024-01-01",
    "dueDate": "2024-01-15",
    "createdBy": "admin@elhamdimport.online"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -o invoice_response.json

# Test 3: Logout API
echo "🚪 Testing Logout API..."
curl -X POST https://elhamdimport.com/api/auth/signout \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -o logout_response.json

echo "✅ Tests completed. Check response files for details."