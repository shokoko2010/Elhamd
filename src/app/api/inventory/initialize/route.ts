interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

const authHandler = async (request: NextRequest) => {
  try {
    return await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    // Check if warehouses already exist
    const existingWarehouses = await db.warehouse.findMany()
    let warehousesCreated = 0

    if (existingWarehouses.length === 0) {
      // Create default warehouses
      const defaultWarehouses = [
        {
          name: 'المستودع الرئيسي',
          location: 'القاهرة، مصر',
          capacity: 1000,
          manager: 'أحمد محمد',
          contact: '01012345678',
          status: 'active'
        },
        {
          name: 'مستودع قطع الغيار',
          location: 'القاهرة، مصر',
          capacity: 500,
          manager: 'محمد علي',
          contact: '01023456789',
          status: 'active'
        },
        {
          name: 'مستودع السيارات',
          location: 'الإسكندرية، مصر',
          capacity: 100,
          manager: 'خالد سعيد',
          contact: '01034567890',
          status: 'active'
        }
      ]

      for (const warehouse of defaultWarehouses) {
        await db.warehouse.create({
          data: warehouse
        })
        warehousesCreated++
      }
    }

    // Check if suppliers already exist
    const existingSuppliers = await db.supplier.findMany()
    let suppliersCreated = 0

    if (existingSuppliers.length === 0) {
      // Create default suppliers
      const defaultSuppliers = [
        {
          name: 'شركة الأجزاء المتقدمة',
          contact: 'محمد خالد',
          email: 'info@advancedparts.com',
          phone: '0223456789',
          address: 'القاهرة، مصر',
          rating: 4.5,
          status: 'active',
          leadTime: 3,
          minOrderAmount: 1000
        },
        {
          name: 'مستوردات السيارات العالمية',
          contact: 'أحمد حسن',
          email: 'sales@globalimports.com',
          phone: '0224567890',
          address: 'الإسكندرية، مصر',
          rating: 4.2,
          status: 'active',
          leadTime: 7,
          minOrderAmount: 5000
        },
        {
          name: 'شركة المحركات المتخصصة',
          contact: 'خالد إبراهيم',
          email: 'engines@specialized.com',
          phone: '0225678901',
          address: 'الجيزة، مصر',
          rating: 4.8,
          status: 'active',
          leadTime: 5,
          minOrderAmount: 2000
        },
        {
          name: 'مورد الإطارات الموثوق',
          contact: 'محمود عبدالله',
          email: 'tires@reliable.com',
          phone: '0226789012',
          address: 'القاهرة، مصر',
          rating: 4.3,
          status: 'active',
          leadTime: 2,
          minOrderAmount: 800
        },
        {
          name: 'شركة الكهرباء والأنظمة',
          contact: 'يوسف محمد',
          email: 'electrical@systems.com',
          phone: '0227890123',
          address: 'القاهرة، مصر',
          rating: 4.1,
          status: 'active',
          leadTime: 4,
          minOrderAmount: 1500
        }
      ]

      for (const supplier of defaultSuppliers) {
        await db.supplier.create({
          data: supplier
        })
        suppliersCreated++
      }
    }

    return NextResponse.json({
      message: 'Default data initialized successfully',
      warehousesCreated,
      suppliersCreated,
      totalWarehouses: existingWarehouses.length + warehousesCreated,
      totalSuppliers: existingSuppliers.length + suppliersCreated
    })

  } catch (error) {
    console.error('Error initializing default data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}