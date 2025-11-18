-- CreateEnum
CREATE TYPE "VehicleSpecCategory" AS ENUM ('ENGINE', 'EXTERIOR', 'INTERIOR', 'SAFETY', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'ACCOUNTANT', 'STAFF', 'BRANCH_MANAGER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PermissionCategory" AS ENUM ('USER_MANAGEMENT', 'VEHICLE_MANAGEMENT', 'BOOKING_MANAGEMENT', 'SERVICE_MANAGEMENT', 'INVENTORY_MANAGEMENT', 'FINANCIAL_MANAGEMENT', 'REPORTING', 'SYSTEM_SETTINGS', 'BRANCH_MANAGEMENT', 'CUSTOMER_MANAGEMENT', 'MARKETING_MANAGEMENT');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('SEDAN', 'SUV', 'HATCHBACK', 'TRUCK', 'VAN', 'COMMERCIAL', 'BUS', 'PICKUP');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC', 'CVT');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('MAINTENANCE', 'REPAIR', 'INSPECTION', 'DETAILING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_WALLET', 'CHECK');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('SERVICE', 'TEST_DRIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'BOOKING_CANCELLATION', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PROMOTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'BOOKING_CANCELLATION', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'WELCOME', 'PROMOTION');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('APPOINTMENT', 'MEETING', 'TASK_DEADLINE', 'REMINDER', 'AVAILABILITY');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PerformancePeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "FooterColumnType" AS ENUM ('LINKS', 'TEXT', 'CONTACT', 'SOCIAL');

-- CreateEnum
CREATE TYPE "CustomerSegment" AS ENUM ('LEAD', 'PROSPECT', 'CUSTOMER', 'VIP', 'INACTIVE', 'LOST');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'SMS', 'SOCIAL_MEDIA', 'WEBSITE_VISIT', 'TEST_DRIVE', 'SERVICE_VISIT', 'PURCHASE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'ADVERTISEMENT', 'TRADE_SHOW', 'COLD_CALL', 'WALK_IN', 'EMAIL_CAMPAIGN', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EMAIL', 'SMS', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'EVENT', 'REFERRAL', 'LOYALTY');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InvoicePaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERPAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('SERVICE', 'PRODUCT', 'SUBSCRIPTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED_TO_INVOICE');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PARTIALLY_DELIVERED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'SALES_TAX', 'SERVICE_TAX', 'INCOME_TAX', 'CORPORATE_TAX', 'CUSTOMS_DUTY', 'STAMP_DUTY', 'PROPERTY_TAX', 'WITHHOLDING_TAX', 'PAYROLL_TAX', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TaxStatus" AS ENUM ('PENDING', 'CALCULATED', 'FILED', 'PAID', 'OVERDUE', 'CANCELLED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('FAWRY', 'PAYMOB', 'CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_WALLET');

-- CreateEnum
CREATE TYPE "FinancialReportType" AS ENUM ('INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW', 'SALES_REPORT', 'TAX_REPORT', 'CUSTOMER_REPORT', 'INVENTORY_REPORT');

-- CreateEnum
CREATE TYPE "TaxRateType" AS ENUM ('STANDARD', 'REDUCED', 'ZERO', 'EXEMPT');

-- CreateEnum
CREATE TYPE "CustomerTag" AS ENUM ('HOT_LEAD', 'COLD_LEAD', 'VIP', 'HIGH_VALUE', 'PRICE_SENSITIVE', 'LOYAL', 'NEW_CUSTOMER', 'RETURNING_CUSTOMER', 'INACTIVE_CUSTOMER', 'CORPORATE', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "MarketingAutomationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('RATING', 'REVIEW', 'COMPLAINT', 'SUGGESTION', 'TESTIMONIAL');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING', 'DAMAGED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('GENERAL', 'TECHNICAL', 'BILLING', 'SERVICE', 'SALES', 'PARTS', 'WARRANTY', 'COMPLAINT', 'SUGGESTION', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_VENDOR', 'RESOLVED', 'CLOSED', 'CANCELLED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('WEB', 'EMAIL', 'PHONE', 'SOCIAL_MEDIA', 'IN_PERSON', 'MOBILE_APP', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketAction" AS ENUM ('CREATED', 'ASSIGNED', 'REASSIGNED', 'UPDATED', 'COMMENTED', 'ESCALATED', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'REVIEWED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('SERVICE', 'PRODUCT', 'BILLING', 'STAFF', 'FACILITY', 'DELIVERY', 'WARRANTY', 'PARTS', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('RECEIVED', 'UNDER_INVESTIGATION', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED', 'ESCALATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ComplaintSource" AS ENUM ('WEB', 'EMAIL', 'PHONE', 'IN_PERSON', 'SOCIAL_MEDIA', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpAction" AS ENUM ('CONTACTED_CUSTOMER', 'REQUESTED_INFORMATION', 'PROVIDED_UPDATE', 'ESCALATED', 'RESOLVED', 'SCHEDULED_FOLLOW_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MetricPeriod" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK', 'DEMO', 'PROPOSAL', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'MEETING', 'SOCIAL_MEDIA', 'OTHER');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('REVENUE', 'LEADS', 'CONVERSIONS', 'SALES', 'ACTIVITIES', 'CUSTOMERS');

-- CreateEnum
CREATE TYPE "TargetPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssignedType" AS ENUM ('USER', 'TEAM', 'DEPARTMENT', 'BRANCH');

-- CreateEnum
CREATE TYPE "TargetStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'POSTED', 'APPROVED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE', 'SICK_LEAVE', 'VACATION');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PROCESSED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalaryAdvanceStatus" AS ENUM ('PENDING', 'APPROVED', 'DISBURSED', 'IN_REPAYMENT', 'REPAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY', 'STUDY');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PerformanceRating" AS ENUM ('EXCELLENT', 'VERY_GOOD', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'POOR');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('VEHICLE_SALE', 'SERVICE_CONTRACT', 'MAINTENANCE_AGREEMENT', 'LEASING', 'FINANCING', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WarrantyType" AS ENUM ('MANUFACTURER', 'DEALER', 'EXTENDED', 'SERVICE', 'PARTS', 'COMPREHENSIVE');

-- CreateEnum
CREATE TYPE "WarrantyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'VOID', 'PENDING');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('ROUTINE', 'PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION', 'OIL_CHANGE', 'TIRE_SERVICE', 'BRAKE_SERVICE', 'BATTERY_SERVICE', 'AIR_CONDITIONING', 'ENGINE_SERVICE', 'TRANSMISSION_SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PartStatus" AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ORDERED', 'RESERVED');

-- CreateEnum
CREATE TYPE "HomepageTheme" AS ENUM ('LIGHT', 'DARK', 'AUTO');

-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('ENGINE', 'TRANSMISSION', 'BRAKE', 'SUSPENSION', 'ELECTRICAL', 'BODY', 'INTERIOR', 'EXTERIOR', 'TIRE', 'BATTERY', 'OIL', 'FILTER', 'OTHER');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('COMPREHENSIVE', 'THIRD_PARTY', 'THIRD_PARTY_FIRE_THEFT', 'PERSONAL_ACCIDENT', 'MEDICAL', 'TRAVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'SUSPENDED', 'RENEWED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PopupPosition" AS ENUM ('TOP_LEFT', 'TOP_CENTER', 'TOP_RIGHT', 'CENTER', 'BOTTOM_LEFT', 'BOTTOM_CENTER', 'BOTTOM_RIGHT');

-- CreateTable
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "securitySettings" JSONB,
    "segment" "CustomerSegment" NOT NULL DEFAULT 'CUSTOMER',
    "status" TEXT NOT NULL DEFAULT 'active',
    "branchId" TEXT,
    "roleTemplateId" TEXT,
    "customPermissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openingDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "stockNumber" TEXT NOT NULL,
    "vin" TEXT,
    "description" TEXT,
    "category" "VehicleCategory" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "TransmissionType" NOT NULL,
    "mileage" INTEGER,
    "color" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_specifications" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" "VehicleSpecCategory" NOT NULL DEFAULT 'ENGINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_pricing" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "discountPercentage" DOUBLE PRECISION,
    "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "hasDiscount" BOOLEAN NOT NULL DEFAULT false,
    "discountExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_drive_bookings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_drive_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "category" "ServiceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bookings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "timeSlotId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "totalPrice" DOUBLE PRECISION,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PermissionCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role" "UserRole" NOT NULL,
    "permissions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_template_permissions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_template_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedBy" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "bookingType" "BookingType" NOT NULL DEFAULT 'SERVICE',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transactionId" TEXT,
    "receiptUrl" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "branchId" TEXT,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "serviceBookingId" TEXT,
    "testDriveBookingId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "EmailTemplateType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT,
    "customerId" TEXT,
    "bookingId" TEXT,
    "notes" TEXT,
    "estimatedHours" INTEGER NOT NULL DEFAULT 0,
    "actualHours" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "attachments" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "type" "BookingType" NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "serviceTypeId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "totalPrice" DOUBLE PRECISION,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "CalendarEventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "attendees" JSONB NOT NULL,
    "bookingId" TEXT,
    "taskId" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "meetingLink" TEXT,
    "attachments" JSONB,
    "reminders" JSONB,
    "organizerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" "PerformancePeriod" NOT NULL,
    "periodLabel" TEXT NOT NULL DEFAULT 'CURRENT',
    "bookingsHandled" INTEGER NOT NULL,
    "averageHandlingTime" DOUBLE PRECISION NOT NULL,
    "customerRating" DOUBLE PRECISION NOT NULL,
    "conversionRate" DOUBLE PRECISION NOT NULL,
    "revenueGenerated" DOUBLE PRECISION NOT NULL,
    "tasksCompleted" INTEGER NOT NULL,
    "customerSatisfaction" DOUBLE PRECISION NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "followUpRate" DOUBLE PRECISION NOT NULL,
    "upsellSuccess" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metricsMetadata" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo" (
    "id" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "twitterCard" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "structuredData" JSONB,
    "customMeta" JSONB,
    "hreflang" JSONB,
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "changeFreq" TEXT NOT NULL DEFAULT 'weekly',
    "lastMod" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#10B981',
    "accentColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "siteTitle" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactAddress" TEXT,
    "workingHours" TEXT,
    "socialLinks" JSONB,
    "seoSettings" JSONB,
    "performanceSettings" JSONB,
    "headerSettings" JSONB,
    "footerSettings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_settings" (
    "id" TEXT NOT NULL,
    "showHeroSlider" BOOLEAN NOT NULL DEFAULT true,
    "autoPlaySlider" BOOLEAN NOT NULL DEFAULT true,
    "sliderInterval" INTEGER NOT NULL DEFAULT 5000,
    "showFeaturedVehicles" BOOLEAN NOT NULL DEFAULT true,
    "featuredVehiclesCount" INTEGER NOT NULL DEFAULT 6,
    "showServices" BOOLEAN NOT NULL DEFAULT true,
    "showCompanyInfo" BOOLEAN NOT NULL DEFAULT true,
    "servicesTitle" TEXT,
    "servicesSubtitle" TEXT,
    "servicesDescription" TEXT,
    "servicesCtaText" TEXT,
    "facebookPageUrl" TEXT,
    "facebookVideoUrl" TEXT,
    "theme" "HomepageTheme" NOT NULL DEFAULT 'LIGHT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_content" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoText" TEXT,
    "tagline" TEXT,
    "primaryPhone" TEXT,
    "secondaryPhone" TEXT,
    "primaryEmail" TEXT,
    "secondaryEmail" TEXT,
    "address" TEXT,
    "workingHours" TEXT,
    "copyrightText" TEXT,
    "newsletterText" TEXT,
    "backToTopText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_social" (
    "id" TEXT NOT NULL,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_columns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "type" "FooterColumnType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_content" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoText" TEXT,
    "tagline" TEXT,
    "primaryPhone" TEXT,
    "secondaryPhone" TEXT,
    "primaryEmail" TEXT,
    "secondaryEmail" TEXT,
    "address" TEXT,
    "workingHours" TEXT,
    "ctaButton" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_social" (
    "id" TEXT NOT NULL,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_navigation" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "children" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sliders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "badge" TEXT,
    "badgeColor" TEXT DEFAULT 'bg-blue-500',
    "contentPosition" TEXT DEFAULT 'top-right',
    "contentSize" TEXT DEFAULT 'lg',
    "contentColor" TEXT DEFAULT '#ffffff',
    "contentShadow" BOOLEAN DEFAULT true,
    "contentStrokeColor" TEXT DEFAULT '#000000',
    "contentStrokeWidth" INTEGER DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_info" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "features" JSONB,
    "ctaButtons" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_values" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_stats" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_features" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "features" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "primaryPhone" TEXT,
    "secondaryPhone" TEXT,
    "primaryEmail" TEXT,
    "secondaryEmail" TEXT,
    "address" TEXT,
    "mapLat" DOUBLE PRECISION,
    "mapLng" DOUBLE PRECISION,
    "workingHours" JSONB,
    "departments" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_interactions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "notes" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "maxStockLevel" INTEGER NOT NULL DEFAULT 100,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "supplier" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "warehouse" TEXT NOT NULL,
    "warehouseId" TEXT,
    "branchId" TEXT,
    "status" "InventoryStatus" NOT NULL DEFAULT 'IN_STOCK',
    "lastRestockDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextRestockDate" TIMESTAMP(3),
    "leadTime" INTEGER NOT NULL DEFAULT 7,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "manager" TEXT NOT NULL,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "leadTime" INTEGER NOT NULL DEFAULT 7,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "segment" "CustomerSegment" NOT NULL DEFAULT 'LEAD',
    "leadSource" "LeadSource",
    "leadValue" DOUBLE PRECISION DEFAULT 0,
    "lifetimeValue" DOUBLE PRECISION DEFAULT 0,
    "lastContactDate" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "preferences" JSONB,
    "tags" JSONB,
    "notes" TEXT,
    "riskScore" INTEGER DEFAULT 0,
    "satisfactionScore" DOUBLE PRECISION DEFAULT 0,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_interactions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "duration" INTEGER,
    "outcome" TEXT,
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "priority" TEXT DEFAULT 'MEDIUM',
    "tags" JSONB,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'LEAD',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "probability" INTEGER NOT NULL DEFAULT 0,
    "expectedCloseDate" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "lostReason" TEXT,
    "vehicleId" TEXT,
    "source" TEXT,
    "assignedTo" TEXT,
    "salesFunnelId" TEXT,
    "tags" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAudience" JSONB,
    "budget" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "convertedCount" INTEGER NOT NULL DEFAULT 0,
    "templateId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_members" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "metadata" JSONB,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optedOutAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),

    CONSTRAINT "campaign_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_journeys" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "exitDate" TIMESTAMP(3),
    "duration" INTEGER,
    "nextStage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branchId" TEXT,
    "vehicleId" TEXT,
    "type" "InvoiceType" NOT NULL DEFAULT 'SERVICE',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "InvoicePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "notes" TEXT,
    "terms" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdByEmployeeId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "lastPaymentAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "deletedReason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "convertedFromQuotationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "inventoryItemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transactionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_installments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "paymentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_taxes" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "taxRateId" TEXT,
    "taxType" "TaxType" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branchId" TEXT,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "notes" TEXT,
    "terms" TEXT,
    "createdById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "convertedToInvoiceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "actualDeliveryDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "notes" TEXT,
    "terms" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TaxRateType" NOT NULL DEFAULT 'STANDARD',
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "apiKey" TEXT,
    "secretKey" TEXT,
    "merchantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "testMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "FinancialReportType" NOT NULL,
    "description" TEXT,
    "parameters" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT NOT NULL,
    "data" JSONB,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'GENERATING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "branchId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INCOME',
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "grantedBy" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_transfers" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_budgets" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "month" INTEGER,
    "category" TEXT NOT NULL,
    "allocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tag_assignments" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tag" "CustomerTag" NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "customer_tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_automations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "campaignId" TEXT,
    "type" "CampaignType" NOT NULL,
    "status" "MarketingAutomationStatus" NOT NULL DEFAULT 'ACTIVE',
    "trigger" JSONB,
    "actions" JSONB,
    "targetAudience" JSONB,
    "schedule" JSONB,
    "metrics" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_feedback" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "rating" INTEGER,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "respondedBy" TEXT,
    "respondedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "tags" JSONB,
    "attachments" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_lifecycles" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'AWARENESS',
    "subStage" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "duration" INTEGER,
    "score" INTEGER DEFAULT 0,
    "nextStage" TEXT,
    "actions" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_lifecycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolutionBy" TEXT,
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,
    "tags" JSONB,
    "attachments" JSONB,
    "source" "TicketSource" NOT NULL DEFAULT 'WEB',
    "satisfaction" INTEGER,
    "feedback" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_timeline" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "action" "TicketAction" NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_evaluations" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceId" TEXT,
    "overallRating" INTEGER NOT NULL DEFAULT 0,
    "qualityRating" INTEGER,
    "speedRating" INTEGER,
    "staffRating" INTEGER,
    "valueRating" INTEGER,
    "recommendations" TEXT,
    "wouldRecommend" BOOLEAN,
    "feedback" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "response" TEXT,
    "tags" JSONB,
    "attachments" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL DEFAULT 'SERVICE',
    "severity" "ComplaintSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'RECEIVED',
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolutionBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "estimatedResolutionDate" TIMESTAMP(3),
    "actualResolutionDate" TIMESTAMP(3),
    "tags" JSONB,
    "attachments" JSONB,
    "source" "ComplaintSource" NOT NULL DEFAULT 'WEB',
    "branchId" TEXT,
    "satisfaction" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_follow_ups" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "action" "FollowUpAction" NOT NULL,
    "nextFollowUp" TIMESTAMP(3),
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaint_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "totalRating" INTEGER NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB,
    "attachments" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_ratings" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_service_metrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "period" "MetricPeriod" NOT NULL DEFAULT 'DAILY',
    "ticketsReceived" INTEGER NOT NULL DEFAULT 0,
    "ticketsResolved" INTEGER NOT NULL DEFAULT 0,
    "ticketsOpen" INTEGER NOT NULL DEFAULT 0,
    "avgResolutionTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "escalations" INTEGER NOT NULL DEFAULT 0,
    "complaints" INTEGER NOT NULL DEFAULT 0,
    "complaintsResolved" INTEGER NOT NULL DEFAULT 0,
    "evaluations" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "knowledgeBaseViews" INTEGER NOT NULL DEFAULT 0,
    "knowledgeBaseSearches" INTEGER NOT NULL DEFAULT 0,
    "selfServiceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_service_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "category" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "targetAudience" JSONB,
    "content" JSONB,
    "channels" JSONB,
    "goals" JSONB,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "branchId" TEXT,
    "tags" JSONB,
    "attachments" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "leadNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "position" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "campaignId" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedValue" DOUBLE PRECISION,
    "assignedTo" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3),
    "tags" JSONB,
    "notes" TEXT,
    "customFields" JSONB,
    "convertedAt" TIMESTAMP(3),
    "convertedTo" TEXT,
    "convertedId" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_communications" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "direction" "Direction" NOT NULL DEFAULT 'OUTBOUND',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_funnels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stages" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_funnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_targets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "TargetType" NOT NULL DEFAULT 'REVENUE',
    "targetValue" DOUBLE PRECISION NOT NULL,
    "period" "TargetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedType" "AssignedType" NOT NULL DEFAULT 'USER',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TargetStatus" NOT NULL DEFAULT 'ACTIVE',
    "branchId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_metrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "period" "MetricPeriod" NOT NULL DEFAULT 'DAILY',
    "campaignsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "smsSent" INTEGER NOT NULL DEFAULT 0,
    "smsDelivered" INTEGER NOT NULL DEFAULT 0,
    "leadsGenerated" INTEGER NOT NULL DEFAULT 0,
    "leadsConverted" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerLead" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerAcquisition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenueGenerated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topCampaigns" JSONB,
    "branchId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "normalBalance" "BalanceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "totalDebit" DOUBLE PRECISION NOT NULL,
    "totalCredit" DOUBLE PRECISION NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entry_items" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "description" TEXT,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entry_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'JUNIOR',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT,
    "positionId" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "bankAccount" TEXT,
    "taxNumber" TEXT,
    "insuranceNumber" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "managerId" TEXT,
    "branchId" TEXT,
    "emergencyContact" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payrollExpenseAccountId" TEXT,
    "payrollLiabilityAccountId" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "payDate" TIMESTAMP(3),
    "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_advances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SalaryAdvanceStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),
    "repaymentStart" TIMESTAMP(3),
    "repaymentMonths" INTEGER,
    "repaymentSchedule" JSONB,
    "repaidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "rating" "PerformanceRating" NOT NULL,
    "goals" JSONB,
    "achievements" JSONB,
    "areasForImprovement" JSONB,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingName" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION,
    "provider" TEXT,
    "certificate" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'PLANNED',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "value" DOUBLE PRECISION NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "terms" JSONB,
    "attachments" JSONB,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranties" (
    "id" TEXT NOT NULL,
    "warrantyNumber" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "WarrantyType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "coverage" JSONB,
    "terms" TEXT,
    "status" "WarrantyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty_claims" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "warrantyId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "claimDate" TIMESTAMP(3) NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "attachments" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "interval" INTEGER NOT NULL,
    "intervalKm" INTEGER,
    "lastService" TIMESTAMP(3),
    "nextService" TIMESTAMP(3) NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "priority" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "type" "MaintenanceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "technician" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "parts" JSONB,
    "laborHours" DOUBLE PRECISION,
    "odometer" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_reminders" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "sentDate" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'EMAIL',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_parts" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "location" TEXT,
    "supplier" TEXT,
    "status" "PartStatus" NOT NULL DEFAULT 'AVAILABLE',
    "barcode" TEXT,
    "imageUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "coverage" JSONB,
    "deductible" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'PENDING',
    "documents" JSONB,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentLocation" TEXT,
    "estimatedAmount" DOUBLE PRECISION,
    "approvedAmount" DOUBLE PRECISION,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "documents" JSONB,
    "notes" TEXT,
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_payments" (
    "id" TEXT NOT NULL,
    "policyId" TEXT,
    "claimId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "paymentMethod" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_records" (
    "id" TEXT NOT NULL,
    "type" "TaxType" NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "TaxStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "documents" JSONB,
    "notes" TEXT,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_settings" (
    "id" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB,
    "paymentMethod" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_usages" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "review" TEXT NOT NULL,
    "images" JSONB,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "entityId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popup_configs" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "buttonText" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "backgroundColor" TEXT NOT NULL DEFAULT '#1f2937',
    "position" "PopupPosition" NOT NULL DEFAULT 'BOTTOM_RIGHT',
    "showDelay" INTEGER NOT NULL DEFAULT 3000,
    "autoHide" BOOLEAN NOT NULL DEFAULT true,
    "hideDelay" INTEGER NOT NULL DEFAULT 10000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnPages" TEXT NOT NULL DEFAULT 'homepage',
    "targetAudience" TEXT NOT NULL DEFAULT 'all',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "popup_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_booking_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_booking_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_drive_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_drive_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "consultationType" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenancePartToMaintenanceRecord" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "MaintenancePartToMaintenanceRecord_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "TicketArticles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "TicketArticles_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_branchId_idx" ON "users"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "branches_managerId_key" ON "branches"("managerId");

-- CreateIndex
CREATE INDEX "branches_code_idx" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_isActive_idx" ON "branches"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_stockNumber_key" ON "vehicles"("stockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_make_model_idx" ON "vehicles"("make", "model");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_category_idx" ON "vehicles"("category");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_pricing_vehicleId_key" ON "vehicle_pricing"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_templates_name_key" ON "role_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_template_permissions_templateId_permissionId_key" ON "role_template_permissions"("templateId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_permissionId_key" ON "user_permissions"("userId", "permissionId");

-- CreateIndex
CREATE INDEX "payments_customerId_idx" ON "payments"("customerId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_bookingType_idx" ON "payments"("bookingType");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_name_key" ON "email_templates"("name");

-- CreateIndex
CREATE INDEX "bookings_date_status_idx" ON "bookings"("date", "status");

-- CreateIndex
CREATE INDEX "bookings_customerId_idx" ON "bookings"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "performance_metrics_employeeId_period_periodLabel_key" ON "performance_metrics"("employeeId", "period", "periodLabel");

-- CreateIndex
CREATE INDEX "attendance_records_date_idx" ON "attendance_records"("date");

-- CreateIndex
CREATE INDEX "attendance_records_status_idx" ON "attendance_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employeeId_date_key" ON "attendance_records"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_pagePath_key" ON "page_seo"("pagePath");

-- CreateIndex
CREATE INDEX "crm_interactions_customerId_type_idx" ON "crm_interactions"("customerId", "type");

-- CreateIndex
CREATE INDEX "crm_interactions_date_idx" ON "crm_interactions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_partNumber_key" ON "inventory_items"("partNumber");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_items_status_idx" ON "inventory_items"("status");

-- CreateIndex
CREATE INDEX "inventory_items_warehouseId_idx" ON "inventory_items"("warehouseId");

-- CreateIndex
CREATE INDEX "stock_alerts_itemId_type_idx" ON "stock_alerts"("itemId", "type");

-- CreateIndex
CREATE INDEX "stock_alerts_severity_idx" ON "stock_alerts"("severity");

-- CreateIndex
CREATE INDEX "stock_alerts_resolved_idx" ON "stock_alerts"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_userId_key" ON "customer_profiles"("userId");

-- CreateIndex
CREATE INDEX "campaign_members_customerId_idx" ON "campaign_members"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_members_campaignId_customerId_key" ON "campaign_members"("campaignId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_customerId_status_idx" ON "invoices"("customerId", "status");

-- CreateIndex
CREATE INDEX "invoices_issueDate_idx" ON "invoices"("issueDate");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_payments_invoiceId_paymentId_key" ON "invoice_payments"("invoiceId", "paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_installments_invoiceId_sequence_key" ON "invoice_installments"("invoiceId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotationNumber_key" ON "quotations"("quotationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_convertedToInvoiceId_key" ON "quotations"("convertedToInvoiceId");

-- CreateIndex
CREATE INDEX "quotations_customerId_status_idx" ON "quotations"("customerId", "status");

-- CreateIndex
CREATE INDEX "quotations_issueDate_idx" ON "quotations"("issueDate");

-- CreateIndex
CREATE INDEX "quotations_validUntil_idx" ON "quotations"("validUntil");

-- CreateIndex
CREATE INDEX "activity_logs_userId_action_idx" ON "activity_logs"("userId", "action");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_supplierId_status_idx" ON "purchase_orders"("supplierId", "status");

-- CreateIndex
CREATE INDEX "purchase_orders_warehouseId_status_idx" ON "purchase_orders"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "purchase_orders_orderDate_idx" ON "purchase_orders"("orderDate");

-- CreateIndex
CREATE INDEX "purchase_orders_expectedDeliveryDate_idx" ON "purchase_orders"("expectedDeliveryDate");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_referenceId_key" ON "transactions"("referenceId");

-- CreateIndex
CREATE INDEX "transactions_type_date_idx" ON "transactions"("type", "date");

-- CreateIndex
CREATE INDEX "transactions_category_idx" ON "transactions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "branch_permissions_userId_branchId_key" ON "branch_permissions"("userId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_transfers_referenceId_key" ON "branch_transfers"("referenceId");

-- CreateIndex
CREATE INDEX "branch_transfers_status_idx" ON "branch_transfers"("status");

-- CreateIndex
CREATE INDEX "branch_transfers_fromBranchId_idx" ON "branch_transfers"("fromBranchId");

-- CreateIndex
CREATE INDEX "branch_transfers_toBranchId_idx" ON "branch_transfers"("toBranchId");

-- CreateIndex
CREATE INDEX "branch_budgets_branchId_year_idx" ON "branch_budgets"("branchId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "branch_budgets_branchId_year_quarter_month_category_key" ON "branch_budgets"("branchId", "year", "quarter", "month", "category");

-- CreateIndex
CREATE UNIQUE INDEX "customer_tag_assignments_customerId_tag_key" ON "customer_tag_assignments"("customerId", "tag");

-- CreateIndex
CREATE INDEX "customer_feedback_customerId_type_idx" ON "customer_feedback"("customerId", "type");

-- CreateIndex
CREATE INDEX "customer_feedback_status_idx" ON "customer_feedback"("status");

-- CreateIndex
CREATE INDEX "customer_feedback_rating_idx" ON "customer_feedback"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "customer_lifecycles_customerId_stage_key" ON "customer_lifecycles"("customerId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_customerId_status_idx" ON "support_tickets"("customerId", "status");

-- CreateIndex
CREATE INDEX "support_tickets_assignedTo_status_idx" ON "support_tickets"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "support_tickets_category_status_idx" ON "support_tickets"("category", "status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_status_idx" ON "support_tickets"("priority", "status");

-- CreateIndex
CREATE INDEX "support_tickets_createdAt_idx" ON "support_tickets"("createdAt");

-- CreateIndex
CREATE INDEX "ticket_comments_ticketId_createdAt_idx" ON "ticket_comments"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "ticket_timeline_ticketId_createdAt_idx" ON "ticket_timeline"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "service_evaluations_customerId_idx" ON "service_evaluations"("customerId");

-- CreateIndex
CREATE INDEX "service_evaluations_overallRating_idx" ON "service_evaluations"("overallRating");

-- CreateIndex
CREATE INDEX "service_evaluations_status_idx" ON "service_evaluations"("status");

-- CreateIndex
CREATE INDEX "service_evaluations_createdAt_idx" ON "service_evaluations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaintNumber_key" ON "complaints"("complaintNumber");

-- CreateIndex
CREATE INDEX "complaints_customerId_status_idx" ON "complaints"("customerId", "status");

-- CreateIndex
CREATE INDEX "complaints_assignedTo_status_idx" ON "complaints"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "complaints_category_status_idx" ON "complaints"("category", "status");

-- CreateIndex
CREATE INDEX "complaints_severity_status_idx" ON "complaints"("severity", "status");

-- CreateIndex
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");

-- CreateIndex
CREATE INDEX "complaint_follow_ups_complaintId_createdAt_idx" ON "complaint_follow_ups"("complaintId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_categories_name_key" ON "knowledge_base_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_categories_slug_key" ON "knowledge_base_categories"("slug");

-- CreateIndex
CREATE INDEX "knowledge_base_categories_isActive_idx" ON "knowledge_base_categories"("isActive");

-- CreateIndex
CREATE INDEX "knowledge_base_categories_sortOrder_idx" ON "knowledge_base_categories"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_articles_slug_key" ON "knowledge_base_articles"("slug");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_categoryId_status_idx" ON "knowledge_base_articles"("categoryId", "status");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_authorId_status_idx" ON "knowledge_base_articles"("authorId", "status");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_isPublic_status_idx" ON "knowledge_base_articles"("isPublic", "status");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_publishedAt_idx" ON "knowledge_base_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "knowledge_base_articles_viewCount_idx" ON "knowledge_base_articles"("viewCount");

-- CreateIndex
CREATE INDEX "knowledge_base_ratings_articleId_idx" ON "knowledge_base_ratings"("articleId");

-- CreateIndex
CREATE INDEX "knowledge_base_ratings_rating_idx" ON "knowledge_base_ratings"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_ratings_articleId_userId_key" ON "knowledge_base_ratings"("articleId", "userId");

-- CreateIndex
CREATE INDEX "customer_service_metrics_date_period_idx" ON "customer_service_metrics"("date", "period");

-- CreateIndex
CREATE INDEX "customer_service_metrics_branchId_idx" ON "customer_service_metrics"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_service_metrics_date_period_branchId_key" ON "customer_service_metrics"("date", "period", "branchId");

-- CreateIndex
CREATE INDEX "marketing_campaigns_type_status_idx" ON "marketing_campaigns"("type", "status");

-- CreateIndex
CREATE INDEX "marketing_campaigns_startDate_endDate_idx" ON "marketing_campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "marketing_campaigns_createdBy_idx" ON "marketing_campaigns"("createdBy");

-- CreateIndex
CREATE INDEX "marketing_campaigns_branchId_idx" ON "marketing_campaigns"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_leadNumber_key" ON "leads"("leadNumber");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_assignedTo_idx" ON "leads"("assignedTo");

-- CreateIndex
CREATE INDEX "leads_customerId_idx" ON "leads"("customerId");

-- CreateIndex
CREATE INDEX "leads_campaignId_idx" ON "leads"("campaignId");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "lead_activities_leadId_createdAt_idx" ON "lead_activities"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "lead_communications_leadId_idx" ON "lead_communications"("leadId");

-- CreateIndex
CREATE INDEX "lead_communications_scheduledAt_idx" ON "lead_communications"("scheduledAt");

-- CreateIndex
CREATE INDEX "lead_communications_status_idx" ON "lead_communications"("status");

-- CreateIndex
CREATE INDEX "sales_funnels_isActive_idx" ON "sales_funnels"("isActive");

-- CreateIndex
CREATE INDEX "sales_funnels_branchId_idx" ON "sales_funnels"("branchId");

-- CreateIndex
CREATE INDEX "sales_targets_assignedTo_idx" ON "sales_targets"("assignedTo");

-- CreateIndex
CREATE INDEX "sales_targets_startDate_idx" ON "sales_targets"("startDate");

-- CreateIndex
CREATE INDEX "sales_targets_endDate_idx" ON "sales_targets"("endDate");

-- CreateIndex
CREATE INDEX "sales_targets_branchId_idx" ON "sales_targets"("branchId");

-- CreateIndex
CREATE INDEX "marketing_metrics_date_period_idx" ON "marketing_metrics"("date", "period");

-- CreateIndex
CREATE INDEX "marketing_metrics_branchId_idx" ON "marketing_metrics"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_metrics_date_period_branchId_key" ON "marketing_metrics"("date", "period", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_code_key" ON "chart_of_accounts"("code");

-- CreateIndex
CREATE INDEX "chart_of_accounts_code_idx" ON "chart_of_accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_entryNumber_key" ON "journal_entries"("entryNumber");

-- CreateIndex
CREATE INDEX "journal_entries_date_idx" ON "journal_entries"("date");

-- CreateIndex
CREATE INDEX "journal_entry_items_entryId_idx" ON "journal_entry_items"("entryId");

-- CreateIndex
CREATE INDEX "journal_entry_items_accountId_idx" ON "journal_entry_items"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "positions_title_departmentId_key" ON "positions"("title", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_employeeNumber_idx" ON "employees"("employeeNumber");

-- CreateIndex
CREATE INDEX "employees_departmentId_idx" ON "employees"("departmentId");

-- CreateIndex
CREATE INDEX "employees_positionId_idx" ON "employees"("positionId");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "payroll_records_employeeId_period_idx" ON "payroll_records"("employeeId", "period");

-- CreateIndex
CREATE INDEX "salary_advances_employeeId_status_idx" ON "salary_advances"("employeeId", "status");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_idx" ON "leave_requests"("employeeId");

-- CreateIndex
CREATE INDEX "leave_requests_startDate_idx" ON "leave_requests"("startDate");

-- CreateIndex
CREATE INDEX "performance_reviews_employeeId_period_idx" ON "performance_reviews"("employeeId", "period");

-- CreateIndex
CREATE INDEX "training_records_employeeId_idx" ON "training_records"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contractNumber_key" ON "contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "contracts_contractNumber_idx" ON "contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "contracts_type_status_idx" ON "contracts"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "warranties_warrantyNumber_key" ON "warranties"("warrantyNumber");

-- CreateIndex
CREATE INDEX "warranties_warrantyNumber_idx" ON "warranties"("warrantyNumber");

-- CreateIndex
CREATE INDEX "warranties_vehicleId_idx" ON "warranties"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_claims_claimNumber_key" ON "warranty_claims"("claimNumber");

-- CreateIndex
CREATE INDEX "warranty_claims_claimNumber_idx" ON "warranty_claims"("claimNumber");

-- CreateIndex
CREATE INDEX "warranty_claims_warrantyId_idx" ON "warranty_claims"("warrantyId");

-- CreateIndex
CREATE INDEX "warranty_claims_status_idx" ON "warranty_claims"("status");

-- CreateIndex
CREATE INDEX "maintenance_schedules_vehicleId_idx" ON "maintenance_schedules"("vehicleId");

-- CreateIndex
CREATE INDEX "maintenance_schedules_nextService_idx" ON "maintenance_schedules"("nextService");

-- CreateIndex
CREATE INDEX "maintenance_schedules_priority_idx" ON "maintenance_schedules"("priority");

-- CreateIndex
CREATE INDEX "maintenance_records_vehicleId_idx" ON "maintenance_records"("vehicleId");

-- CreateIndex
CREATE INDEX "maintenance_records_startDate_idx" ON "maintenance_records"("startDate");

-- CreateIndex
CREATE INDEX "maintenance_records_status_idx" ON "maintenance_records"("status");

-- CreateIndex
CREATE INDEX "maintenance_reminders_scheduleId_idx" ON "maintenance_reminders"("scheduleId");

-- CreateIndex
CREATE INDEX "maintenance_reminders_vehicleId_idx" ON "maintenance_reminders"("vehicleId");

-- CreateIndex
CREATE INDEX "maintenance_reminders_reminderDate_idx" ON "maintenance_reminders"("reminderDate");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_parts_partNumber_key" ON "maintenance_parts"("partNumber");

-- CreateIndex
CREATE INDEX "maintenance_parts_partNumber_idx" ON "maintenance_parts"("partNumber");

-- CreateIndex
CREATE INDEX "maintenance_parts_category_idx" ON "maintenance_parts"("category");

-- CreateIndex
CREATE INDEX "maintenance_parts_status_idx" ON "maintenance_parts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_companies_name_key" ON "insurance_companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_companies_code_key" ON "insurance_companies"("code");

-- CreateIndex
CREATE INDEX "insurance_companies_name_idx" ON "insurance_companies"("name");

-- CreateIndex
CREATE INDEX "insurance_companies_isActive_idx" ON "insurance_companies"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_policies_policyNumber_key" ON "insurance_policies"("policyNumber");

-- CreateIndex
CREATE INDEX "insurance_policies_policyNumber_idx" ON "insurance_policies"("policyNumber");

-- CreateIndex
CREATE INDEX "insurance_policies_vehicleId_idx" ON "insurance_policies"("vehicleId");

-- CreateIndex
CREATE INDEX "insurance_policies_customerId_idx" ON "insurance_policies"("customerId");

-- CreateIndex
CREATE INDEX "insurance_policies_companyId_idx" ON "insurance_policies"("companyId");

-- CreateIndex
CREATE INDEX "insurance_policies_status_idx" ON "insurance_policies"("status");

-- CreateIndex
CREATE INDEX "insurance_policies_startDate_idx" ON "insurance_policies"("startDate");

-- CreateIndex
CREATE INDEX "insurance_policies_endDate_idx" ON "insurance_policies"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_claims_claimNumber_key" ON "insurance_claims"("claimNumber");

-- CreateIndex
CREATE INDEX "insurance_claims_claimNumber_idx" ON "insurance_claims"("claimNumber");

-- CreateIndex
CREATE INDEX "insurance_claims_policyId_idx" ON "insurance_claims"("policyId");

-- CreateIndex
CREATE INDEX "insurance_claims_vehicleId_idx" ON "insurance_claims"("vehicleId");

-- CreateIndex
CREATE INDEX "insurance_claims_customerId_idx" ON "insurance_claims"("customerId");

-- CreateIndex
CREATE INDEX "insurance_claims_status_idx" ON "insurance_claims"("status");

-- CreateIndex
CREATE INDEX "insurance_claims_incidentDate_idx" ON "insurance_claims"("incidentDate");

-- CreateIndex
CREATE INDEX "insurance_payments_policyId_idx" ON "insurance_payments"("policyId");

-- CreateIndex
CREATE INDEX "insurance_payments_claimId_idx" ON "insurance_payments"("claimId");

-- CreateIndex
CREATE INDEX "insurance_payments_type_idx" ON "insurance_payments"("type");

-- CreateIndex
CREATE INDEX "insurance_payments_status_idx" ON "insurance_payments"("status");

-- CreateIndex
CREATE INDEX "insurance_payments_paymentDate_idx" ON "insurance_payments"("paymentDate");

-- CreateIndex
CREATE INDEX "tax_records_type_period_idx" ON "tax_records"("type", "period");

-- CreateIndex
CREATE INDEX "tax_records_dueDate_idx" ON "tax_records"("dueDate");

-- CreateIndex
CREATE INDEX "tax_records_status_idx" ON "tax_records"("status");

-- CreateIndex
CREATE INDEX "tax_records_branchId_idx" ON "tax_records"("branchId");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_featured_idx" ON "products"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "order_payments_orderId_idx" ON "order_payments"("orderId");

-- CreateIndex
CREATE INDEX "order_payments_status_idx" ON "order_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_code_idx" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_active_idx" ON "promotions"("active");

-- CreateIndex
CREATE INDEX "promotions_startDate_idx" ON "promotions"("startDate");

-- CreateIndex
CREATE INDEX "promotions_endDate_idx" ON "promotions"("endDate");

-- CreateIndex
CREATE INDEX "promotion_usages_promotionId_idx" ON "promotion_usages"("promotionId");

-- CreateIndex
CREATE INDEX "promotion_usages_orderId_idx" ON "promotion_usages"("orderId");

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "product_reviews_customerId_idx" ON "product_reviews"("customerId");

-- CreateIndex
CREATE INDEX "product_reviews_rating_idx" ON "product_reviews"("rating");

-- CreateIndex
CREATE INDEX "product_reviews_status_idx" ON "product_reviews"("status");

-- CreateIndex
CREATE INDEX "MaintenancePartToMaintenanceRecord_B_idx" ON "MaintenancePartToMaintenanceRecord"("B");

-- CreateIndex
CREATE INDEX "TicketArticles_B_idx" ON "TicketArticles"("B");

-- AddForeignKey
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleTemplateId_fkey" FOREIGN KEY ("roleTemplateId") REFERENCES "role_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_specifications" ADD CONSTRAINT "vehicle_specifications_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_pricing" ADD CONSTRAINT "vehicle_pricing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_drive_bookings" ADD CONSTRAINT "test_drive_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_drive_bookings" ADD CONSTRAINT "test_drive_bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_template_permissions" ADD CONSTRAINT "role_template_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_template_permissions" ADD CONSTRAINT "role_template_permissions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "role_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_serviceBookingId_fkey" FOREIGN KEY ("serviceBookingId") REFERENCES "service_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_testDriveBookingId_fkey" FOREIGN KEY ("testDriveBookingId") REFERENCES "test_drive_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_interactions" ADD CONSTRAINT "crm_interactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_salesFunnelId_fkey" FOREIGN KEY ("salesFunnelId") REFERENCES "sales_funnels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_journeys" ADD CONSTRAINT "customer_journeys_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_installments" ADD CONSTRAINT "invoice_installments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_installments" ADD CONSTRAINT "invoice_installments_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_taxes" ADD CONSTRAINT "invoice_taxes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_taxes" ADD CONSTRAINT "invoice_taxes_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "tax_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_convertedToInvoiceId_fkey" FOREIGN KEY ("convertedToInvoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_permissions" ADD CONSTRAINT "branch_permissions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_permissions" ADD CONSTRAINT "branch_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_budgets" ADD CONSTRAINT "branch_budgets_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_budgets" ADD CONSTRAINT "branch_budgets_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_budgets" ADD CONSTRAINT "branch_budgets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_automations" ADD CONSTRAINT "marketing_automations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_lifecycles" ADD CONSTRAINT "customer_lifecycles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_resolutionBy_fkey" FOREIGN KEY ("resolutionBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_timeline" ADD CONSTRAINT "ticket_timeline_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_timeline" ADD CONSTRAINT "ticket_timeline_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evaluations" ADD CONSTRAINT "service_evaluations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evaluations" ADD CONSTRAINT "service_evaluations_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resolutionBy_fkey" FOREIGN KEY ("resolutionBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_follow_ups" ADD CONSTRAINT "complaint_follow_ups_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_follow_ups" ADD CONSTRAINT "complaint_follow_ups_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_categories" ADD CONSTRAINT "knowledge_base_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledge_base_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "knowledge_base_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_articles" ADD CONSTRAINT "knowledge_base_articles_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_ratings" ADD CONSTRAINT "knowledge_base_ratings_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "knowledge_base_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_ratings" ADD CONSTRAINT "knowledge_base_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_service_metrics" ADD CONSTRAINT "customer_service_metrics_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_items" ADD CONSTRAINT "journal_entry_items_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_items" ADD CONSTRAINT "journal_entry_items_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_payrollExpenseAccountId_fkey" FOREIGN KEY ("payrollExpenseAccountId") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_payrollLiabilityAccountId_fkey" FOREIGN KEY ("payrollLiabilityAccountId") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advances" ADD CONSTRAINT "salary_advances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advances" ADD CONSTRAINT "salary_advances_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advances" ADD CONSTRAINT "salary_advances_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

