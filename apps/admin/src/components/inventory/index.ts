// Inventory Components - Export all inventory management components
//
// Key Features (Research-backed differentiators):
// - Fractional unit tracking (competitors can't do half syringes)
// - Multi-patient vial tracking with stability timers
// - Provider accountability and usage analytics
// - Manufacturer loyalty integration (Allē, ASPIRE)

export { InventoryManager } from './InventoryManager';
export { BarcodeScanner } from './BarcodeScanner';
export { ReceiveInventoryModal } from './ReceiveInventoryModal';
export { LotSelector } from './LotSelector';
export { OpenVialsPanel } from './OpenVialsPanel';
export { ProviderAnalytics } from './ProviderAnalytics';
export { RecordUsageModal } from './RecordUsageModal';

// Types
export type { ParsedBarcode } from './BarcodeScanner';
