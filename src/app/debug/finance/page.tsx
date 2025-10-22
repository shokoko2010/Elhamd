'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [invoiceId, setInvoiceId] = useState('test-invoice-id')
  const [amount, setAmount] = useState('100')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [results, setResults] = useState<any>(null)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResults(data)
      toast({
        title: 'Test Result',
        description: response.ok ? 'Connection successful' : 'Connection failed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test connection',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const testOfflinePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/offline-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId,
          amount: parseFloat(amount),
          paymentMethod,
          notes: 'Test payment',
          referenceNumber: 'TEST-123',
          paymentDate: new Date().toISOString().split('T')[0]
        })
      })
      const data = await response.json()
      setResults(data)
      toast({
        title: 'Offline Payment Test',
        description: response.ok ? 'Payment test successful' : 'Payment test failed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test offline payment',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const testRealOfflinePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/finance/payments/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId,
          amount: parseFloat(amount),
          paymentMethod,
          notes: 'Test payment',
          referenceNumber: 'TEST-123',
          paymentDate: new Date().toISOString().split('T')[0]
        })
      })
      const data = await response.json()
      setResults(data)
      toast({
        title: 'Real Offline Payment Test',
        description: response.ok ? 'Real payment test successful' : 'Real payment test failed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test real offline payment',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Finance API Debug</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
            <CardDescription>Test database connection and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testConnection} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Offline Payment (Debug)</CardTitle>
            <CardDescription>Test the debug offline payment API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input
                id="invoiceId"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="Enter invoice ID"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={testOfflinePayment} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test Debug Payment'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Real Offline Payment</CardTitle>
            <CardDescription>Test the real offline payment API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testRealOfflinePayment} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test Real Payment'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>API test results</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {results ? JSON.stringify(results, null, 2) : 'No results yet'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}