'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, Trash2, Save, Send, Printer, User, Package, CreditCard, FileText } from 'lucide-react';

// Types
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
}

const InvoiceCreatePage = () => {
  // State management
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [invoiceType, setInvoiceType] = useState<string>('service');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Date.now()}`);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0
    }
  ]);
  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: '',
    name: '',
    email: '',
    address: ''
  });

  // Mock customer data
  const customers: Customer[] = [
    { id: '1', name: 'Acme Corporation', email: 'billing@acme.com', address: '123 Business St, City, State 12345' },
    { id: '2', name: 'Tech Solutions Inc.', email: 'accounts@techsolutions.com', address: '456 Tech Ave, Silicon Valley, CA 94025' },
    { id: '3', name: 'Global Enterprises', email: 'finance@global.com', address: '789 Corporate Blvd, New York, NY 10001' }
  ];

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Handle item changes
  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate total when quantity, unitPrice, or taxRate changes
          if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice * (1 + updatedItem.taxRate / 100);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Handle new customer creation
  const handleCreateCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      // In a real app, this would save to the database
      const customerId = Date.now().toString();
      const createdCustomer = { ...newCustomer, id: customerId };
      setSelectedCustomer(customerId);
      setNewCustomer({ id: '', name: '', email: '', address: '' });
      setShowNewCustomerForm(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">Create and send professional invoices to your clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Create & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewCustomerForm ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewCustomerForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Customer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-medium">New Customer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-name">Name *</Label>
                      <Input
                        id="new-name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-email">Email *</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        placeholder="customer@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="new-address">Address</Label>
                    <Input
                      id="new-address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      placeholder="Customer address"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateCustomer}>Create Customer</Button>
                    <Button variant="outline" onClick={() => setShowNewCustomerForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              
              {selectedCustomer && !showNewCustomerForm && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-medium mb-2">Selected Customer</h4>
                  <p className="text-sm text-muted-foreground">
                    {customers.find(c => c.id === selectedCustomer)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customers.find(c => c.id === selectedCustomer)?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customers.find(c => c.id === selectedCustomer)?.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-type">Invoice Type</Label>
                  <Select value={invoiceType} onValueChange={setInvoiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Invoice Items
                </CardTitle>
                <Button onClick={addItem} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${item.id}`}>Description</Label>
                        <Input
                          id={`description-${item.id}`}
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unit-price-${item.id}`}>Unit Price</Label>
                        <Input
                          id={`unit-price-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tax-rate-${item.id}`}>Tax Rate (%)</Label>
                        <Select
                          value={item.taxRate.toString()}
                          onValueChange={(value) => handleItemChange(item.id, 'taxRate', parseFloat(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="15">15%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                            <SelectItem value="25">25%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`total-${item.id}`}>Total</Label>
                        <Input
                          id={`total-${item.id}`}
                          value={`$${(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toFixed(2)}`}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes for the customer"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment terms and conditions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="pt-4 space-y-2">
                <Button className="w-full flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Button className="w-full flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Create & Send Invoice
                </Button>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Load Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Add Discount
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Set Recurring
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Attach Files
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;