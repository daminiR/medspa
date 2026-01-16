/**
 * Charting Settings API Routes
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
import { Prisma } from '@prisma/client';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError } from '../middleware/prisma-error-handler';
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

export interface StoredChartingSettings {
  id: string;
  providerId?: string;
  locationId?: string;

  // Display preferences
  defaultView: 'face-2d' | 'face-3d' | 'body';
  showInjectionHistory: boolean;
  showProductSuggestions: boolean;
  autoSaveInterval: number;

  // Zone configurations
  zoneConfigs: ZoneConfig[];

  // Unit/Volume defaults
  defaultMeasurement: 'units' | 'ml';

  // Quick actions
  quickActions: QuickAction[];

  // Audit
  updatedAt: Date;
  updatedBy: string;
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
    let settings = null;

    // 1. Provider + Location specific
    if (providerId && locationId) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId,
          locationId,
        },
      });
    }

    // 2. Provider specific
    if (!settings && providerId) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId,
          locationId: null,
        },
      });
    }

    // 3. Location specific
    if (!settings && locationId) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId: null,
          locationId,
        },
      });
    }

    // 4. Global defaults
    if (!settings) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId: null,
          locationId: null,
        },
      });
    }

    // 5. Create default if nothing exists
    if (!settings) {
      settings = await prisma.chartingSettings.create({
        data: {
          id: generateId(),
          providerId: providerId || null,
          locationId: locationId || null,
          defaultView: 'face-2d',
          showInjectionHistory: true,
          showProductSuggestions: true,
          autoSaveInterval: 30,
          zoneConfigs: createDefaultZoneConfigs() as unknown as Prisma.InputJsonValue,
          defaultMeasurement: 'units',
          quickActions: createDefaultQuickActions() as unknown as Prisma.InputJsonValue,
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
    handlePrismaError(error);
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
  const locationId = data.locationId || null;

  try {
    // Get existing or find default
    let settings = await prisma.chartingSettings.findFirst({
      where: {
        providerId: providerId || null,
        locationId: locationId || null,
      },
    });

    const now = new Date();

    // Assign IDs to new quick actions
    let quickActions = (settings?.quickActions as unknown as QuickAction[]) || createDefaultQuickActions();
    if (data.quickActions !== undefined) {
      quickActions = data.quickActions.map((qa: any) => ({
        ...qa,
        id: qa.id || generateId(),
      }));
    }

    // Prepare update data
    const updateData: any = {
      ...(data.defaultView !== undefined && { defaultView: data.defaultView }),
      ...(data.showInjectionHistory !== undefined && { showInjectionHistory: data.showInjectionHistory }),
      ...(data.showProductSuggestions !== undefined && { showProductSuggestions: data.showProductSuggestions }),
      ...(data.autoSaveInterval !== undefined && { autoSaveInterval: data.autoSaveInterval }),
      ...(data.zoneConfigs !== undefined && { zoneConfigs: data.zoneConfigs as unknown as Prisma.InputJsonValue }),
      ...(data.defaultMeasurement !== undefined && { defaultMeasurement: data.defaultMeasurement }),
      quickActions: quickActions as unknown as Prisma.InputJsonValue,
      updatedAt: now,
      updatedBy: user.uid,
    };

    let updatedSettings;

    if (settings) {
      // Update existing
      updatedSettings = await prisma.chartingSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      // Create new
      updatedSettings = await prisma.chartingSettings.create({
        data: {
          id: generateId(),
          providerId: providerId || null,
          locationId: locationId || null,
          defaultView: data.defaultView || 'face-2d',
          showInjectionHistory: data.showInjectionHistory ?? true,
          showProductSuggestions: data.showProductSuggestions ?? true,
          autoSaveInterval: data.autoSaveInterval || 30,
          zoneConfigs: (data.zoneConfigs || createDefaultZoneConfigs()) as unknown as Prisma.InputJsonValue,
          defaultMeasurement: data.defaultMeasurement || 'units',
          quickActions: quickActions as unknown as Prisma.InputJsonValue,
          updatedAt: now,
          updatedBy: user.uid,
        },
      });
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'charting_settings',
      resourceId: updatedSettings.id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data), providerId, locationId },
    });

    return c.json({
      settings: {
        ...updatedSettings,
        updatedAt: updatedSettings.updatedAt.toISOString(),
      },
      message: 'Charting settings updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
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
    let settings = null;

    if (providerId && locationId) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId,
          locationId,
        },
      });
    }
    if (!settings && providerId) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId,
          locationId: null,
        },
      });
    }
    if (!settings && locationId) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId: null,
          locationId,
        },
      });
    }
    if (!settings) {
      settings = await prisma.chartingSettings.findFirst({
        where: {
          providerId: null,
          locationId: null,
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
    handlePrismaError(error);
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
  const locationId = url.searchParams.get('locationId') || null;

  try {
    // Get existing or find default
    let settings = await prisma.chartingSettings.findFirst({
      where: {
        providerId: providerId || null,
        locationId: locationId || null,
      },
    });

    const now = new Date();

    let updatedSettings;

    if (settings) {
      // Update existing
      updatedSettings = await prisma.chartingSettings.update({
        where: { id: settings.id },
        data: {
          zoneConfigs: data.zoneConfigs as unknown as Prisma.InputJsonValue,
          updatedAt: now,
          updatedBy: user.uid,
        },
      });
    } else {
      // Create new
      updatedSettings = await prisma.chartingSettings.create({
        data: {
          id: generateId(),
          providerId: providerId || null,
          locationId: locationId || null,
          defaultView: 'face-2d',
          showInjectionHistory: true,
          showProductSuggestions: true,
          autoSaveInterval: 30,
          zoneConfigs: data.zoneConfigs as unknown as Prisma.InputJsonValue,
          defaultMeasurement: 'units',
          quickActions: createDefaultQuickActions() as unknown as Prisma.InputJsonValue,
          updatedAt: now,
          updatedBy: user.uid,
        },
      });
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'zone_configs',
      resourceId: updatedSettings.id,
      ipAddress,
      metadata: { providerId, locationId, zoneCount: data.zoneConfigs.length },
    });

    const zoneConfigs = updatedSettings.zoneConfigs as unknown as ZoneConfig[];

    // Group by region for response
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
    handlePrismaError(error);
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
  const locationId = url.searchParams.get('locationId') || null;

  try {
    // Find existing settings
    const existing = await prisma.chartingSettings.findFirst({
      where: {
        providerId: providerId || null,
        locationId: locationId || null,
      },
    });

    const now = new Date();

    // Create fresh default settings
    let settings;

    if (existing) {
      // Update existing with defaults
      settings = await prisma.chartingSettings.update({
        where: { id: existing.id },
        data: {
          defaultView: 'face-2d',
          showInjectionHistory: true,
          showProductSuggestions: true,
          autoSaveInterval: 30,
          zoneConfigs: createDefaultZoneConfigs() as unknown as Prisma.InputJsonValue,
          defaultMeasurement: 'units',
          quickActions: createDefaultQuickActions() as unknown as Prisma.InputJsonValue,
          updatedAt: now,
          updatedBy: user.uid,
        },
      });
    } else {
      // Create new with defaults
      settings = await prisma.chartingSettings.create({
        data: {
          id: generateId(),
          providerId: providerId || null,
          locationId: locationId || null,
          defaultView: 'face-2d',
          showInjectionHistory: true,
          showProductSuggestions: true,
          autoSaveInterval: 30,
          zoneConfigs: createDefaultZoneConfigs() as unknown as Prisma.InputJsonValue,
          defaultMeasurement: 'units',
          quickActions: createDefaultQuickActions() as unknown as Prisma.InputJsonValue,
          updatedAt: now,
          updatedBy: user.uid,
        },
      });
    }

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
    handlePrismaError(error);
  }
});

export default chartingSettings;
