-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('sms', 'email', 'portal');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessagePriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('all_patients', 'last_visit_30days', 'last_visit_60days', 'last_visit_90days', 'vip', 'new_patients', 'birthday_this_month', 'custom');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('marketing', 'transactional');

-- CreateEnum
CREATE TYPE "CampaignRecipientStatus" AS ENUM ('pending', 'sent', 'delivered', 'failed', 'opted_out');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('opted_in', 'opted_out', 'pending');

-- CreateEnum
CREATE TYPE "ConsentSource" AS ENUM ('sms', 'web', 'app', 'paper', 'verbal', 'import');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('opt_in', 'opt_out', 'update', 'revoke_all');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('transactional', 'marketing', 'all');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('confirmation', 'prep_reminder', 'reminder_48hr', 'reminder_24hr', 'reminder_2hr', 'followup_24hr', 'followup_3day', 'followup_1week', 'followup_2week', 'no_show');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('sent', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "PendingReminderStatus" AS ENUM ('pending', 'skipped', 'sent');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('appointment', 'treatment', 'followup', 'marketing', 'financial', 'membership', 'review', 'emergency', 'administrative');

-- CreateEnum
CREATE TYPE "TemplateChannel" AS ENUM ('sms', 'email', 'both');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('emergency', 'urgent', 'normal');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'resolved', 'waiting', 'urgent', 'archived');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('mobile', 'landline', 'voip', 'unknown');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "patientEmail" TEXT,
    "status" "ConversationStatus" NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageBody" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessageDirection" "MessageDirection",
    "assignedTo" TEXT,
    "assignedToName" TEXT,
    "tags" TEXT[],
    "priority" "MessagePriority" NOT NULL,
    "aiAnalysis" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessagingMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "externalSid" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "templateId" TEXT,
    "isAutoResponse" BOOLEAN NOT NULL DEFAULT false,
    "aiAnalysis" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentBy" TEXT,

    CONSTRAINT "MessagingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL,
    "audienceType" "AudienceType" NOT NULL,
    "audienceFilters" JSONB,
    "audienceCount" INTEGER NOT NULL DEFAULT 0,
    "consentCount" INTEGER NOT NULL DEFAULT 0,
    "templateId" TEXT,
    "messageBody" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "sendingStartedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "stats" JSONB NOT NULL,
    "batchSize" INTEGER NOT NULL DEFAULT 100,
    "batchDelayMs" INTEGER NOT NULL DEFAULT 5000,
    "currentBatch" INTEGER NOT NULL DEFAULT 0,
    "totalBatches" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "CampaignRecipientStatus" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedReason" TEXT,
    "twilioSid" TEXT,

    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "transactionalConsent" "ConsentStatus" NOT NULL,
    "marketingConsent" "ConsentStatus" NOT NULL,
    "transactionalOptInAt" TIMESTAMP(3),
    "marketingOptInAt" TIMESTAMP(3),
    "transactionalOptInSource" "ConsentSource",
    "marketingOptInSource" "ConsentSource",
    "transactionalOptOutAt" TIMESTAMP(3),
    "marketingOptOutAt" TIMESTAMP(3),
    "transactionalOptOutKeyword" TEXT,
    "marketingOptOutKeyword" TEXT,
    "tcpaCompliant" BOOLEAN NOT NULL DEFAULT true,
    "lastAuditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentAuditLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "previousStatus" "ConsentStatus" NOT NULL,
    "newStatus" "ConsentStatus" NOT NULL,
    "source" "ConsentSource" NOT NULL,
    "keyword" TEXT,
    "messageSid" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL,
    "processedWithin10Days" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentRecordId" TEXT,

    CONSTRAINT "ConsentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartingSettings" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "locationId" TEXT,
    "defaultView" TEXT NOT NULL DEFAULT 'face-2d',
    "showInjectionHistory" BOOLEAN NOT NULL DEFAULT true,
    "showProductSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "autoSaveInterval" INTEGER NOT NULL DEFAULT 30,
    "zoneConfigs" JSONB NOT NULL,
    "defaultMeasurement" TEXT NOT NULL DEFAULT 'units',
    "quickActions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "ChartingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_patientId_idx" ON "Conversation"("patientId");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Conversation_assignedTo_idx" ON "Conversation"("assignedTo");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_priority_idx" ON "Conversation"("priority");

-- CreateIndex
CREATE INDEX "MessagingMessage_conversationId_idx" ON "MessagingMessage"("conversationId");

-- CreateIndex
CREATE INDEX "MessagingMessage_patientId_idx" ON "MessagingMessage"("patientId");

-- CreateIndex
CREATE INDEX "MessagingMessage_status_idx" ON "MessagingMessage"("status");

-- CreateIndex
CREATE INDEX "MessagingMessage_scheduledAt_idx" ON "MessagingMessage"("scheduledAt");

-- CreateIndex
CREATE INDEX "MessagingMessage_sentAt_idx" ON "MessagingMessage"("sentAt");

-- CreateIndex
CREATE INDEX "MessagingMessage_createdAt_idx" ON "MessagingMessage"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_scheduledFor_idx" ON "Campaign"("scheduledFor");

-- CreateIndex
CREATE INDEX "Campaign_sentAt_idx" ON "Campaign"("sentAt");

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "CampaignRecipient_campaignId_idx" ON "CampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_patientId_idx" ON "CampaignRecipient"("patientId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_status_idx" ON "CampaignRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_patientId_key" ON "ConsentRecord"("patientId");

-- CreateIndex
CREATE INDEX "ConsentRecord_patientId_idx" ON "ConsentRecord"("patientId");

-- CreateIndex
CREATE INDEX "ConsentRecord_phone_idx" ON "ConsentRecord"("phone");

-- CreateIndex
CREATE INDEX "ConsentRecord_transactionalConsent_idx" ON "ConsentRecord"("transactionalConsent");

-- CreateIndex
CREATE INDEX "ConsentRecord_marketingConsent_idx" ON "ConsentRecord"("marketingConsent");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_patientId_idx" ON "ConsentAuditLog"("patientId");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_phone_idx" ON "ConsentAuditLog"("phone");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_action_idx" ON "ConsentAuditLog"("action");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_processedAt_idx" ON "ConsentAuditLog"("processedAt");

-- CreateIndex
CREATE INDEX "ConsentAuditLog_consentRecordId_idx" ON "ConsentAuditLog"("consentRecordId");

-- CreateIndex
CREATE INDEX "ChartingSettings_providerId_idx" ON "ChartingSettings"("providerId");

-- CreateIndex
CREATE INDEX "ChartingSettings_locationId_idx" ON "ChartingSettings"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartingSettings_providerId_locationId_key" ON "ChartingSettings"("providerId", "locationId");

-- AddForeignKey
ALTER TABLE "MessagingMessage" ADD CONSTRAINT "MessagingMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentAuditLog" ADD CONSTRAINT "ConsentAuditLog_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "ConsentRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
