// Inventory Alerts API - Manage inventory alerts
// GET: List active alerts
// PUT: Acknowledge or resolve alerts

import { NextRequest, NextResponse } from 'next/server';
import { inventoryAlerts, generateInventoryAlerts } from '@/lib/data/inventory';
import { AlertStatus, AlertSeverity, AlertType } from '@/types/inventory';

// GET /api/inventory/alerts - List alerts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AlertStatus | null;
    const severity = searchParams.get('severity') as AlertSeverity | null;
    const type = searchParams.get('type') as AlertType | null;
    const locationId = searchParams.get('locationId');
    const productId = searchParams.get('productId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    // Regenerate alerts to ensure they're current
    const freshAlerts = generateInventoryAlerts();

    // Merge with existing alerts (preserve acknowledgements)
    const existingAlertIds = new Set(inventoryAlerts.map(a => a.id));
    freshAlerts.forEach(alert => {
      if (!existingAlertIds.has(alert.id)) {
        inventoryAlerts.push(alert);
      }
    });

    let filteredAlerts = [...inventoryAlerts];

    // Apply filters
    if (activeOnly) {
      filteredAlerts = filteredAlerts.filter(a => a.status === 'active');
    } else if (status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === status);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
    }

    if (type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === type);
    }

    if (locationId) {
      filteredAlerts = filteredAlerts.filter(a => a.locationId === locationId);
    }

    if (productId) {
      filteredAlerts = filteredAlerts.filter(a => a.productId === productId);
    }

    // Sort by severity (critical first) then by creation date
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    filteredAlerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Summary
    const summary = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      warning: filteredAlerts.filter(a => a.severity === 'warning').length,
      info: filteredAlerts.filter(a => a.severity === 'info').length,
      byType: {
        low_stock: filteredAlerts.filter(a => a.type === 'low_stock').length,
        out_of_stock: filteredAlerts.filter(a => a.type === 'out_of_stock').length,
        expiring_soon: filteredAlerts.filter(a => a.type === 'expiring_soon').length,
        expired: filteredAlerts.filter(a => a.type === 'expired').length,
        recall: filteredAlerts.filter(a => a.type === 'recall').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts: filteredAlerts,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/alerts - Update alert status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, action, userId, userName, resolution } = body;

    if (!alertId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: alertId, action' },
        { status: 400 }
      );
    }

    const alertIndex = inventoryAlerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Alert not found: ${alertId}` },
        { status: 404 }
      );
    }

    const alert = inventoryAlerts[alertIndex];

    switch (action) {
      case 'acknowledge':
        alert.status = 'acknowledged';
        alert.acknowledgedBy = userId || 'unknown';
        alert.acknowledgedAt = new Date();
        break;

      case 'resolve':
        alert.status = 'resolved';
        alert.resolvedBy = userId || 'unknown';
        alert.resolvedAt = new Date();
        alert.resolution = resolution || 'Resolved';
        break;

      case 'dismiss':
        alert.status = 'dismissed';
        alert.resolvedBy = userId || 'unknown';
        alert.resolvedAt = new Date();
        alert.resolution = resolution || 'Dismissed by user';
        break;

      case 'reactivate':
        alert.status = 'active';
        alert.acknowledgedBy = undefined;
        alert.acknowledgedAt = undefined;
        alert.resolvedBy = undefined;
        alert.resolvedAt = undefined;
        alert.resolution = undefined;
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Invalid action: ${action}. Valid actions: acknowledge, resolve, dismiss, reactivate` },
          { status: 400 }
        );
    }

    alert.updatedAt = new Date();

    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/alerts - Create manual alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      severity,
      productId,
      productName,
      lotId,
      lotNumber,
      locationId,
      locationName,
      title,
      message,
      actionRequired,
      createdBy,
    } = body;

    if (!type || !severity || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, severity, title, message' },
        { status: 400 }
      );
    }

    const alertId = `alert-manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert = {
      id: alertId,
      type,
      severity,
      status: 'active' as AlertStatus,
      productId,
      productName,
      lotId,
      lotNumber,
      locationId: locationId || 'loc-1',
      locationName: locationName || 'The Village',
      title,
      message,
      actionRequired,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inventoryAlerts.push(newAlert);

    return NextResponse.json({
      success: true,
      data: newAlert,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
