# Inventory Management - Prisma Schema Summary

## Overview

This Prisma schema provides comprehensive models for medical spa inventory management with FDA-compliant lot tracking, multi-patient vial sessions, waste tracking, and complete purchase order workflows.

## Core Models

### 1. Product Management

**Product**
- Complete product catalog with injectable-specific fields
- Categories: neurotoxin, filler, skincare, device, consumable, supplement, other
- Pricing: cost, retail, markup, commission rates
- Injectable details: concentration, dilution ratios, reconstitution requirements
- Storage requirements: temperature, refrigeration, light sensitivity (FDA compliance)
- Inventory thresholds: reorder points, min/max levels, lead times
- Tracking flags: lot tracking, serial tracking, expiration requirements
- Status management: active, discontinued, out_of_stock, pending_approval

**ProductCategory**
- Hierarchical product categorization
- Display names and descriptions

### 2. Inventory Lot Tracking

**InventoryLot**
- Lot number tracking with batch/serial number support
- Expiration date monitoring with alerts
- Manufacturing date tracking
- Quantity management: initial, current, reserved
- Location and storage location tracking
- Purchase order linkage
- Vendor information
- Reconstitution tracking for neurotoxins
- Recall status with FDA recall class support (I, II, III)
- Quarantine workflow
- Status: available, quarantine, expired, recalled, depleted, damaged

**LotUsage**
- Patient-level usage tracking
- Treatment area documentation
- Practitioner and appointment linkage
- Clinical chart integration
- Fractional unit support (e.g., 12.5 units)

### 3. Open Vial Sessions (KEY DIFFERENTIATOR)

**OpenVialSession**
- Multi-patient vial tracking
- Real-time stability monitoring
- Reconstitution details with expiration timers
- Usage records per patient
- Waste tracking per vial
- Cost analysis: cost per unit, revenue generated, profit margin
- Supports fractional units (12.5 units precision)
- Status: active, expired, depleted, discarded
- Closed reason tracking: depleted, expired, stability_exceeded, contamination, manual_close

### 4. Inventory Transactions & Adjustments

**InventoryTransaction**
- Complete transaction history
- Transaction types:
  - receive: Incoming inventory
  - adjustment_add/adjustment_remove: Manual adjustments
  - treatment_use: Clinical usage
  - transfer_out/transfer_in: Inter-location transfers
  - waste: Waste recording
  - damage, expiration, recall: Loss tracking
- Quantity before/after tracking
- Cost analysis per transaction
- Patient, practitioner, appointment linkage
- Treatment details (service, areas injected, chart ID)
- Approval workflow support
- Status: pending, completed, cancelled, reversed

**WasteRecord**
- Detailed waste tracking with categorized reasons:
  - expired_unused
  - stability_exceeded
  - contamination
  - draw_up_loss
  - patient_no_show
  - adverse_reaction_discard
  - training
  - damaged
  - recall
- Cost impact calculation
- Practitioner and appointment linkage
- Open vial session integration

### 5. Inventory Transfers

**InventoryTransfer**
- Inter-location transfer workflow
- Status progression: draft → requested → approved → in_transit → received
- Transfer items with quantity tracking
- Shipping information (carrier, tracking number)
- Approval workflow
- Partial receiving support
- Automatic transaction creation

**TransferItem**
- Product and lot tracking
- Requested, approved, shipped, received quantities
- Cost tracking per item

### 6. Physical Inventory Counts

**InventoryCount**
- Count types: full, cycle, spot, category
- Status workflow: draft → in_progress → completed → approved → posted
- Scheduled and actual date tracking
- Variance calculation and reporting
- Cost impact of variances
- Approval workflow

**CountItem**
- System vs. counted quantity comparison
- Variance calculation (units and percentage)
- Cost impact per item
- Automatic adjustment transaction creation on posting

### 7. Inventory Alerts

**InventoryAlert**
- Alert types:
  - low_stock, out_of_stock
  - expiring_soon, expired
  - recall
  - temperature_excursion
  - variance_detected
  - reorder_recommended
- Severity levels: info, warning, critical
- Status: active, acknowledged, resolved, dismissed
- Acknowledgment and resolution tracking
- Notification tracking

### 8. Vendors

**Vendor**
- Complete vendor information
- Contact details and address
- Account information (account number, payment terms, tax ID)
- Performance metrics: on-time delivery rate, quality rating
- Average lead time tracking
- Preferred vendor status
- Category specialization

### 9. Purchase Orders

**PurchaseOrder**
- Complete PO workflow: draft → submitted → confirmed → shipped → partial_received → received
- Vendor and location linkage
- Expected and actual delivery dates
- Shipping information (tracking number, carrier)
- Pricing: subtotal, tax, shipping, discount, total
- Payment status and terms
- Internal and vendor notes
- Approval workflow
- Cancellation support

**PurchaseOrderItem**
- Product tracking with SKU
- Quantity ordered, received, pending
- Unit cost and pricing
- Discount support (percentage or fixed)
- Received lots tracking
- Automatic lot creation on receiving

**ReceivingRecord**
- Complete receiving history
- Received quantities per item
- Lot information per receiving
- Timestamp and user tracking
- Notes support

## Key Features

### 1. FEFO (First Expire First Out) Support
- Lots indexed by expiration date
- Automatic lot selection based on expiration
- Real-time expiration monitoring

### 2. Multi-Patient Vial Tracking
- OpenVialSession model tracks usage across multiple patients
- Fractional unit support (e.g., 12.5 units)
- Stability monitoring with time remaining calculation
- Waste tracking per vial
- Cost and profit analysis per vial

### 3. FDA Compliance
- Lot tracking with batch/serial numbers
- Expiration date enforcement
- Recall workflow with FDA recall class (I, II, III)
- Storage requirement documentation
- Complete audit trail
- Quarantine support

### 4. Complete Audit Trail
- All models include createdAt, updatedAt timestamps
- User tracking: createdBy, lastUpdatedBy
- Transaction history for all inventory movements
- Approval tracking where applicable

### 5. Waste Management
- Categorized waste reasons
- Cost impact calculation
- Practitioner tracking
- Open vial session integration
- Patient no-show tracking

### 6. Transfer Workflow
- Multi-step approval process
- Partial receiving support
- Automatic lot creation at destination
- Transaction creation at both locations

### 7. Physical Count Support
- Multiple count types (full, cycle, spot, category)
- Variance tracking and reporting
- Approval workflow
- Automatic adjustment posting

## Indexes

All critical fields are indexed for performance:
- Product: sku, category, brand, status, isActive
- InventoryLot: productId, lotNumber, expirationDate, status, locationId
- InventoryTransaction: productId, lotId, type, timestamp, locationId, patientId, practitionerId
- InventoryAlert: type, severity, status, locationId, productId
- PurchaseOrder: orderNumber, vendorId, status, orderDate, locationId

## Relationships

- Products → InventoryLots (1:many)
- Products → PurchaseOrderItems (1:many)
- Products → OpenVialSessions (1:many)
- InventoryLots → LotUsages (1:many)
- InventoryLots → OpenVialSessions (1:many)
- InventoryLots → InventoryTransactions (1:many)
- OpenVialSessions → LotUsages (1:many)
- Vendors → PurchaseOrders (1:many)
- Vendors → InventoryLots (1:many)
- PurchaseOrders → PurchaseOrderItems (1:many)
- PurchaseOrders → InventoryLots (1:many)
- PurchaseOrders → ReceivingRecords (1:many)
- InventoryTransfers → TransferItems (1:many)
- InventoryTransfers → InventoryTransactions (1:many)
- InventoryCounts → CountItems (1:many)

## JSON Fields

Several models use JSON for flexibility:

1. **Product.injectableDetails**: Injectable-specific fields
2. **Product.storageRequirements**: FDA storage compliance
3. **InventoryLot.reconstitutionDetails**: Reconstitution tracking
4. **InventoryLot.recallStatus**: FDA recall information
5. **LotUsage.areasInjected**: Treatment areas
6. **InventoryTransaction.treatmentDetails**: Clinical details
7. **Vendor.address**: Vendor address
8. **PurchaseOrderItem.receivedLots**: Receiving history
9. **ReceivingRecord.items**: Received items and lots

## Database Recommendations

- **PostgreSQL**: Recommended for JSON support, performance, and enterprise features
- **Indexes**: All critical query paths are indexed
- **Constraints**: Foreign keys enforce referential integrity
- **Soft Deletes**: Products support soft delete (deletedAt, deletedBy)
- **Audit Fields**: All models track creation and modification

## Migration Strategy

1. Run `npx prisma generate` to generate Prisma Client
2. Run `npx prisma migrate dev --name init` to create initial migration
3. Run `npx prisma db seed` to populate with initial data (if seed file exists)

## Next Steps

1. Create Prisma Client instance in `/lib/prisma.ts`
2. Replace in-memory stores in route files with Prisma queries
3. Implement seed data for development
4. Add database constraints and triggers as needed
5. Set up automated backups
6. Configure connection pooling for production

## Notes

- All decimal fields use Decimal type with appropriate precision
- All date fields use DateTime type
- Enum values match the route file type definitions
- Denormalized fields (productName, locationName, etc.) improve query performance
- JSON fields provide flexibility for evolving requirements
