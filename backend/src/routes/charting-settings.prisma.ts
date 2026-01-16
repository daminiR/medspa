/**
 * Charting Settings API Routes - Prisma Version
 *
 * Manages:
 * - Provider/location charting preferences
 * - Face zone configurations
 * - Quick actions
 * - Display settings
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { FACE_ZONES } from './treatment-templates';
import { prisma } from '../lib/prisma';

const chartingSettings = new Hono();

// ===================
// Validation Schemas
// ===================

// Zone config schema
const zoneConfigSchema = z.object({
  zoneId: z.string().min(1).max(50),
  zoneName: z.string().min(1).max(255),
  isEnabled: z.boolean().default(true),
  defaultUnits: z.number().positive().optional(),
  defaultVolume: z.number().positive().optional(),
  customColor: z.string().max(20).optional(),
});

// Quick action schema
const quickActionSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(100),
  action: z.string().min(1).max(255),
  productId: z.string().uuid().optional(),
  units: z.number().positive().optional(),
});

// Charting settings schema
const chartingSettingsSchema = z.object({
  providerId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),

  // Display preferences
  defaultView: z.enum(['face-2d', 'face-3d', 'body']).default('face-2d'),
  showInjectionHistory: z.boolean().default(true),
  showProductSuggestions: z.boolean().default(true),
  autoSaveInterval: z.number().int().min(10).max(300).default(30),

  // Zone configurations
  zoneConfigs: z.array(zoneConfigSchema).optional(),

  // Unit/Volume defaults
  defaultMeasurement: z.enum(['units', 'ml']).default('units'),

  // Quick actions
  quickActions: z.array(quickActionSchema).optional(),
});

// Update charting settings schema (partial)
const updateChartingSettingsSchema = chartingSettingsSchema.partial();

// Update zone configs schema
const updateZoneConfigsSchema = z.object({
  zoneConfigs: z.array(zoneConfigSchema),
});

// Query params for getting settings
const getSettingsQuerySchema = z.object({
  providerId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
});

// ===================
// Types
// ===================

export interface ZoneConfig {
  zoneId: string;
  zoneName: string;
  isEnabled: boolean;
  defaultUnits?: number;
  defaultVolume?: number;
  customColor?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  productId?: string;
  units?: number;
}

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return crypto.randomUUID();
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function createDefaultZoneConfigs(): ZoneConfig[] {
  return FACE_ZONES.map(zone => ({
    zoneId: zone.id,
    zoneName: zone.name,
    isEnabled: true,
    defaultUnits: 'defaultUnits' in zone ? zone.defaultUnits : undefined,
    defaultVolume: 'defaultVolume' in zone ? zone.defaultVolume : undefined,
  }));
}

function createDefaultQuickActions(): QuickAction[] {
  return [
    {
      id: generateId(),
      label: 'Add Botox 10u',
      action: 'add-product',
      productId: 'product-001',
      units: 10,
    },
    {
      id: generateId(),
      label: 'Add Filler 0.5ml',
      action: 'add-product',
      productId: 'product-002',
      units: 0.5,
    },
    {
      id: generateId(),
      label: 'Take Photo',
      action: 'capture-photo',
    },
  ];
}

// ===================
// Middleware
// ===================

// All routes require session authentication
chartingSettings.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * Get charting settings for current user/location
 * GET /api/charting-settings
 */
chartingSettings.get('/', zValidator('query', getSettingsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const providerId = query.providerId || user.uid;
  const locationId = query.locationId;

  try {
    // Try to find settings in order of specificity
    let settings;

    // 1. Provider + Location specific
    if (providerId && locationId) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId,
            locationId,
          },
        },
      });
    }

    // 2. Provider specific (null location)
    if (!settings && providerId) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId,
            locationId: null as any,
          },
        },
      });
    }

    // 3. Location specific (null provider)
    if (!settings && locationId) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId: null as any,
            locationId,
          },
        },
      });
    }

    // 4. Global defaults (null provider and location)
    if (!settings) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId: null as any,
            locationId: null as any,
          },
        },
      });
    }

    // 5. Create default if nothing exists
    if (!settings) {
      settings = await prisma.chartingSettings.create({
        data: {
          id: generateId(),
          providerId,
          locationId,
          defaultView: 'face-2d',
          showInjectionHistory: true,
          showProductSuggestions: true,
          autoSaveInterval: 30,
          zoneConfigs: createDefaultZoneConfigs() as any,
          defaultMeasurement: 'units',
          quickActions: createDefaultQuickActions() as any,
          updatedAt: new Date(),
          updatedBy: user.uid,
        },
      });
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'charting_settings',
      resourceId: settings.id,
      ipAddress,
      metadata: { providerId, locationId },
    });

    return c.json({
      settings: {
        ...settings,
        updatedAt: settings.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching charting settings:', error);
    throw error;
  }
});

/**
 * Update charting settings
 * PUT /api/charting-settings
 */
chartingSettings.put('/', zValidator('json', updateChartingSettingsSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const providerId = data.providerId || user.uid;
  const locationId = data.locationId;

  try {
    const now = new Date();

    // Assign IDs to new quick actions
    let quickActions = data.quickActions;
    if (quickActions !== undefined) {
      quickActions = quickActions.map(qa => ({
        ...qa,
        id: qa.id || generateId(),
      }));
    }

    // Build update data
    const updateData: any = {
      updatedAt: now,
      updatedBy: user.uid,
    };

    if (data.defaultView !== undefined) updateData.defaultView = data.defaultView;
    if (data.showInjectionHistory !== undefined) updateData.showInjectionHistory = data.showInjectionHistory;
    if (data.showProductSuggestions !== undefined) updateData.showProductSuggestions = data.showProductSuggestions;
    if (data.autoSaveInterval !== undefined) updateData.autoSaveInterval = data.autoSaveInterval;
    if (data.zoneConfigs !== undefined) updateData.zoneConfigs = data.zoneConfigs;
    if (data.defaultMeasurement !== undefined) updateData.defaultMeasurement = data.defaultMeasurement;
    if (quickActions !== undefined) updateData.quickActions = quickActions;

    // Upsert settings
    const settings = await prisma.chartingSettings.upsert({
      where: {
        providerId_locationId: {
          providerId: providerId || null as any,
          locationId: locationId || null as any,
        },
      },
      update: updateData,
      create: {
        id: generateId(),
        providerId,
        locationId,
        defaultView: data.defaultView || 'face-2d',
        showInjectionHistory: data.showInjectionHistory ?? true,
        showProductSuggestions: data.showProductSuggestions ?? true,
        autoSaveInterval: data.autoSaveInterval || 30,
        zoneConfigs: (data.zoneConfigs || createDefaultZoneConfigs()) as any,
        defaultMeasurement: data.defaultMeasurement || 'units',
        quickActions: (quickActions || createDefaultQuickActions()) as any,
        updatedAt: now,
        updatedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'charting_settings',
      resourceId: settings.id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data), providerId, locationId },
    });

    return c.json({
      settings: {
        ...settings,
        updatedAt: settings.updatedAt.toISOString(),
      },
      message: 'Charting settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating charting settings:', error);
    throw error;
  }
});

/**
 * Get face zone configurations
 * GET /api/charting-settings/zones
 */
chartingSettings.get('/zones', zValidator('query', getSettingsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const providerId = query.providerId || user.uid;
  const locationId = query.locationId;

  try {
    // Find settings (same logic as main GET)
    let settings;

    if (providerId && locationId) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId,
            locationId,
          },
        },
      });
    }
    if (!settings && providerId) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId,
            locationId: null as any,
          },
        },
      });
    }
    if (!settings && locationId) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId: null as any,
            locationId,
          },
        },
      });
    }
    if (!settings) {
      settings = await prisma.chartingSettings.findUnique({
        where: {
          providerId_locationId: {
            providerId: null as any,
            locationId: null as any,
          },
        },
      });
    }

    // Return default zone configs if no settings found
    const zoneConfigs = (settings?.zoneConfigs as unknown as ZoneConfig[]) || createDefaultZoneConfigs();

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'zone_configs',
      ipAddress,
      metadata: { providerId, locationId },
    });

    // Group by region
    const byRegion: Record<string, ZoneConfig[]> = {};
    for (const zone of zoneConfigs) {
      const faceZone = FACE_ZONES.find(fz => fz.id === zone.zoneId);
      const region = faceZone?.region || 'other';
      if (!byRegion[region]) {
        byRegion[region] = [];
      }
      byRegion[region].push(zone);
    }

    return c.json({
      zoneConfigs,
      byRegion,
      total: zoneConfigs.length,
      enabledCount: zoneConfigs.filter(z => z.isEnabled).length,
    });
  } catch (error) {
    console.error('Error fetching zone configs:', error);
    throw error;
  }
});

/**
 * Update zone configurations
 * PUT /api/charting-settings/zones
 */
chartingSettings.put('/zones', zValidator('json', updateZoneConfigsSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Get providerId from query or use current user
  const url = new URL(c.req.url);
  const providerId = url.searchParams.get('providerId') || user.uid;
  const locationId = url.searchParams.get('locationId') || undefined;

  try {
    const now = new Date();

    const settings = await prisma.chartingSettings.upsert({
      where: {
        providerId_locationId: {
          providerId: providerId || null as any,
          locationId: locationId || null as any,
        },
      },
      update: {
        zoneConfigs: data.zoneConfigs as any,
        updatedAt: now,
        updatedBy: user.uid,
      },
      create: {
        id: generateId(),
        providerId,
        locationId,
        defaultView: 'face-2d',
        showInjectionHistory: true,
        showProductSuggestions: true,
        autoSaveInterval: 30,
        zoneConfigs: data.zoneConfigs as any,
        defaultMeasurement: 'units',
        quickActions: createDefaultQuickActions() as any,
        updatedAt: now,
        updatedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'zone_configs',
      resourceId: settings.id,
      ipAddress,
      metadata: { providerId, locationId, zoneCount: data.zoneConfigs.length },
    });

    // Group by region for response
    const zoneConfigs = settings.zoneConfigs as unknown as ZoneConfig[];
    const byRegion: Record<string, ZoneConfig[]> = {};
    for (const zone of zoneConfigs) {
      const faceZone = FACE_ZONES.find(fz => fz.id === zone.zoneId);
      const region = faceZone?.region || 'other';
      if (!byRegion[region]) {
        byRegion[region] = [];
      }
      byRegion[region].push(zone);
    }

    return c.json({
      zoneConfigs,
      byRegion,
      total: zoneConfigs.length,
      enabledCount: zoneConfigs.filter(z => z.isEnabled).length,
      message: 'Zone configurations updated successfully',
    });
  } catch (error) {
    console.error('Error updating zone configs:', error);
    throw error;
  }
});

/**
 * Reset charting settings to defaults
 * POST /api/charting-settings/reset
 */
chartingSettings.post('/reset', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const url = new URL(c.req.url);
  const providerId = url.searchParams.get('providerId') || user.uid;
  const locationId = url.searchParams.get('locationId') || undefined;

  try {
    const now = new Date();

    // Create fresh default settings
    const settings = await prisma.chartingSettings.upsert({
      where: {
        providerId_locationId: {
          providerId: providerId || null as any,
          locationId: locationId || null as any,
        },
      },
      update: {
        defaultView: 'face-2d',
        showInjectionHistory: true,
        showProductSuggestions: true,
        autoSaveInterval: 30,
        zoneConfigs: createDefaultZoneConfigs() as any,
        defaultMeasurement: 'units',
        quickActions: createDefaultQuickActions() as any,
        updatedAt: now,
        updatedBy: user.uid,
      },
      create: {
        id: generateId(),
        providerId,
        locationId,
        defaultView: 'face-2d',
        showInjectionHistory: true,
        showProductSuggestions: true,
        autoSaveInterval: 30,
        zoneConfigs: createDefaultZoneConfigs() as any,
        defaultMeasurement: 'units',
        quickActions: createDefaultQuickActions() as any,
        updatedAt: now,
        updatedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'charting_settings',
      resourceId: settings.id,
      ipAddress,
      metadata: { action: 'reset', providerId, locationId },
    });

    return c.json({
      settings: {
        ...settings,
        updatedAt: settings.updatedAt.toISOString(),
      },
      message: 'Charting settings reset to defaults',
    });
  } catch (error) {
    console.error('Error resetting charting settings:', error);
    throw error;
  }
});

export default chartingSettings;
