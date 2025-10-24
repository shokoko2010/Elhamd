'use client'

import { useAuth } from '@/hooks/use-auth-safe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AuthTestPage() {
  const { user, loading, error, authenticated, unauthenticated } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Authentication Test</h1>
          <p className="text-muted-foreground">
            Testing the authentication system and error handling
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Auth Status
              {loading && <AlertCircle className="h-5 w-5 animate-spin" />}
              {authenticated && <CheckCircle className="h-5 w-5 text-green-500" />}
              {unauthenticated && <XCircle className="h-5 w-5 text-red-500" />}
            </CardTitle>
            <CardDescription>
              Current authentication state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">
                  {loading ? 'Loading...' : authenticated ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Authenticated</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">
                  {loading ? 'Loading...' : unauthenticated ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-muted-foreground">Unauthenticated</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">
                  {error ? 'Error' : 'None'}
                </div>
                <div className="text-sm text-muted-foreground">Error Status</div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error:</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}

            {user && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-700 mb-2">User Information:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Name:</strong> {user.name || 'Not set'}</p>
                  <p><strong>Role:</strong> <Badge variant="secondary">{user.role}</Badge></p>
                  <p><strong>Permissions:</strong> {user.permissions.length} permissions</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission Tests</CardTitle>
            <CardDescription>
              Testing permission-based access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PermissionTest 
                name="Admin" 
                test={() => useAuth().isAdmin()} 
              />
              <PermissionTest 
                name="Staff" 
                test={() => useAuth().isStaff()} 
              />
              <PermissionTest 
                name="Customer" 
                test={() => useAuth().isCustomer()} 
              />
              <PermissionTest 
                name="View Invoices" 
                test={() => useAuth().canViewInvoices()} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Handling Test</CardTitle>
            <CardDescription>
              Testing Chrome extension error handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you see Chrome extension errors in the console, they should be handled gracefully 
              and not break the application.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // Simulate a Chrome extension error
                  const error = new Error('Could not establish connection. Receiving end does not exist.')
                  console.warn('Simulated Chrome extension error:', error)
                }}
                variant="outline"
              >
                Simulate Extension Error
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PermissionTest({ name, test }: { name: string; test: () => boolean }) {
  const hasPermission = test()
  
  return (
    <div className={`p-3 rounded-lg border ${hasPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2">
        {hasPermission ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {hasPermission ? 'Granted' : 'Denied'}
      </div>
    </div>
  )
}