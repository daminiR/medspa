/**
 * Database Seed Script
 *
 * Populates the database with sample data for development
 * Run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // System user for audit fields
  const SYSTEM_USER = 'system-seed';

  // Create sample patients
  console.log('Creating patients...');
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        patientNumber: 'P-2024-0001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+15551234567',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'FEMALE',
        status: 'ACTIVE',
        addressStreet: '123 Main St',
        addressCity: 'Beverly Hills',
        addressState: 'CA',
        addressZipCode: '90210',
        commPrefSmsNotifications: true,
        commPrefEmailNotifications: true,
        commPrefMarketingEmails: true,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
    prisma.patient.create({
      data: {
        patientNumber: 'P-2024-0002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '+15552345678',
        dateOfBirth: new Date('1978-07-22'),
        gender: 'MALE',
        status: 'ACTIVE',
        addressStreet: '456 Oak Ave',
        addressCity: 'Los Angeles',
        addressState: 'CA',
        addressZipCode: '90001',
        commPrefSmsNotifications: true,
        commPrefEmailNotifications: true,
        commPrefMarketingEmails: false,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
    prisma.patient.create({
      data: {
        patientNumber: 'P-2024-0003',
        firstName: 'Emily',
        lastName: 'Martinez',
        email: 'emily.martinez@email.com',
        phone: '+15553456789',
        dateOfBirth: new Date('1992-11-08'),
        gender: 'FEMALE',
        status: 'ACTIVE',
        addressStreet: '789 Palm Dr',
        addressCity: 'Santa Monica',
        addressState: 'CA',
        addressZipCode: '90401',
        commPrefSmsNotifications: true,
        commPrefEmailNotifications: true,
        commPrefMarketingEmails: true,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
    prisma.patient.create({
      data: {
        patientNumber: 'P-2024-0004',
        firstName: 'James',
        lastName: 'Williams',
        email: 'james.williams@email.com',
        phone: '+15554567890',
        dateOfBirth: new Date('1970-05-30'),
        gender: 'MALE',
        status: 'ACTIVE',
        commPrefSmsNotifications: true,
        commPrefEmailNotifications: false,
        commPrefMarketingEmails: false,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
    prisma.patient.create({
      data: {
        patientNumber: 'P-2024-0005',
        firstName: 'Jessica',
        lastName: 'Brown',
        email: 'jessica.brown@email.com',
        phone: '+15555678901',
        dateOfBirth: new Date('1988-09-12'),
        gender: 'FEMALE',
        status: 'ACTIVE',
        addressStreet: '321 Luxury Ln',
        addressCity: 'Malibu',
        addressState: 'CA',
        addressZipCode: '90265',
        commPrefSmsNotifications: true,
        commPrefEmailNotifications: true,
        commPrefMarketingEmails: true,
        lifetimeValue: 15000,
        totalVisits: 24,
        tags: ['VIP', 'Loyalty Member'],
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
  ]);
  console.log(`✅ Created ${patients.length} patients`);

  // Create sample membership tiers
  console.log('Creating membership tiers...');
  const tiers = await Promise.all([
    prisma.membershipTier.create({
      data: {
        name: 'Bronze Membership',
        description: 'Entry level membership with basic benefits',
        tier: 'BRONZE',
        billingCycle: 'MONTHLY',
        price: 9900, // $99 in cents
        setupFee: 0,
        benefits: {
          discountPercent: 10,
          monthlyCredits: 50,
          priorityBooking: false,
          freeConsultations: false,
          exclusiveEvents: false,
        },
        minimumTermMonths: 0,
        cancellationNoticeDays: 30,
        isActive: true,
        acceptingNewMembers: true,
        displayOrder: 1,
      },
    }),
    prisma.membershipTier.create({
      data: {
        name: 'Silver Membership',
        description: 'Mid-tier membership with enhanced benefits',
        tier: 'SILVER',
        billingCycle: 'MONTHLY',
        price: 19900, // $199 in cents
        setupFee: 0,
        benefits: {
          discountPercent: 15,
          monthlyCredits: 100,
          priorityBooking: true,
          freeConsultations: false,
          exclusiveEvents: false,
        },
        minimumTermMonths: 3,
        cancellationNoticeDays: 30,
        isActive: true,
        acceptingNewMembers: true,
        displayOrder: 2,
      },
    }),
    prisma.membershipTier.create({
      data: {
        name: 'Gold Membership',
        description: 'Premium membership with VIP benefits',
        tier: 'GOLD',
        billingCycle: 'MONTHLY',
        price: 34900, // $349 in cents
        setupFee: 0,
        benefits: {
          discountPercent: 20,
          monthlyCredits: 200,
          priorityBooking: true,
          freeConsultations: true,
          exclusiveEvents: true,
        },
        minimumTermMonths: 6,
        cancellationNoticeDays: 30,
        isActive: true,
        acceptingNewMembers: true,
        displayOrder: 3,
      },
    }),
    prisma.membershipTier.create({
      data: {
        name: 'Platinum Membership',
        description: 'Elite membership with all benefits',
        tier: 'PLATINUM',
        billingCycle: 'MONTHLY',
        price: 59900, // $599 in cents
        setupFee: 0,
        benefits: {
          discountPercent: 25,
          monthlyCredits: 400,
          priorityBooking: true,
          freeConsultations: true,
          exclusiveEvents: true,
          personalConcierge: true,
        },
        minimumTermMonths: 12,
        cancellationNoticeDays: 30,
        isActive: true,
        acceptingNewMembers: true,
        displayOrder: 4,
      },
    }),
  ]);
  console.log(`✅ Created ${tiers.length} membership tiers`);

  // Create sample packages
  console.log('Creating packages...');
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: 'Botox Starter Package',
        description: 'Perfect for first-time Botox patients',
        category: 'Injectable',
        contents: [
          { type: 'service', name: 'Botox Treatment', quantity: 30, unit: 'units' },
          { type: 'service', name: 'Consultation', quantity: 1, unit: 'session' },
        ],
        regularPrice: 600,
        salePrice: 499,
        savings: 101,
        savingsPercent: 17,
        validityDays: 180,
        isActive: true,
        availableForPurchase: true,
        displayOrder: 1,
        createdBy: SYSTEM_USER,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Filler Package',
        description: '2 syringes of premium filler',
        category: 'Injectable',
        contents: [
          { type: 'service', name: 'Dermal Filler', quantity: 2, unit: 'syringes' },
        ],
        regularPrice: 1400,
        salePrice: 1199,
        savings: 201,
        savingsPercent: 14,
        validityDays: 365,
        isActive: true,
        availableForPurchase: true,
        displayOrder: 2,
        createdBy: SYSTEM_USER,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Hydrafacial Series',
        description: '3 Hydrafacials at a discounted rate',
        category: 'Facial',
        contents: [
          { type: 'service', name: 'Hydrafacial', quantity: 3, unit: 'sessions' },
        ],
        regularPrice: 600,
        salePrice: 499,
        savings: 101,
        savingsPercent: 17,
        validityDays: 180,
        isActive: true,
        availableForPurchase: true,
        displayOrder: 3,
        createdBy: SYSTEM_USER,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Annual Maintenance',
        description: 'Comprehensive annual treatment plan',
        category: 'Bundle',
        contents: [
          { type: 'service', name: 'Botox', quantity: 100, unit: 'units' },
          { type: 'service', name: 'Hydrafacial', quantity: 4, unit: 'sessions' },
          { type: 'service', name: 'Chemical Peel', quantity: 2, unit: 'sessions' },
        ],
        regularPrice: 5000,
        salePrice: 3999,
        savings: 1001,
        savingsPercent: 20,
        validityDays: 365,
        isActive: true,
        availableForPurchase: true,
        displayOrder: 4,
        createdBy: SYSTEM_USER,
      },
    }),
  ]);
  console.log(`✅ Created ${packages.length} packages`);

  // Create sample gift cards
  console.log('Creating gift cards...');
  const giftCards = await Promise.all([
    prisma.giftCard.create({
      data: {
        code: 'GIFT-001-2024',
        originalValue: 500,
        currentBalance: 500,
        purchaserId: patients[0].id,
        purchaserName: 'Sarah Johnson',
        purchaserEmail: 'sarah.johnson@email.com',
        recipientName: 'Mom',
        recipientEmail: 'mom@email.com',
        status: 'ACTIVE',
        purchaseDate: new Date(),
        activationDate: new Date(),
        expirationDate: new Date('2025-12-31'),
        createdBy: SYSTEM_USER,
      },
    }),
    prisma.giftCard.create({
      data: {
        code: 'GIFT-002-2024',
        originalValue: 250,
        currentBalance: 175,
        purchaserId: patients[4].id,
        purchaserName: 'Jessica Brown',
        purchaserEmail: 'jessica.brown@email.com',
        recipientName: 'Best Friend',
        status: 'PARTIALLY_USED',
        purchaseDate: new Date('2024-01-15'),
        activationDate: new Date('2024-01-20'),
        expirationDate: new Date('2025-06-30'),
        createdBy: SYSTEM_USER,
      },
    }),
  ]);
  console.log(`✅ Created ${giftCards.length} gift cards`);

  // Create sample form templates
  console.log('Creating form templates...');
  const formTemplates = await Promise.all([
    prisma.formTemplate.create({
      data: {
        slug: 'new-patient-intake',
        title: 'New Patient Intake',
        description: 'Comprehensive intake form for new patients',
        type: 'intake',
        category: 'Registration',
        sections: [
          { title: 'Personal Information', fields: ['name', 'dob', 'phone', 'email'] },
          { title: 'Medical History', fields: ['conditions', 'medications', 'allergies'] },
          { title: 'Emergency Contact', fields: ['contact_name', 'contact_phone'] },
        ],
        signature: { required: true, witnessRequired: false },
        isActive: true,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
    prisma.formTemplate.create({
      data: {
        slug: 'botox-consent',
        title: 'Botox Consent',
        description: 'Consent form for Botox treatments',
        type: 'consent',
        category: 'Treatment',
        sections: [
          { title: 'Treatment Information', fields: ['treatment_areas', 'expected_results'] },
          { title: 'Risks and Side Effects', fields: ['risks_acknowledged'] },
          { title: 'Patient Consent', fields: ['signature', 'date'] },
        ],
        signature: { required: true, witnessRequired: false },
        serviceIds: ['botox'],
        isActive: true,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
    prisma.formTemplate.create({
      data: {
        slug: 'hipaa-authorization',
        title: 'HIPAA Authorization',
        description: 'HIPAA privacy authorization form',
        type: 'hipaa',
        category: 'Legal',
        sections: [
          { title: 'Privacy Notice', fields: ['privacy_acknowledged'] },
          { title: 'Authorization', fields: ['signature', 'date'] },
        ],
        signature: { required: true, witnessRequired: true },
        isActive: true,
        createdBy: SYSTEM_USER,
        lastModifiedBy: SYSTEM_USER,
      },
    }),
  ]);
  console.log(`✅ Created ${formTemplates.length} form templates`);

  // Create waitlist settings
  console.log('Creating waitlist settings...');
  await prisma.waitlistSettings.create({
    data: {
      automaticOffersEnabled: true,
      offerExpiryMinutes: 120,
      maxOffersPerSlot: 3,
      minimumNoticeHours: 4,
      offerSequence: 'tier-weighted',
      tierWeights: { platinum: 60, gold: 30, silver: 10 },
      autoTierRules: {
        platinum: { visits: 12, revenue: 5000 },
        gold: { visits: 6, revenue: 2000 },
        silver: { visits: 3, revenue: 500 },
      },
      communication: {
        smsEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
      },
      autoExpireDays: 30,
      doubleOptInRequired: true,
      auditLogRetentionDays: 90,
    },
  });
  console.log('✅ Created waitlist settings');

  // Seed messaging templates
  console.log('Seeding messaging templates...');
  const { seedSystemTemplates } = await import('../src/routes/messaging-templates');
  await seedSystemTemplates();

  const templateCount = await prisma.messageTemplate.count();
  console.log(`✅ Created ${templateCount} messaging templates`);

  // Summary
  console.log('\n✨ Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`  - ${patients.length} patients`);
  console.log(`  - ${tiers.length} membership tiers`);
  console.log(`  - ${packages.length} packages`);
  console.log(`  - ${giftCards.length} gift cards`);
  console.log(`  - ${formTemplates.length} form templates`);
  console.log(`  - ${templateCount} messaging templates`);
  console.log('  - 1 waitlist settings\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
