# HSA/FSA Payment Support - Implementation Guide

## Overview

This implementation adds comprehensive HSA/FSA payment support to the patient mobile app, providing a competitive advantage as identified in research showing that 37% of Americans have HSA/FSA accounts, yet only Zenoti and Tebra do this well.

## Key Features

### 1. Payment Methods Management
- **Location**: `/app/payments/PaymentMethods.tsx`
- Add, view, and manage multiple payment methods
- Toggle HSA/FSA designation for cards
- Set default payment method
- Delete payment methods
- Visual HSA/FSA badges for eligible cards
- Secure Stripe integration

### 2. Add Payment Method Screen
- **Location**: `/app/payments/AddPaymentMethod.tsx`
- Stripe Elements-style card input
- Real-time card number formatting
- Expiry date and CVV validation
- ZIP code collection for billing
- HSA/FSA card designation checkbox
- Visual card preview with gradient
- PCI-compliant card handling

### 3. Stripe Payment Service
- **Location**: `/services/payments/stripe.ts`
- MCC 8099 (Medical Services) for HSA/FSA eligibility
- Payment method creation and management
- Payment processing with HSA/FSA support
- IIAS-compliant receipt generation
- HSA/FSA card validation
- Automatic tax savings calculation

### 4. IIAS-Compliant Receipt Template
- **Location**: `/components/payments/IIASReceipt.tsx`
- Service provider information (name, tax ID, address, license)
- Date of service documentation
- Itemized medical services with descriptions
- HSA/FSA eligible amount highlighting
- Financial summary with tax information
- IIAS-90 substantiation statement
- Provider signature section
- Complies with IRS Publication 502 requirements

### 5. HSA/FSA Badge Component
- **Location**: `/components/payments/HsaFsaBadge.tsx`
- Visual indicator for HSA/FSA eligible amounts
- Interactive info modal explaining benefits
- Tax savings calculator (assumes 25% tax bracket)
- Educational content about HSA/FSA advantages
- Automatic IIAS receipt information

## Technical Implementation

### Stripe Configuration

The implementation uses MCC 8099 (Medical Services and Health Practitioners, Not Elsewhere Classified) which is critical for HSA/FSA card acceptance:

```typescript
const MEDICAL_MCC_CODE = '8099';

// This is set in payment metadata
mccCode: MEDICAL_MCC_CODE,
metadata: {
  service_type: 'medical_spa',
  hsa_fsa_eligible: true,
}
```

### Payment Flow

1. **Add Payment Method**:
   - User enters card details
   - Optional HSA/FSA designation
   - Creates Stripe PaymentMethod
   - Saves to backend with metadata

2. **Process Payment**:
   - Select payment method
   - Calculate HSA/FSA eligible amount
   - Process with MCC 8099
   - Generate IIAS receipt if HSA/FSA

3. **Receipt Generation**:
   - Automatic for HSA/FSA payments
   - Contains all required IIAS information
   - Available for download/email

### IIAS Compliance

The Inventory Information Approval System (IIAS) requires specific documentation:

**Required Information**:
- ✅ Service provider name and credentials
- ✅ Tax ID (EIN) and license number
- ✅ Provider address and contact information
- ✅ Date of service
- ✅ Detailed service descriptions
- ✅ Itemized charges
- ✅ HSA/FSA eligible amount
- ✅ IIAS-90 substantiation statement
- ✅ Provider signature section

**IRS Publication 502 Compliance**:
- Medical spa services are eligible when:
  - Performed by licensed medical professionals
  - Have therapeutic medical purpose
  - Documented as medical treatment
  - Properly substantiated

## Security Considerations

### PCI Compliance
- Card details never touch the backend directly
- Stripe SDK handles tokenization
- Payment methods stored securely by Stripe
- Only tokenized references stored in database

### Data Protection
- All payment data encrypted in transit (TLS)
- Secure storage using Stripe's infrastructure
- No raw card numbers stored locally
- Expo SecureStore for sensitive tokens

## Integration with Existing Systems

### Profile Screen Integration
The payment methods screen is accessible from the profile screen:

```typescript
// In profile.tsx
{
  id: 'payment',
  icon: 'card-outline',
  label: 'Payment Methods',
  hasArrow: true,
  onPress: () => router.push('/payments/PaymentMethods'),
}
```

### Type System Integration
Uses shared types from `@medical-spa/types`:
- `PaymentMethod`
- `Payment`
- `AddPaymentMethodRequest`
- `Invoice`
- `InvoiceItem`
- `HsaFsaAccount`

## Installation

### Dependencies
```bash
npm install @stripe/stripe-react-native
```

### Environment Variables
Add to `.env`:
```
EXPO_PUBLIC_STRIPE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=https://api.example.com
```

## Usage Examples

### Display HSA/FSA Badge
```tsx
import HsaFsaBadge from '@/components/payments/HsaFsaBadge';

<HsaFsaBadge
  eligibleAmount={450.00}
  totalAmount={500.00}
  showSavings={true}
  size="medium"
/>
```

### Process HSA/FSA Payment
```typescript
import { paymentService } from '@/services/payments/stripe';

const payment = await paymentService.processPayment({
  appointmentId: 'apt_123',
  amount: 450.00,
  paymentMethodId: 'pm_123',
  isHsaFsa: true,
  hsaFsaEligibleAmount: 450.00,
});

// Receipt automatically generated for HSA/FSA
const receiptUrl = payment.receiptUrl;
```

### Display IIAS Receipt
```tsx
import IIASReceipt from '@/components/payments/IIASReceipt';

<IIASReceipt
  data={{
    receiptNumber: 'RCP-2024-001',
    providerName: 'Luxury MedSpa',
    providerTaxId: '12-3456789',
    // ... other required fields
  }}
/>
```

## Backend Requirements

The backend API should implement the following endpoints:

### Payment Methods
- `GET /payments/methods` - List payment methods
- `POST /payments/methods` - Add payment method
- `PUT /payments/methods/:id/default` - Set default
- `PATCH /payments/methods/:id` - Update (HSA/FSA toggle)
- `DELETE /payments/methods/:id` - Remove payment method

### Payments
- `POST /payments/process` - Process payment
- `GET /payments` - Payment history
- `POST /payments/:id/receipt/iias` - Generate IIAS receipt
- `GET /payments/:id/receipt/iias` - Get IIAS receipt

### Stripe Integration
- `POST /payments/stripe/create-payment-method` - Create Stripe PM
- `POST /payments/methods/:id/validate-hsa-fsa` - Validate HSA/FSA

### Required Backend Configuration
1. Stripe account with medical services MCC
2. Business registered as medical service provider
3. Proper tax ID and licensing documentation
4. IIAS receipt template generation
5. Secure payment method storage

## Competitive Advantage

### Market Gap
- **37% of Americans** have HSA/FSA accounts
- Most competitors don't support HSA/FSA cards
- Only **Zenoti and Tebra** do this well

### Benefits for Patients
- **Tax savings**: 25-30% through pre-tax contributions
- **No reimbursement**: Direct card payment
- **Automatic receipts**: IIAS-compliant documentation
- **Transparent**: See eligible amounts upfront

### Benefits for Business
- **Increased conversion**: Remove payment friction
- **Higher average ticket**: Patients more likely to book
- **Competitive differentiator**: Unique in medical spa market
- **Better patient experience**: Modern payment options

## Testing Checklist

### Payment Methods Screen
- [ ] Can view all payment methods
- [ ] Can add new payment method
- [ ] Can set default payment method
- [ ] Can toggle HSA/FSA designation
- [ ] Can delete payment method
- [ ] Empty state displays correctly
- [ ] Loading states work properly
- [ ] Error handling displays alerts

### Add Payment Method Screen
- [ ] Card number formatting works
- [ ] Expiry date validation works
- [ ] CVV validation works
- [ ] ZIP code validation works
- [ ] HSA/FSA checkbox toggles
- [ ] Card preview updates in real-time
- [ ] Submit creates payment method
- [ ] Error messages display correctly

### Payment Processing
- [ ] Regular card payments work
- [ ] HSA/FSA payments work
- [ ] MCC 8099 is set correctly
- [ ] Receipt generation triggered
- [ ] Payment history displays

### IIAS Receipt
- [ ] All required fields display
- [ ] HSA/FSA eligible amount highlighted
- [ ] Substantiation statement included
- [ ] Provider information complete
- [ ] Can export/share receipt

## Stripe Test Cards

For testing HSA/FSA functionality:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
ZIP: Any 5 digits
```

## Future Enhancements

1. **FSA Spending Tracking**
   - Track FSA spending throughout the year
   - Remind patients of unused FSA funds
   - Year-end FSA spending notifications

2. **Insurance Integration**
   - Direct insurance claim submission
   - Pre-authorization for procedures
   - Insurance verification

3. **Payment Plans**
   - Split payments between HSA/FSA and credit card
   - Installment payment options
   - Subscription-based memberships

4. **Advanced Receipt Features**
   - Email receipt delivery
   - PDF generation
   - Receipt storage in app
   - Export to accounting software

5. **Enhanced Validation**
   - Real-time HSA/FSA balance checking
   - Automatic eligibility verification
   - Service-level HSA/FSA eligibility tracking

## Support and Documentation

### Stripe Documentation
- [Stripe React Native SDK](https://stripe.com/docs/stripe-react-native)
- [Payment Methods API](https://stripe.com/docs/payments/payment-methods)
- [MCC Codes](https://stripe.com/docs/connect/setting-mcc)

### HSA/FSA Resources
- [IRS Publication 502](https://www.irs.gov/forms-pubs/about-publication-502)
- [IIAS Standards](https://www.sig.org/iias)
- [FSA Eligibility List](https://fsastore.com/learn-eligibility-list.html)

### Medical Spa Compliance
- State medical board requirements
- Professional licensing
- Healthcare provider registration

## Troubleshooting

### Common Issues

**Card Declined**:
- Verify MCC 8099 is set correctly
- Ensure HSA/FSA provider allows medical spa
- Check card has sufficient balance

**Receipt Generation Fails**:
- Verify all required provider information
- Check tax ID is valid
- Ensure service descriptions are detailed

**Payment Method Won't Save**:
- Check Stripe API keys are correct
- Verify network connectivity
- Review backend logs for errors

## License and Compliance

This implementation is designed for:
- HIPAA-compliant environments
- PCI DSS Level 1 compliance (via Stripe)
- IRS Publication 502 requirements
- IIAS-90 standards

**Important**: Consult with legal and compliance teams before deploying to production.

---

**Implementation Date**: December 2024  
**Version**: 1.0.0  
**Maintained By**: Medical Spa Platform Team
