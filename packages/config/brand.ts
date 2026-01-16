/**
 * Brand Configuration
 *
 * Central place to manage brand names across the entire platform.
 * Change these values to update the branding everywhere.
 */

export const BRAND = {
  // Full product name
  name: 'Luxe Medical Spa EMR',

  // Short name for casual use
  shortName: 'Luxe Med Spa',

  // Platform reference (for documentation/comparisons)
  platformName: 'Luxe Platform',

  // Company/clinic name for demos
  demoClinicName: 'Luxe Medical Spa',

  // Demo clinic details
  demoClinic: {
    name: 'Luxe Medical Spa',
    address: '123 Main Street, Suite 100',
    phone: '(555) 100-0000',
    cancellationPolicy: 'We require 24 hours notice for cancellations. Late cancellations or no-shows may be charged a fee.',
  },

  // For booking URLs
  urlSlug: 'luxe',
} as const;

// Type export for TypeScript
export type Brand = typeof BRAND;
