'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PERMISSIONS } from '@/lib/permissions'
import { getPermissionLabelAr } from '@/lib/permission-translations'

export default function FinanceDebugPage() {
  const { user, hasPermission, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/auth')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Error fetching debug info:', error)
    }
  }

  const checkPermissions = () => {
    const requiredPermissions = [
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.CREATE_INVOICES,
      PERMISSIONS.ACCESS_FINANCE_DASHBOARD,
      PERMISSIONS.VIEW_FINANCIAL_OVERVIEW
    ]

    return requiredPermissions.map(permission => ({
      name: permission,
      label: getPermissionLabelAr(permission),
      has: hasPermission(permission)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Finance Debug Page</h1>
        <Button onClick={fetchDebugInfo}>Refresh Debug Info</Button>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Current user authentication status</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Permissions Count:</strong> {user.permissions?.length || 0}</p>
            </div>
          ) : (
            <p className="text-red-600">No user authenticated</p>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Technical details about authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>Has Session:</strong> {debugInfo.hasSession ? 'Yes' : 'No'}</p>
              <p><strong>Host:</strong> {debugInfo.headers.host}</p>
              <p><strong>Cookie Present:</strong> {debugInfo.headers.cookie}</p>
              <p><strong>NEXTAUTH_URL:</strong> {debugInfo.env.NEXTAUTH_URL}</p>
              <p><strong>NODE_ENV:</strong> {debugInfo.env.NODE_ENV}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Check */}
      <Card>
        <CardHeader>
          <CardTitle>Finance Permissions Check</CardTitle>
          <CardDescription>Required permissions for finance module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checkPermissions().map((perm, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-mono text-sm">{perm.label}</span>
                <Badge variant={perm.has ? 'default' : 'destructive'}>
                  {perm.has ? 'Granted' : 'Missing'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Quick actions to test access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => window.location.href = '/admin/finance'}
            className="w-full"
          >
            Go to Finance Page
          </Button>
          <Button 
            onClick={() => window.location.href = '/login'}
            variant="outline"
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}