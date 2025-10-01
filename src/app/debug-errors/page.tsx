'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  Bug, 
  RefreshCw, 
  Download, 
  Trash2,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface ErrorLog {
  id: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: string
  context?: any
  stack?: string
}

export default function DebugErrorsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug/logs')
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/debug/logs', { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to clear logs')
      }
      setLogs([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive'
      case 'warn':
        return 'secondary'
      case 'info':
        return 'default'
      case 'debug':
        return 'outline'
      default:
        return 'default'
    }
  }

  const errorLogs = logs.filter(log => log.level === 'error')
  const warnLogs = logs.filter(log => log.level === 'warn')
  const infoLogs = logs.filter(log => log.level === 'info')
  const debugLogs = logs.filter(log => log.level === 'debug')

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="mr-2">Loading logs...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Debug Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor and debug application errors and warnings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warnLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{infoLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({logs.length})</TabsTrigger>
          <TabsTrigger value="errors">Errors ({errorLogs.length})</TabsTrigger>
          <TabsTrigger value="warnings">Warnings ({warnLogs.length})</TabsTrigger>
          <TabsTrigger value="info">Info ({infoLogs.length})</TabsTrigger>
          <TabsTrigger value="debug">Debug ({debugLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <LogList logs={logs} getLevelIcon={getLevelIcon} getLevelColor={getLevelColor} />
        </TabsContent>
        <TabsContent value="errors" className="mt-4">
          <LogList logs={errorLogs} getLevelIcon={getLevelIcon} getLevelColor={getLevelColor} />
        </TabsContent>
        <TabsContent value="warnings" className="mt-4">
          <LogList logs={warnLogs} getLevelIcon={getLevelIcon} getLevelColor={getLevelColor} />
        </TabsContent>
        <TabsContent value="info" className="mt-4">
          <LogList logs={infoLogs} getLevelIcon={getLevelIcon} getLevelColor={getLevelColor} />
        </TabsContent>
        <TabsContent value="debug" className="mt-4">
          <LogList logs={debugLogs} getLevelIcon={getLevelIcon} getLevelColor={getLevelColor} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LogList({ 
  logs, 
  getLevelIcon, 
  getLevelColor 
}: { 
  logs: ErrorLog[]
  getLevelIcon: (level: string) => React.ReactNode
  getLevelColor: (level: string) => string
}) {
  return (
    <ScrollArea className="h-[600px] w-full border rounded-md">
      <div className="p-4">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No logs found
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getLevelColor(log.level) as any}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium mb-2">{log.message}</p>
                    {log.context && (
                      <details className="mb-2">
                        <summary className="text-sm text-muted-foreground cursor-pointer">
                          Context
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.stack && (
                      <details>
                        <summary className="text-sm text-muted-foreground cursor-pointer">
                          Stack Trace
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}