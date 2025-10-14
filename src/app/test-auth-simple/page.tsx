'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function TestAuthSimpleContent() {
  const { user, loading } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const searchParams = useSearchParams()
  const showAdvanced = searchParams.get('advanced') === 'true'

  useEffect(() => {
    if (!loading) {
      if (user) {
        setTestResult(`✅ Logged in as: ${user.email} (${user.role})`)
      } else {
        setTestResult('❌ Not logged in')
      }
    }
  }, [user, loading])

  const testMediaAPI = async () => {
    try {
      setTestResult('🔄 Testing media API...')
      const response = await fetch('/api/media/stats')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Media API works! Found: ${JSON.stringify(data.data?.totalFiles || 0)} files`)
      } else {
        setTestResult(`❌ Media API failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const initializePermissions = async () => {
    try {
      setTestResult('🔄 Initializing permissions...')
      const response = await fetch('/api/admin/permissions/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Permissions initialized! Stats: ${JSON.stringify(data.stats, null, 2)}`)
      } else {
        setTestResult(`❌ Permission init failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const checkPermissions = async () => {
    try {
      setTestResult('🔄 Checking permissions...')
      const response = await fetch('/api/debug/auth/permissions-check')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Permissions check complete! Admin has ${data.adminUser?.permissions?.length || 0} permissions. Edit vehicles: ${data.adminUser?.permissions?.includes('edit_vehicles') ? '✅' : '❌'}`)
      } else {
        setTestResult(`❌ Permission check failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testImageUpload = async () => {
    try {
      setTestResult('🔄 Testing image upload permissions...')
      
      // First check auth
      const authResponse = await fetch('/api/test-auth')
      const authData = await authResponse.json()
      
      if (!authData.success) {
        setTestResult('❌ You must be logged in to test image upload')
        return
      }
      
      // Get first vehicle
      const vehiclesResponse = await fetch('/api/vehicles')
      const vehiclesData = await vehiclesResponse.json()
      
      if (!vehiclesData.success || !vehiclesData.data || vehiclesData.data.length === 0) {
        setTestResult('❌ No vehicles found for testing')
        return
      }
      
      const vehicle = vehiclesData.data[0]
      
      // Test image upload
      const testImageData = {
        imageUrl: 'https://via.placeholder.com/300x200.png?text=Test+Image',
        altText: 'Test Image',
        isPrimary: false
      }
      
      const uploadResponse = await fetch(`/api/admin/vehicles/${vehicle.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testImageData)
      })
      
      const uploadData = await uploadResponse.json()
      
      if (uploadResponse.ok) {
        setTestResult(`✅ Image upload test successful! Vehicle: ${vehicle.title}, Image ID: ${uploadData.id}`)
      } else {
        setTestResult(`❌ Image upload failed: ${uploadData.error || 'Permission denied'}. User role: ${authData.user.role}, Permissions: ${authData.user.permissions?.join(', ') || 'None'}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const comprehensivePermissionCheck = async () => {
    try {
      setTestResult('🔄 إجراء الفحص الشامل للصلاحيات...')
      
      const response = await fetch('/api/debug/auth/comprehensive-check')
      const data = await response.json()
      
      if (response.ok) {
        const results = data.results
        const issues = results.summary.issues
        
        if (results.summary.success) {
          setTestResult(`✅ الفحص الشامل ناجح! جميع الصلاحيات تعمل بشكل صحيح. المستخدمون: ${results.users.total}, الصلاحيات: ${results.permissions.total}`)
        } else {
          const issuesText = issues.length > 0 ? issues.join(' | ') : 'لا توجد مشاكل'
          setTestResult(`⚠️ الفحص الشامل اكتشف ${results.summary.totalIssues} مشاكل: ${issuesText}`)
        }
        
        // حفظ النتائج للعرض المتقدم
        setAnalysisResult(results)
      } else {
        setTestResult(`❌ فشل الفحص الشامل: ${data.error || 'خطأ غير معروف'}`)
      }
    } catch (error) {
      setTestResult(`❌ خطأ: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const runComprehensiveAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/debug/auth/comprehensive-check')
      const data = await response.json()
      
      if (response.ok) {
        setAnalysisResult(data.results)
      } else {
        setAnalysisResult({ error: data.error })
      }
    } catch (error) {
      setAnalysisResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Auth & Media Test</h1>
        
        {!showAdvanced ? (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div>
                  <p className="mb-2">{testResult}</p>
                  {user && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                      <h3 className="font-semibold mb-2">User Details:</h3>
                      <ul className="text-sm space-y-1">
                        <li>Email: {user.email}</li>
                        <li>Name: {user.name}</li>
                        <li>Role: {user.role}</li>
                        <li>Phone: {user.phone}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={testMediaAPI}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Media API
                </button>
                
                <button
                  onClick={initializePermissions}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
                >
                  Initialize Permissions
                </button>
                
                <button
                  onClick={checkPermissions}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ml-2"
                >
                  Check Permissions
                </button>
                
                <button
                  onClick={testImageUpload}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 ml-2"
                >
                  Test Image Upload
                </button>
                
                <button
                  onClick={comprehensivePermissionCheck}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2 block mt-2"
                >
                  📊 الفحص الشامل للصلاحيات
                </button>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">🔍 تحليل متقدم للصلاحيات</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    لتحليل مفصل وشامل لنظام الصلاحيات، قم بزيارة صفحة التحليل المتقدمة:
                  </p>
                  <a 
                    href="/test-auth-simple?advanced=true" 
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    📈 صفحة التحليل المتقدم
                  </a>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>If you're not logged in, please:</p>
                  <ol className="list-decimal list-inside mt-2">
                    <li>Go to <a href="/login" className="text-blue-600 underline">Login page</a></li>
                    <li>Login with: admin@elhamdimports.com / admin123</li>
                    <li>Return to this test page</li>
                    <li>Try the media API test again</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* العودة للصفحة البسيطة */}
            <div className="text-center">
              <a 
                href="/test-auth-simple" 
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                ← العودة للصفحة البسيطة
              </a>
            </div>

            {/* التحليل المتقدم */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">📊 تحليل شامل لنظام الصلاحيات</h2>
              
              <div className="text-center mb-6">
                <button
                  onClick={runComprehensiveAnalysis}
                  disabled={analysisLoading}
                  className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {analysisLoading ? '🔄 جاري التحليل...' : '🔍 بدء التحليل الشامل'}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="space-y-8">
                {/* ملخص النتائج */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">📋 ملخص النتائج</h2>
                  {analysisResult.error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <strong>خطأ:</strong> {analysisResult.error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg ${analysisResult.summary.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className="text-lg font-semibold">
                          {analysisResult.summary.success ? '✅ النظام سليم' : '⚠️ توجد مشاكل'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysisResult.summary.totalIssues} مشكلة تم اكتشافها
                        </div>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <div className="text-lg font-semibold">👥 المستخدمون</div>
                        <div className="text-sm text-gray-600">
                          {analysisResult.users?.total || 0} مستخدم مسجل
                        </div>
                      </div>
                      <div className="bg-purple-100 p-4 rounded-lg">
                        <div className="text-lg font-semibold">🔑 الصلاحيات</div>
                        <div className="text-sm text-gray-600">
                          {analysisResult.permissions?.total || 0} صلاحية معرفة
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* المشاكل المكتشفة */}
                {analysisResult.summary?.issues && analysisResult.summary.issues.length > 0 && (
                  <div className="bg-red-50 rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 text-red-800">⚠️ المشاكل المكتشفة</h2>
                    <ul className="space-y-2">
                      {analysisResult.summary.issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 ml-2">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* تحليل قاعدة البيانات */}
                {analysisResult.database && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">🗄️ تحليل قاعدة البيانات</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{analysisResult.database.permissionsCount}</div>
                        <div className="text-sm text-gray-600">صلاحية</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{analysisResult.database.roleTemplatesCount}</div>
                        <div className="text-sm text-gray-600">قالب دور</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">{analysisResult.database.userPermissionsCount}</div>
                        <div className="text-sm text-gray-600">صلاحية مستخدم</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">{analysisResult.database.usersCount}</div>
                        <div className="text-sm text-gray-600">مستخدم</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* تحليل المستخدمين */}
                {analysisResult.users && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">👥 تحليل المستخدمين</h2>
                    
                    {/* المستخدمون حسب الدور */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">المستخدمون حسب الدور</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(analysisResult.users.byRole || {}).map(([role, data]: [string, any]) => (
                          <div key={role} className="border rounded-lg p-4">
                            <div className="font-semibold">{role}</div>
                            <div className="text-sm text-gray-600">{data.count} مستخدم</div>
                            <div className="text-xs text-gray-500">
                              صلاحيات: {data.permissionsCount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* المستخدمون المفصلون */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">تفاصيل المستخدمين</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-right">البريد الإلكتروني</th>
                              <th className="px-4 py-2 text-right">الدور</th>
                              <th className="px-4 py-2 text-right">الصلاحيات</th>
                              <th className="px-4 py-2 text-right">الحالة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisResult.users.details?.map((user: any, index: number) => (
                              <tr key={index} className="border-b">
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm">{user.permissionsCount}</td>
                                <td className="px-4 py-2">
                                  {user.hasRequiredPermissions ? (
                                    <span className="text-green-600">✅</span>
                                  ) : (
                                    <span className="text-red-600">❌</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* تحليل الصلاحيات */}
                {analysisResult.permissions && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">🔑 تحليل الصلاحيات</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">الصلاحيات المتاحة</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {analysisResult.permissions.available?.map((permission: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded border">
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">الصلاحيات المطلوبة للنظام</h3>
                      <div className="space-y-2">
                        {analysisResult.permissions.required?.map((permission: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">{permission}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              analysisResult.permissions.available?.some((p: any) => p.name === permission)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {analysisResult.permissions.available?.some((p: any) => p.name === permission) ? 'متاحة' : 'مفقودة'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* التوصيات */}
                {analysisResult.recommendations && (
                  <div className="bg-blue-50 rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 text-blue-800">💡 التوصيات</h2>
                    <ul className="space-y-3">
                      {analysisResult.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 ml-2">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TestAuthSimplePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>}>
      <TestAuthSimpleContent />
    </Suspense>
  )
}