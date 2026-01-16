-- CreateTable
CREATE TABLE "ReminderSettings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sendConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "sendPrepReminder" BOOLEAN NOT NULL DEFAULT true,
    "prepReminderDays" INTEGER NOT NULL DEFAULT 3,
    "send48hrReminder" BOOLEAN NOT NULL DEFAULT true,
    "send24hrReminder" BOOLEAN NOT NULL DEFAULT true,
    "send2hrReminder" BOOLEAN NOT NULL DEFAULT true,
    "sendFollowUps" BOOLEAN NOT NULL DEFAULT true,
    "businessHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "businessHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "quietHoursStart" TEXT NOT NULL DEFAULT '21:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '08:00',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ReminderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentReminder" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "messageBody" TEXT NOT NULL,
    "messageSid" TEXT,
    "status" "ReminderStatus" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "failedReason" TEXT,

    CONSTRAINT "SentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "channel" "TemplateChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "hipaaCompliant" BOOLEAN NOT NULL DEFAULT true,
    "includesOptOut" BOOLEAN NOT NULL DEFAULT false,
    "maxLength" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundMessage" (
    "id" TEXT NOT NULL,
    "messageSid" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "numMedia" INTEGER NOT NULL DEFAULT 0,
    "mediaUrls" TEXT[],
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT,
    "patientId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "isOptOut" BOOLEAN NOT NULL DEFAULT false,
    "isOptIn" BOOLEAN NOT NULL DEFAULT false,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "detectedCommand" TEXT,

    CONSTRAINT "InboundMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundMessage" (
    "id" TEXT NOT NULL,
    "externalSid" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "OutboundMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusUpdate" (
    "id" TEXT NOT NULL,
    "messageSid" TEXT NOT NULL,
    "messageStatus" "MessageStatus" NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "to" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAlert" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "patientId" TEXT,
    "patientPhone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggerKeywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,

    CONSTRAINT "StaffAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMessagingProfile" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneValid" BOOLEAN NOT NULL DEFAULT true,
    "phoneType" "PhoneType" NOT NULL DEFAULT 'mobile',
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "smsConsentedAt" TIMESTAMP(3),
    "smsOptOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMessagingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentReminder_appointmentId_idx" ON "SentReminder"("appointmentId");

-- CreateIndex
CREATE INDEX "SentReminder_patientId_idx" ON "SentReminder"("patientId");

-- CreateIndex
CREATE INDEX "SentReminder_sentAt_idx" ON "SentReminder"("sentAt");

-- CreateIndex
CREATE INDEX "SentReminder_status_idx" ON "SentReminder"("status");

-- CreateIndex
CREATE INDEX "MessageTemplate_category_idx" ON "MessageTemplate"("category");

-- CreateIndex
CREATE INDEX "MessageTemplate_channel_idx" ON "MessageTemplate"("channel");

-- CreateIndex
CREATE INDEX "MessageTemplate_isActive_idx" ON "MessageTemplate"("isActive");

-- CreateIndex
CREATE INDEX "MessageTemplate_isSystem_idx" ON "MessageTemplate"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "InboundMessage_messageSid_key" ON "InboundMessage"("messageSid");

-- CreateIndex
CREATE INDEX "InboundMessage_messageSid_idx" ON "InboundMessage"("messageSid");

-- CreateIndex
CREATE INDEX "InboundMessage_patientId_idx" ON "InboundMessage"("patientId");

-- CreateIndex
CREATE INDEX "InboundMessage_conversationId_idx" ON "InboundMessage"("conversationId");

-- CreateIndex
CREATE INDEX "InboundMessage_timestamp_idx" ON "InboundMessage"("timestamp");

-- CreateIndex
CREATE INDEX "InboundMessage_processed_idx" ON "InboundMessage"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundMessage_externalSid_key" ON "OutboundMessage"("externalSid");

-- CreateIndex
CREATE INDEX "OutboundMessage_externalSid_idx" ON "OutboundMessage"("externalSid");

-- CreateIndex
CREATE INDEX "OutboundMessage_conversationId_idx" ON "OutboundMessage"("conversationId");

-- CreateIndex
CREATE INDEX "OutboundMessage_status_idx" ON "OutboundMessage"("status");

-- CreateIndex
CREATE INDEX "OutboundMessage_sentAt_idx" ON "OutboundMessage"("sentAt");

-- CreateIndex
CREATE INDEX "StatusUpdate_messageSid_idx" ON "StatusUpdate"("messageSid");

-- CreateIndex
CREATE INDEX "StatusUpdate_timestamp_idx" ON "StatusUpdate"("timestamp");

-- CreateIndex
CREATE INDEX "StaffAlert_type_idx" ON "StaffAlert"("type");

-- CreateIndex
CREATE INDEX "StaffAlert_patientId_idx" ON "StaffAlert"("patientId");

-- CreateIndex
CREATE INDEX "StaffAlert_createdAt_idx" ON "StaffAlert"("createdAt");

-- CreateIndex
CREATE INDEX "StaffAlert_acknowledgedAt_idx" ON "StaffAlert"("acknowledgedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatientMessagingProfile_patientId_key" ON "PatientMessagingProfile"("patientId");

-- CreateIndex
CREATE INDEX "PatientMessagingProfile_patientId_idx" ON "PatientMessagingProfile"("patientId");

-- CreateIndex
CREATE INDEX "PatientMessagingProfile_phone_idx" ON "PatientMessagingProfile"("phone");

-- CreateIndex
CREATE INDEX "PatientMessagingProfile_smsConsent_idx" ON "PatientMessagingProfile"("smsConsent");
