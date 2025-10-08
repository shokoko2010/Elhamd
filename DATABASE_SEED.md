# Database Seed Documentation

## Overview
This document describes the comprehensive database seeding process for the Alhamd Cars application using Prisma Postgres.

## Database Configuration
- **Database**: Prisma Postgres (Production)
- **Environment**: Vercel deployment
- **Connection**: PostgreSQL with SSL

## Seed Data Created

### 1. Branches (2)
- **الفرع الرئيسي - القاهرة** (CAI-001)
  - Address: شارع التحرير، القاهرة، مصر
  - Phone: +20 2 1234 5678
  - Services: Sales, Service, Parts, Finance

- **فرع الإسكندرية** (ALX-001)
  - Address: شارع الجيش، الإسكندرية، مصر
  - Phone: +20 3 1234 5678
  - Services: Sales, Service

### 2. Permissions (14)
Organized by category:
- **User Management**: view_users, create_users, edit_users, delete_users, manage_user_roles
- **Vehicle Management**: view_vehicles, create_vehicles, edit_vehicles, delete_vehicles, manage_pricing
- **Bookings Management**: view_bookings, create_bookings, edit_bookings, cancel_bookings, approve_bookings
- **Content Management**: view_sliders, create_sliders, edit_sliders, delete_sliders, view_settings, edit_settings
- **Reports & Analytics**: view_reports, export_reports, view_analytics
- **System Administration**: view_system_logs, manage_backup, system_settings
- **Branch Management**: view_branches, create_branches, edit_branches, delete_branches

### 3. Role Templates (4)
- **Administrator**: Full system access with all permissions
- **Branch Manager**: Limited permissions for branch management
- **Sales Representative**: Sales focused role with customer management
- **Service Advisor**: Service and maintenance focused role

### 4. Users (7)
All users use password: `admin123`

#### Admin Users
- **Super Admin**: admin@elhamd-cars.com
  - Role: Administrator
  - Segment: VIP
  - 2FA enabled

- **Branch Manager**: manager.cairo@elhamd-cars.com
  - Role: Manager
  - Branch: القاهرة
  - Can approve discounts up to 15%

#### Staff Users
- **Sales Rep 1**: sales.rep1@elhamd-cars.com
  - Role: Sales Representative
  - Branch: القاهرة

- **Sales Rep 2**: sales.rep2@elhamd-cars.com
  - Role: Sales Representative
  - Branch: الإسكندرية

- **Service Advisor**: service.advisor1@elhamd-cars.com
  - Role: Service Advisor
  - Branch: القاهرة

#### Customer Users
- **Customer 1**: customer1@example.com
  - Role: Customer
  - Segment: Regular

- **Customer 2**: customer2@example.com
  - Role: Customer
  - Segment: VIP

### 5. Site Settings
- **Site Title**: الحمد للسيارات
- **Description**: مركز سيارات الحمد - أفضل خدمة لسيارتك. وكيل معتمد لتاتا للسيارات في مصر
- **Contact**: info@elhamd-cars.com | +20 2 1234 5678
- **Working Hours**: الأحد - الخميس: 9:00 ص - 8:00 م | الجمعة - السبت: 10:00 ص - 6:00 م
- **Social Media**: Facebook, Twitter, Instagram, YouTube, WhatsApp

### 6. Homepage Sliders (5)
1. **تاتا نيكسون 2024** - SUV عائلية متطورة
2. **تاتا بانش** - SUV مدمجة للمدن
3. **تاتا تياجو إلكتريك** - مستقبل الكهرباء
4. **عرض خاص** - تخفيضات تصل إلى 15%
5. **تاتا هارير** - SUV فاخرة

### 7. Service Types (7)
- **صيانة دورية أساسية**: 350 ج.م (60 دقيقة)
- **صيانة شاملة**: 750 ج.م (120 دقيقة)
- **صيانة مكيف**: 250 ج.م (45 دقيقة)
- **صيانة فرامل**: 600 ج.م (90 دقيقة)
- **تغيير زيت**: 150 ج.م (30 دقيقة)
- **فحص تشخيصي**: 200 ج.م (60 دقيقة)
- **غسيل وتلميع**: 180 ج.م (90 دقيقة)

### 8. Vehicles (7)
All vehicles are 2024 models with full specifications and images:

#### Electric Vehicles
- **Tata Nexon EV**: 550,000 ج.م - SUV - 312 km range

#### Petrol Vehicles
- **Tata Nexon**: 450,000 ج.م - SUV - Featured
- **Tata Punch**: 320,000 ج.م - Compact - Featured
- **Tata Tiago**: 280,000 ج.م - Hatchback
- **Tata Altroz**: 350,000 ج.م - Hatchback

#### Diesel Vehicles
- **Tata Harrier**: 650,000 ج.م - SUV - Featured
- **Tata Safari**: 750,000 ج.م - SUV - Featured (7 seats)

### 9. Vehicle Images (19)
Each vehicle has multiple high-quality images:
- Front view (Primary image)
- Side view
- Rear view
- Interior (for selected models)

## Running the Seed

### Development
```bash
npx tsx prisma/seed-safe.ts
```

### Production (Vercel)
The seed is designed to be safe for production environments:
- Does not delete existing data
- Only creates new records if they don't exist
- Handles foreign key constraints properly

## Security Notes
- All user passwords are hashed using bcryptjs
- Default password for all accounts: `admin123`
- Admin user has 2FA enabled in settings
- Security logs are created for tracking user actions

## Data Relationships
- Users are assigned to branches
- Vehicles are assigned to branches
- Role templates define user permissions
- Bookings link customers to vehicles and services
- Images are associated with vehicles

## Next Steps
1. Update user passwords in production
2. Configure 2FA for admin users
3. Set up actual vehicle images
4. Configure real service pricing
5. Add more branches as needed

## Troubleshooting
If you encounter foreign key constraint errors, use the safe seed script:
```bash
npx tsx prisma/seed-safe.ts
```

This script handles existing data gracefully and doesn't force delete records.