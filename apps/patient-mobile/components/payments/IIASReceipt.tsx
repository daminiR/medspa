import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IIASReceiptProps {
  data: {
    receiptNumber: string;
    providerName: string;
    providerTaxId: string;
    providerAddress: string;
    providerPhone: string;
    providerLicense: string;
    patientName: string;
    serviceDate: string;
    services: Array<{
      name: string;
      description: string;
      amount: number;
      hsaFsaEligible: boolean;
    }>;
    subtotal: number;
    tax: number;
    totalAmount: number;
    hsaFsaEligibleAmount: number;
    paymentMethod: string;
    paymentDate: string;
    transactionId: string;
  };
}

/**
 * IIAS-Compliant Receipt Component
 * 
 * IIAS (Inventory Information Approval System) Requirements:
 * - Service provider name, tax ID, address
 * - Date of service
 * - Description of medical services
 * - Itemized charges
 * - HSA/FSA eligible amount
 * - Provider credentials
 * - IIAS-90 substantiation statement
 */
export default function IIASReceipt({ data }: IIASReceiptProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.receipt}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.headerTitle}>Medical Services Receipt</Text>
          <Text style={styles.headerSubtitle}>IIAS-Compliant</Text>
          <View style={styles.hsaBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.hsaBadgeText}>HSA/FSA Eligible</Text>
          </View>
        </View>

        {/* Receipt Number */}
        <View style={styles.receiptNumber}>
          <Text style={styles.receiptNumberLabel}>Receipt #</Text>
          <Text style={styles.receiptNumberValue}>{data.receiptNumber}</Text>
        </View>

        {/* Provider Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Provider</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Name:</Text>
            <Text style={styles.infoValue}>{data.providerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tax ID (EIN):</Text>
            <Text style={styles.infoValue}>{data.providerTaxId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>License #:</Text>
            <Text style={styles.infoValue}>{data.providerLicense}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{data.providerAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{data.providerPhone}</Text>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{data.patientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Service:</Text>
            <Text style={styles.infoValue}>{data.serviceDate}</Text>
          </View>
        </View>

        {/* Services Rendered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Services Rendered</Text>
          {data.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{service.name}</Text>
                {service.hsaFsaEligible && (
                  <View style={styles.eligibleBadge}>
                    <Text style={styles.eligibleBadgeText}>Eligible</Text>
                  </View>
                )}
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <Text style={styles.serviceAmount}>${service.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${data.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>${data.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryLabelTotal}>Total Amount:</Text>
            <Text style={styles.summaryValueTotal}>${data.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.hsaSummary}>
            <Ionicons name="medical" size={20} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.hsaSummaryLabel}>HSA/FSA Eligible Amount:</Text>
              <Text style={styles.hsaSummaryValue}>${data.hsaFsaEligibleAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>{data.paymentMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Date:</Text>
            <Text style={styles.infoValue}>{data.paymentDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID:</Text>
            <Text style={styles.infoValue}>{data.transactionId}</Text>
          </View>
        </View>

        {/* IIAS-90 Substantiation Statement */}
        <View style={styles.statementBox}>
          <Text style={styles.statementTitle}>IIAS-90 Substantiation Statement</Text>
          <Text style={styles.statementText}>
            This receipt substantiates that the services provided are qualified medical expenses under
            IRS Publication 502 and are eligible for payment using Health Savings Account (HSA) or
            Flexible Spending Account (FSA) funds. The services were provided by a licensed medical
            professional and meet the requirements for HSA/FSA reimbursement.
          </Text>
          <Text style={styles.statementText} style={{ marginTop: 12 }}>
            This receipt contains all required information under the Inventory Information Approval
            System (IIAS) standards for substantiation of medical expenses. Retain this receipt for
            your tax records.
          </Text>
        </View>

        {/* Provider Signature */}
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Authorized Provider Signature</Text>
          <Text style={styles.signatureDate}>Date: {data.serviceDate}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For questions regarding this receipt, please contact {data.providerPhone}
          </Text>
          <Text style={styles.footerText} style={{ marginTop: 8 }}>
            This is an official medical receipt. Please retain for your records.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  receipt: { padding: 24 },
  header: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 2, borderBottomColor: '#E5E7EB' },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  hsaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  hsaBadgeText: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  receiptNumber: { paddingVertical: 16, alignItems: 'center', backgroundColor: '#F9FAFB', marginVertical: 16, borderRadius: 12 },
  receiptNumberLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  receiptNumberValue: { fontSize: 18, fontWeight: '700', color: '#1F2937', fontFamily: 'monospace' },
  section: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', paddingVertical: 6 },
  infoLabel: { width: 120, fontSize: 14, fontWeight: '600', color: '#6B7280' },
  infoValue: { flex: 1, fontSize: 14, color: '#1F2937' },
  serviceItem: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  eligibleBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  eligibleBadgeText: { fontSize: 11, fontWeight: '600', color: '#10B981' },
  serviceDescription: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  serviceAmount: { fontSize: 15, fontWeight: '700', color: '#8B5CF6', textAlign: 'right' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginTop: 8, borderTopWidth: 2, borderTopColor: '#E5E7EB' },
  summaryLabelTotal: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  summaryValueTotal: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  hsaSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, marginTop: 16 },
  hsaSummaryLabel: { fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  hsaSummaryValue: { fontSize: 20, fontWeight: '700', color: '#10B981' },
  statementBox: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, marginVertical: 16, borderWidth: 1, borderColor: '#FDE68A' },
  statementTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', marginBottom: 8 },
  statementText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  signatureBox: { paddingVertical: 24 },
  signatureLine: { height: 1, backgroundColor: '#D1D5DB', marginBottom: 8 },
  signatureLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  signatureDate: { fontSize: 12, color: '#9CA3AF' },
  footer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerText: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
});
