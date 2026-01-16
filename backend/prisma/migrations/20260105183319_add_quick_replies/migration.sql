-- CreateEnum
CREATE TYPE "ProductCategoryType" AS ENUM ('neurotoxin', 'filler', 'skincare', 'device', 'consumable', 'supplement', 'other');

-- CreateEnum
CREATE TYPE "ProductStatusType" AS ENUM ('active', 'discontinued', 'out_of_stock', 'pending_approval');

-- CreateEnum
CREATE TYPE "ProductUnitType" AS ENUM ('units', 'syringe', 'vial', 'ml', 'cc', 'gram', 'piece', 'box', 'kit');

-- CreateEnum
CREATE TYPE "LotStatusType" AS ENUM ('available', 'quarantine', 'expired', 'recalled', 'depleted', 'damaged');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'WASTE', 'TREATMENT_USE', 'COUNT_ADJUSTMENT', 'RETURN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CountStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WasteReason" AS ENUM ('EXPIRED', 'CONTAMINATION', 'DAMAGED', 'PATIENT_NO_SHOW', 'SPILL', 'RECALLED', 'OTHER');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryAlertType" AS ENUM ('LOW_STOCK', 'EXPIRING_SOON', 'EXPIRED', 'RECALL', 'REORDER_POINT');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InventoryAlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "VialStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED', 'WASTED');

-- CreateEnum
CREATE TYPE "PushPlatform" AS ENUM ('ios', 'android', 'web', 'expo');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('appointment_reminder', 'appointment_confirmation', 'appointment_cancelled', 'appointment_rescheduled', 'message_received', 'treatment_followup', 'billing_reminder', 'payment_received', 'membership_renewal', 'marketing_promotion', 'system_alert', 'waitlist_offer', 'form_required');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('push', 'email', 'sms', 'in_app');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateTable
CREATE TABLE "QuickReply" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickReplyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickReplyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "website" TEXT,
    "address" JSONB,
    "accountNumber" TEXT,
    "paymentTerms" TEXT,
    "taxId" TEXT,
    "averageLeadDays" INTEGER NOT NULL DEFAULT 7,
    "onTimeDeliveryRate" DOUBLE PRECISION,
    "qualityRating" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "category" "ProductCategoryType",
    "brand" TEXT,
    "vendorId" TEXT,
    "sku" TEXT NOT NULL,
    "ndc" TEXT,
    "upc" TEXT,
    "gtin" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "markupPercent" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "unitType" "ProductUnitType",
    "unitsPerPackage" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "injectableDetails" JSONB,
    "storageRequirements" JSONB,
    "reorderPoint" INTEGER NOT NULL DEFAULT 5,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 10,
    "minStockLevel" INTEGER NOT NULL DEFAULT 1,
    "maxStockLevel" INTEGER,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "trackByLot" BOOLEAN NOT NULL DEFAULT true,
    "trackBySerial" BOOLEAN NOT NULL DEFAULT false,
    "requireExpirationDate" BOOLEAN NOT NULL DEFAULT true,
    "commissionable" BOOLEAN NOT NULL DEFAULT false,
    "commissionRate" DOUBLE PRECISION,
    "tags" TEXT[],
    "treatmentTypes" TEXT[],
    "requiredCertifications" TEXT[],
    "status" "ProductStatusType" NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableForSale" BOOLEAN NOT NULL DEFAULT false,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
    "controlledSubstance" BOOLEAN NOT NULL DEFAULT false,
    "hsaFsaEligible" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "batchNumber" TEXT,
    "serialNumber" TEXT,
    "manufacturingDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedDate" TIMESTAMP(3),
    "initialQuantity" DOUBLE PRECISION NOT NULL,
    "currentQuantity" DOUBLE PRECISION NOT NULL,
    "reservedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitType" "ProductUnitType",
    "reconstitutionDetails" JSONB,
    "storageLocation" TEXT,
    "purchaseOrderId" TEXT,
    "vendorId" TEXT,
    "invoiceNumber" TEXT,
    "purchaseCost" DOUBLE PRECISION,
    "status" "LotStatusType" NOT NULL DEFAULT 'available',
    "qualityNotes" TEXT,
    "recallStatus" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "productId" TEXT NOT NULL,
    "lotId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "previousQuantity" DOUBLE PRECISION,
    "newQuantity" DOUBLE PRECISION,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "locationId" TEXT,
    "patientId" TEXT,
    "appointmentId" TEXT,
    "practitionerId" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransfer" (
    "id" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "sourceLocationId" TEXT NOT NULL,
    "destinationLocationId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "receivedBy" TEXT,

    CONSTRAINT "InventoryTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCount" (
    "id" TEXT NOT NULL,
    "countNumber" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "status" "CountStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "countType" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "varianceTotal" DOUBLE PRECISION,

    CONSTRAINT "InventoryCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteRecord" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lotId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reason" "WasteReason" NOT NULL,
    "notes" TEXT,
    "locationId" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,

    CONSTRAINT "WasteRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "vendorId" TEXT,
    "vendorName" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION,
    "shipping" DOUBLE PRECISION,
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "expectedDate" TIMESTAMP(3),
    "orderedAt" TIMESTAMP(3),
    "orderedBy" TEXT,
    "receivedAt" TIMESTAMP(3),
    "receivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAlert" (
    "id" TEXT NOT NULL,
    "type" "InventoryAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "productId" TEXT,
    "lotId" TEXT,
    "locationId" TEXT,
    "message" TEXT NOT NULL,
    "status" "InventoryAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenVialSession" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "initialQuantity" DOUBLE PRECISION NOT NULL,
    "remainingQuantity" DOUBLE PRECISION NOT NULL,
    "status" "VialStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedBy" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "closeReason" TEXT,
    "usageRecords" JSONB,

    CONSTRAINT "OpenVialSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productType" "ProductType" NOT NULL,
    "defaultZones" JSONB NOT NULL DEFAULT '[]',
    "defaultProducts" JSONB NOT NULL DEFAULT '[]',
    "soapDefaults" JSONB,
    "estimatedDuration" INTEGER NOT NULL,
    "requiredConsents" TEXT[],
    "aftercareInstructions" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "TreatmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPlaybook" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "protocols" JSONB NOT NULL DEFAULT '[]',
    "dotPhrases" JSONB NOT NULL DEFAULT '[]',
    "defaultProductPreferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderPlaybook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "PushPlatform" NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "channel" "NotificationChannel" NOT NULL DEFAULT 'push',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'normal',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "appointmentChanges" BOOLEAN NOT NULL DEFAULT true,
    "messageNotifications" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "treatmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "billingAlerts" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushAppointments" BOOLEAN NOT NULL DEFAULT true,
    "pushMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushPromotions" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsAppointments" BOOLEAN NOT NULL DEFAULT true,
    "smsReminders" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuickReply_category_idx" ON "QuickReply"("category");

-- CreateIndex
CREATE INDEX "QuickReply_isSystem_idx" ON "QuickReply"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "QuickReplyCategory_name_key" ON "QuickReplyCategory"("name");

-- CreateIndex
CREATE INDEX "QuickReplyCategory_name_idx" ON "QuickReplyCategory"("name");

-- CreateIndex
CREATE INDEX "QuickReplyCategory_isSystem_idx" ON "QuickReplyCategory"("isSystem");

-- CreateIndex
CREATE INDEX "Vendor_isActive_idx" ON "Vendor"("isActive");

-- CreateIndex
CREATE INDEX "Vendor_isPreferred_idx" ON "Vendor"("isPreferred");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_vendorId_idx" ON "Product"("vendorId");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "InventoryLot_productId_idx" ON "InventoryLot"("productId");

-- CreateIndex
CREATE INDEX "InventoryLot_locationId_idx" ON "InventoryLot"("locationId");

-- CreateIndex
CREATE INDEX "InventoryLot_lotNumber_idx" ON "InventoryLot"("lotNumber");

-- CreateIndex
CREATE INDEX "InventoryLot_expirationDate_idx" ON "InventoryLot"("expirationDate");

-- CreateIndex
CREATE INDEX "InventoryLot_status_idx" ON "InventoryLot"("status");

-- CreateIndex
CREATE INDEX "InventoryTransaction_productId_idx" ON "InventoryTransaction"("productId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_lotId_idx" ON "InventoryTransaction"("lotId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_locationId_idx" ON "InventoryTransaction"("locationId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_createdAt_idx" ON "InventoryTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryTransaction_type_idx" ON "InventoryTransaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransfer_transferNumber_key" ON "InventoryTransfer"("transferNumber");

-- CreateIndex
CREATE INDEX "InventoryTransfer_status_idx" ON "InventoryTransfer"("status");

-- CreateIndex
CREATE INDEX "InventoryTransfer_sourceLocationId_idx" ON "InventoryTransfer"("sourceLocationId");

-- CreateIndex
CREATE INDEX "InventoryTransfer_destinationLocationId_idx" ON "InventoryTransfer"("destinationLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCount_countNumber_key" ON "InventoryCount"("countNumber");

-- CreateIndex
CREATE INDEX "InventoryCount_locationId_idx" ON "InventoryCount"("locationId");

-- CreateIndex
CREATE INDEX "InventoryCount_status_idx" ON "InventoryCount"("status");

-- CreateIndex
CREATE INDEX "WasteRecord_productId_idx" ON "WasteRecord"("productId");

-- CreateIndex
CREATE INDEX "WasteRecord_lotId_idx" ON "WasteRecord"("lotId");

-- CreateIndex
CREATE INDEX "WasteRecord_reason_idx" ON "WasteRecord"("reason");

-- CreateIndex
CREATE INDEX "WasteRecord_recordedAt_idx" ON "WasteRecord"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_orderNumber_key" ON "PurchaseOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_vendorId_idx" ON "PurchaseOrder"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderNumber_idx" ON "PurchaseOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "InventoryAlert_type_idx" ON "InventoryAlert"("type");

-- CreateIndex
CREATE INDEX "InventoryAlert_severity_idx" ON "InventoryAlert"("severity");

-- CreateIndex
CREATE INDEX "InventoryAlert_status_idx" ON "InventoryAlert"("status");

-- CreateIndex
CREATE INDEX "InventoryAlert_productId_idx" ON "InventoryAlert"("productId");

-- CreateIndex
CREATE INDEX "OpenVialSession_lotId_idx" ON "OpenVialSession"("lotId");

-- CreateIndex
CREATE INDEX "OpenVialSession_productId_idx" ON "OpenVialSession"("productId");

-- CreateIndex
CREATE INDEX "OpenVialSession_locationId_idx" ON "OpenVialSession"("locationId");

-- CreateIndex
CREATE INDEX "OpenVialSession_status_idx" ON "OpenVialSession"("status");

-- CreateIndex
CREATE INDEX "OpenVialSession_expiresAt_idx" ON "OpenVialSession"("expiresAt");

-- CreateIndex
CREATE INDEX "TreatmentTemplate_productType_idx" ON "TreatmentTemplate"("productType");

-- CreateIndex
CREATE INDEX "TreatmentTemplate_isGlobal_idx" ON "TreatmentTemplate"("isGlobal");

-- CreateIndex
CREATE INDEX "TreatmentTemplate_providerId_idx" ON "TreatmentTemplate"("providerId");

-- CreateIndex
CREATE INDEX "TreatmentTemplate_createdAt_idx" ON "TreatmentTemplate"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderPlaybook_providerId_key" ON "ProviderPlaybook"("providerId");

-- CreateIndex
CREATE INDEX "ProviderPlaybook_providerId_idx" ON "ProviderPlaybook"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

-- CreateIndex
CREATE INDEX "PushToken_token_idx" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_isActive_idx" ON "PushToken"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_userId_deviceId_key" ON "PushToken"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Conversation_patientId_channel_idx" ON "Conversation"("patientId", "channel");

-- CreateIndex
CREATE INDEX "Invoice_patientId_voidedAt_idx" ON "Invoice"("patientId", "voidedAt");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "MessagingMessage_conversationId_createdAt_idx" ON "MessagingMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Patient_firstName_lastName_idx" ON "Patient"("firstName", "lastName");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePractitioner" ADD CONSTRAINT "ServicePractitioner_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
