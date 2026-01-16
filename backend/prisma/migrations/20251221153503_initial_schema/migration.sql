-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DECEASED');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('ACTIVE', 'OFFERED', 'BOOKED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WaitlistPriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "VIPTier" AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'NONE');

-- CreateEnum
CREATE TYPE "GroupBookingType" AS ENUM ('COUPLES', 'PARTY', 'CORPORATE', 'FAMILY', 'FRIENDS', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupBookingStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GroupPaymentType" AS ENUM ('ORGANIZER_PAYS', 'SPLIT_EQUAL', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('SKIP', 'RESCHEDULE', 'MODIFY');

-- CreateEnum
CREATE TYPE "ExpressBookingStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('neurotoxin', 'filler', 'laser', 'skin', 'body', 'other');

-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('in_progress', 'completed', 'pending_review', 'cancelled');

-- CreateEnum
CREATE TYPE "InjectionDepth" AS ENUM ('superficial', 'mid_dermal', 'deep_dermal', 'subcutaneous', 'supraperiosteal');

-- CreateEnum
CREATE TYPE "InjectionTechnique" AS ENUM ('serial', 'linear', 'fanning', 'cross_hatching', 'bolus', 'depot');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('neurotoxin', 'filler', 'skincare', 'anesthetic', 'other');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('before', 'after', 'during', 'progress', 'profile', 'other');

-- CreateEnum
CREATE TYPE "PhotoAngle" AS ENUM ('front', 'left', 'right', 'angle_45_left', 'angle_45_right', 'top', 'custom');

-- CreateEnum
CREATE TYPE "AnnotationType" AS ENUM ('marker', 'circle', 'arrow', 'text', 'measurement', 'area');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('intake', 'consent', 'hipaa', 'photo_release', 'treatment_specific', 'medical_history', 'custom');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'in_progress', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'in_progress', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LineItemType" AS ENUM ('SERVICE', 'PRODUCT', 'PACKAGE', 'INJECTABLE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('UNIT', 'SYRINGE', 'VIAL', 'ML');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'GIFT_CARD', 'PACKAGE_CREDIT', 'FINANCING', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PackagePurchaseStatus" AS ENUM ('ACTIVE', 'PARTIALLY_USED', 'FULLY_USED', 'EXPIRED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MembershipLevel" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'VIP');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'PAST_DUE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING', 'ACTIVE', 'PARTIALLY_USED', 'DEPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GiftCardTransactionType" AS ENUM ('PURCHASE', 'REDEMPTION', 'REFUND', 'ADJUSTMENT', 'EXPIRATION');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "patientNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "preferredName" TEXT,
    "pronouns" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender",
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "workPhone" TEXT,
    "timezone" TEXT,
    "addressStreet" TEXT,
    "addressStreet2" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressZipCode" TEXT,
    "addressCountry" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactRelationship" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactAltPhone" TEXT,
    "bloodType" TEXT,
    "primaryProviderId" TEXT,
    "commPrefMethod" TEXT,
    "commPrefAppointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "commPrefMarketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "commPrefSmsNotifications" BOOLEAN NOT NULL DEFAULT true,
    "commPrefEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "commPrefLanguage" TEXT NOT NULL DEFAULT 'en',
    "privacyShareWithFamily" BOOLEAN NOT NULL DEFAULT false,
    "privacyAllowPhotos" BOOLEAN NOT NULL DEFAULT true,
    "privacyAllowResearch" BOOLEAN NOT NULL DEFAULT false,
    "privacyMode" BOOLEAN NOT NULL DEFAULT false,
    "photoConsent" BOOLEAN,
    "marketingConsent" BOOLEAN,
    "generalNotes" TEXT,
    "importantNotes" TEXT,
    "tags" TEXT[],
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstVisit" TIMESTAMP(3),
    "lastVisit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "lastModifiedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "severity" "AllergySeverity" NOT NULL,
    "onsetDate" TEXT,
    "notes" TEXT,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "appointmentId" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceCategory" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "practitionerName" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "patientEmail" TEXT,
    "serviceIds" TEXT[],
    "serviceNames" TEXT[],
    "providerIds" TEXT[],
    "providerNames" TEXT[],
    "preferredDays" TEXT[],
    "preferredTimeRanges" JSONB NOT NULL,
    "flexibleDates" BOOLEAN NOT NULL DEFAULT false,
    "flexibleProviders" BOOLEAN NOT NULL DEFAULT true,
    "flexibleTimes" BOOLEAN NOT NULL DEFAULT false,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" "WaitlistPriority" NOT NULL DEFAULT 'NORMAL',
    "tier" "VIPTier",
    "currentOffer" JSONB,
    "offerHistory" JSONB[],
    "notes" TEXT,
    "deposit" DOUBLE PRECISION,
    "hasCompletedForms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistSettings" (
    "id" TEXT NOT NULL,
    "automaticOffersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "offerExpiryMinutes" INTEGER NOT NULL DEFAULT 120,
    "maxOffersPerSlot" INTEGER NOT NULL DEFAULT 3,
    "minimumNoticeHours" INTEGER NOT NULL DEFAULT 4,
    "offerSequence" TEXT NOT NULL DEFAULT 'tier-weighted',
    "tierWeights" JSONB NOT NULL,
    "autoTierRules" JSONB NOT NULL,
    "communication" JSONB NOT NULL,
    "autoExpireDays" INTEGER NOT NULL DEFAULT 30,
    "doubleOptInRequired" BOOLEAN NOT NULL DEFAULT true,
    "auditLogRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "WaitlistSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GroupBookingType" NOT NULL,
    "organizerId" TEXT NOT NULL,
    "organizerName" TEXT NOT NULL,
    "organizerEmail" TEXT NOT NULL,
    "organizerPhone" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "locationId" TEXT,
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "minParticipants" INTEGER NOT NULL DEFAULT 2,
    "sharedServiceId" TEXT,
    "allowIndividualServices" BOOLEAN NOT NULL DEFAULT true,
    "status" "GroupBookingStatus" NOT NULL DEFAULT 'DRAFT',
    "inviteCode" TEXT NOT NULL,
    "paymentType" "GroupPaymentType" NOT NULL DEFAULT 'INDIVIDUAL',
    "depositRequired" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupParticipant" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "patientId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "providerId" TEXT,
    "providerName" TEXT,
    "roomId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "checkedInAt" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paymentId" TEXT,
    "consentSigned" BOOLEAN NOT NULL DEFAULT false,
    "consentSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringPattern" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "roomId" TEXT,
    "locationId" TEXT,
    "notes" TEXT,
    "color" TEXT,
    "frequency" "RecurringFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "byDayOfWeek" INTEGER[],
    "byDayOfMonth" INTEGER,
    "bySetPos" INTEGER,
    "startDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endDate" TEXT,
    "occurrenceCount" INTEGER,
    "rruleString" TEXT NOT NULL,
    "status" "RecurringStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextOccurrence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "RecurringPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringException" (
    "id" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "originalDate" TEXT NOT NULL,
    "type" "ExceptionType" NOT NULL,
    "newDate" TEXT,
    "newTime" TEXT,
    "newProviderId" TEXT,
    "modifiedFields" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "RecurringException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpressBookingToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "rawTokenPrefix" TEXT NOT NULL,
    "patientId" TEXT,
    "patientName" TEXT,
    "patientEmail" TEXT,
    "patientPhone" TEXT,
    "serviceIds" TEXT[],
    "providerIds" TEXT[],
    "locationId" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "allowedDays" TEXT[],
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "redirectUrl" TEXT,
    "requireDeposit" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION,
    "status" "ExpressBookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "bookings" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpressBookingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "locationId" TEXT,
    "serviceName" TEXT,
    "serviceCategory" TEXT,
    "productType" "ProductType" NOT NULL,
    "treatmentArea" TEXT,
    "chiefComplaint" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "TreatmentStatus" NOT NULL,
    "soapNotes" JSONB NOT NULL,
    "photoIds" TEXT[],
    "injectionPointIds" TEXT[],
    "signedOffBy" TEXT,
    "signedOffAt" TIMESTAMP(3),
    "coSignRequired" BOOLEAN NOT NULL DEFAULT false,
    "coSignedBy" TEXT,
    "coSignedAt" TIMESTAMP(3),
    "notes" TEXT,
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "photosBeforeTaken" BOOLEAN NOT NULL DEFAULT false,
    "photosAfterTaken" BOOLEAN NOT NULL DEFAULT false,
    "followUpScheduled" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TEXT,
    "complications" TEXT,
    "outcome" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "lastModifiedBy" TEXT NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjectionPoint" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "units" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "depth" "InjectionDepth" NOT NULL,
    "technique" "InjectionTechnique" NOT NULL,
    "needleGauge" TEXT,
    "lotNumber" TEXT,
    "expirationDate" TEXT,
    "notes" TEXT,
    "complications" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT NOT NULL,

    CONSTRAINT "InjectionPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUsage" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCategory" "ProductCategory" NOT NULL,
    "unitsUsed" DOUBLE PRECISION,
    "volumeUsed" DOUBLE PRECISION,
    "packagesUsed" INTEGER,
    "lotNumber" TEXT NOT NULL,
    "expirationDate" TEXT,
    "vialId" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT NOT NULL,

    CONSTRAINT "ProductUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentPhoto" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "treatmentId" TEXT,
    "appointmentId" TEXT,
    "storageKey" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "originalFilename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "type" "PhotoType" NOT NULL,
    "angle" "PhotoAngle",
    "bodyRegion" TEXT,
    "description" TEXT,
    "consentFormId" TEXT,
    "photoConsent" BOOLEAN NOT NULL,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "TreatmentPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoAnnotation" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "type" "AnnotationType" NOT NULL,
    "label" TEXT,
    "notes" TEXT,
    "color" TEXT,
    "measurementValue" DOUBLE PRECISION,
    "measurementUnit" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "PhotoAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "FormType" NOT NULL,
    "category" TEXT,
    "sections" JSONB NOT NULL,
    "signature" JSONB NOT NULL,
    "requiresWitness" BOOLEAN NOT NULL DEFAULT false,
    "expirationDays" INTEGER,
    "serviceIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "lastModifiedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientFormAssignment" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "AssignmentStatus" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PatientFormAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "formTitle" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "status" "SubmissionStatus" NOT NULL,
    "responses" JSONB NOT NULL,
    "patientSignature" JSONB,
    "witnessSignature" JSONB,
    "providerSignature" JSONB,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgements" TEXT[],
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "providerId" TEXT,
    "providerName" TEXT,
    "locationId" TEXT,
    "appointmentId" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "serviceDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "internalNotes" TEXT,
    "patientNotes" TEXT,
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "voidedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "LineItemType" NOT NULL,
    "itemId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "unitType" "UnitType",
    "lotNumber" TEXT,
    "discountType" "DiscountType",
    "discountValue" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "providerId" TEXT,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod" NOT NULL,
    "cardDetails" JSONB,
    "checkDetails" JSONB,
    "giftCardDetails" JSONB,
    "financingDetails" JSONB,
    "transactionId" TEXT,
    "reference" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3) NOT NULL,
    "processedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "imageUrl" TEXT,
    "contents" JSONB NOT NULL,
    "regularPrice" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL,
    "savingsPercent" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "restrictions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableForPurchase" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagePurchase" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "items" JSONB NOT NULL,
    "status" "PackagePurchaseStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PackagePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tier" "MembershipLevel" NOT NULL,
    "imageUrl" TEXT,
    "billingCycle" "BillingCycle" NOT NULL,
    "price" INTEGER NOT NULL,
    "setupFee" INTEGER NOT NULL DEFAULT 0,
    "benefits" JSONB NOT NULL,
    "minimumTermMonths" INTEGER NOT NULL DEFAULT 0,
    "cancellationNoticeDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acceptingNewMembers" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMembership" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "resumeAt" TIMESTAMP(3),
    "status" "MembershipStatus" NOT NULL,
    "currentPeriodBenefits" JSONB NOT NULL,
    "paymentMethodId" TEXT,
    "lastPaymentDate" TIMESTAMP(3),
    "lastPaymentAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PatientMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitRedemption" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "appointmentId" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL,
    "redeemedBy" TEXT NOT NULL,

    CONSTRAINT "BenefitRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "originalValue" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "purchaserId" TEXT,
    "purchaserName" TEXT NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "recipientMessage" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "activationDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "scheduledDeliveryDate" TIMESTAMP(3),
    "status" "GiftCardStatus" NOT NULL,
    "designTemplate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "type" "GiftCardTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "notes" TEXT,
    "processedBy" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_patientNumber_idx" ON "Patient"("patientNumber");

-- CreateIndex
CREATE INDEX "Patient_lastName_idx" ON "Patient"("lastName");

-- CreateIndex
CREATE INDEX "Patient_status_idx" ON "Patient"("status");

-- CreateIndex
CREATE INDEX "Patient_createdAt_idx" ON "Patient"("createdAt");

-- CreateIndex
CREATE INDEX "Allergy_patientId_idx" ON "Allergy"("patientId");

-- CreateIndex
CREATE INDEX "Note_patientId_idx" ON "Note"("patientId");

-- CreateIndex
CREATE INDEX "Note_appointmentId_idx" ON "Note"("appointmentId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_practitionerId_idx" ON "Appointment"("practitionerId");

-- CreateIndex
CREATE INDEX "Appointment_startTime_idx" ON "Appointment"("startTime");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "WaitlistEntry_patientId_idx" ON "WaitlistEntry"("patientId");

-- CreateIndex
CREATE INDEX "WaitlistEntry_status_idx" ON "WaitlistEntry"("status");

-- CreateIndex
CREATE INDEX "WaitlistEntry_priority_idx" ON "WaitlistEntry"("priority");

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_idx" ON "WaitlistEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GroupBooking_inviteCode_key" ON "GroupBooking"("inviteCode");

-- CreateIndex
CREATE INDEX "GroupBooking_organizerId_idx" ON "GroupBooking"("organizerId");

-- CreateIndex
CREATE INDEX "GroupBooking_date_idx" ON "GroupBooking"("date");

-- CreateIndex
CREATE INDEX "GroupBooking_status_idx" ON "GroupBooking"("status");

-- CreateIndex
CREATE INDEX "GroupBooking_inviteCode_idx" ON "GroupBooking"("inviteCode");

-- CreateIndex
CREATE INDEX "GroupParticipant_groupId_idx" ON "GroupParticipant"("groupId");

-- CreateIndex
CREATE INDEX "GroupParticipant_patientId_idx" ON "GroupParticipant"("patientId");

-- CreateIndex
CREATE INDEX "GroupParticipant_status_idx" ON "GroupParticipant"("status");

-- CreateIndex
CREATE INDEX "RecurringPattern_patientId_idx" ON "RecurringPattern"("patientId");

-- CreateIndex
CREATE INDEX "RecurringPattern_providerId_idx" ON "RecurringPattern"("providerId");

-- CreateIndex
CREATE INDEX "RecurringPattern_status_idx" ON "RecurringPattern"("status");

-- CreateIndex
CREATE INDEX "RecurringPattern_startDate_idx" ON "RecurringPattern"("startDate");

-- CreateIndex
CREATE INDEX "RecurringException_patternId_idx" ON "RecurringException"("patternId");

-- CreateIndex
CREATE INDEX "RecurringException_originalDate_idx" ON "RecurringException"("originalDate");

-- CreateIndex
CREATE UNIQUE INDEX "ExpressBookingToken_token_key" ON "ExpressBookingToken"("token");

-- CreateIndex
CREATE INDEX "ExpressBookingToken_token_idx" ON "ExpressBookingToken"("token");

-- CreateIndex
CREATE INDEX "ExpressBookingToken_patientId_idx" ON "ExpressBookingToken"("patientId");

-- CreateIndex
CREATE INDEX "ExpressBookingToken_status_idx" ON "ExpressBookingToken"("status");

-- CreateIndex
CREATE INDEX "ExpressBookingToken_expiresAt_idx" ON "ExpressBookingToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Treatment_patientId_idx" ON "Treatment"("patientId");

-- CreateIndex
CREATE INDEX "Treatment_providerId_idx" ON "Treatment"("providerId");

-- CreateIndex
CREATE INDEX "Treatment_appointmentId_idx" ON "Treatment"("appointmentId");

-- CreateIndex
CREATE INDEX "Treatment_status_idx" ON "Treatment"("status");

-- CreateIndex
CREATE INDEX "Treatment_startTime_idx" ON "Treatment"("startTime");

-- CreateIndex
CREATE INDEX "InjectionPoint_treatmentId_idx" ON "InjectionPoint"("treatmentId");

-- CreateIndex
CREATE INDEX "InjectionPoint_timestamp_idx" ON "InjectionPoint"("timestamp");

-- CreateIndex
CREATE INDEX "ProductUsage_treatmentId_idx" ON "ProductUsage"("treatmentId");

-- CreateIndex
CREATE INDEX "ProductUsage_addedAt_idx" ON "ProductUsage"("addedAt");

-- CreateIndex
CREATE INDEX "TreatmentPhoto_patientId_idx" ON "TreatmentPhoto"("patientId");

-- CreateIndex
CREATE INDEX "TreatmentPhoto_treatmentId_idx" ON "TreatmentPhoto"("treatmentId");

-- CreateIndex
CREATE INDEX "TreatmentPhoto_uploadedAt_idx" ON "TreatmentPhoto"("uploadedAt");

-- CreateIndex
CREATE INDEX "PhotoAnnotation_photoId_idx" ON "PhotoAnnotation"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_slug_key" ON "FormTemplate"("slug");

-- CreateIndex
CREATE INDEX "FormTemplate_type_idx" ON "FormTemplate"("type");

-- CreateIndex
CREATE INDEX "FormTemplate_isActive_idx" ON "FormTemplate"("isActive");

-- CreateIndex
CREATE INDEX "FormTemplate_slug_idx" ON "FormTemplate"("slug");

-- CreateIndex
CREATE INDEX "PatientFormAssignment_patientId_idx" ON "PatientFormAssignment"("patientId");

-- CreateIndex
CREATE INDEX "PatientFormAssignment_formId_idx" ON "PatientFormAssignment"("formId");

-- CreateIndex
CREATE INDEX "PatientFormAssignment_status_idx" ON "PatientFormAssignment"("status");

-- CreateIndex
CREATE INDEX "FormSubmission_patientId_idx" ON "FormSubmission"("patientId");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_status_idx" ON "FormSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_patientId_idx" ON "Invoice"("patientId");

-- CreateIndex
CREATE INDEX "Invoice_providerId_idx" ON "Invoice"("providerId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_patientId_idx" ON "Payment"("patientId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_processedAt_idx" ON "Payment"("processedAt");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_processedAt_idx" ON "Refund"("processedAt");

-- CreateIndex
CREATE INDEX "Package_isActive_idx" ON "Package"("isActive");

-- CreateIndex
CREATE INDEX "Package_availableForPurchase_idx" ON "Package"("availableForPurchase");

-- CreateIndex
CREATE INDEX "Package_displayOrder_idx" ON "Package"("displayOrder");

-- CreateIndex
CREATE INDEX "PackagePurchase_packageId_idx" ON "PackagePurchase"("packageId");

-- CreateIndex
CREATE INDEX "PackagePurchase_patientId_idx" ON "PackagePurchase"("patientId");

-- CreateIndex
CREATE INDEX "PackagePurchase_status_idx" ON "PackagePurchase"("status");

-- CreateIndex
CREATE INDEX "PackagePurchase_purchaseDate_idx" ON "PackagePurchase"("purchaseDate");

-- CreateIndex
CREATE INDEX "MembershipTier_tier_idx" ON "MembershipTier"("tier");

-- CreateIndex
CREATE INDEX "MembershipTier_isActive_idx" ON "MembershipTier"("isActive");

-- CreateIndex
CREATE INDEX "MembershipTier_acceptingNewMembers_idx" ON "MembershipTier"("acceptingNewMembers");

-- CreateIndex
CREATE INDEX "PatientMembership_patientId_idx" ON "PatientMembership"("patientId");

-- CreateIndex
CREATE INDEX "PatientMembership_tierId_idx" ON "PatientMembership"("tierId");

-- CreateIndex
CREATE INDEX "PatientMembership_status_idx" ON "PatientMembership"("status");

-- CreateIndex
CREATE INDEX "PatientMembership_enrolledAt_idx" ON "PatientMembership"("enrolledAt");

-- CreateIndex
CREATE INDEX "BenefitRedemption_membershipId_idx" ON "BenefitRedemption"("membershipId");

-- CreateIndex
CREATE INDEX "BenefitRedemption_patientId_idx" ON "BenefitRedemption"("patientId");

-- CreateIndex
CREATE INDEX "BenefitRedemption_redeemedAt_idx" ON "BenefitRedemption"("redeemedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_code_idx" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_purchaserEmail_idx" ON "GiftCard"("purchaserEmail");

-- CreateIndex
CREATE INDEX "GiftCard_recipientEmail_idx" ON "GiftCard"("recipientEmail");

-- CreateIndex
CREATE INDEX "GiftCard_status_idx" ON "GiftCard"("status");

-- CreateIndex
CREATE INDEX "GiftCard_purchaseDate_idx" ON "GiftCard"("purchaseDate");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_giftCardId_idx" ON "GiftCardTransaction"("giftCardId");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_processedAt_idx" ON "GiftCardTransaction"("processedAt");

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringException" ADD CONSTRAINT "RecurringException_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "RecurringPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjectionPoint" ADD CONSTRAINT "InjectionPoint_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUsage" ADD CONSTRAINT "ProductUsage_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAnnotation" ADD CONSTRAINT "PhotoAnnotation_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "TreatmentPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFormAssignment" ADD CONSTRAINT "PatientFormAssignment_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePurchase" ADD CONSTRAINT "PackagePurchase_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMembership" ADD CONSTRAINT "PatientMembership_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "MembershipTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitRedemption" ADD CONSTRAINT "BenefitRedemption_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "PatientMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
