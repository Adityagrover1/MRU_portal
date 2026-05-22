import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { DrugUsageLog } from '../../types/index';
import { calculateTimeAwareMRLStatus } from '../../lib/calculations/mrlCalculator';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
    borderBottom: '2px solid #16a34a',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    marginBottom: 3,
  },
  meta: {
    fontSize: 8,
    color: '#6b7280',
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 4,
    padding: 8,
  },
  summaryLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottom: '1px solid #e5e7eb',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colAnimal: { width: '12%' },
  colType: { width: '10%' },
  colDrug: { width: '16%' },
  colDose: { width: '10%' },
  colAdminDate: { width: '13%' },
  colSafeDate: { width: '13%' },
  colWithdrawal: { width: '10%' },
  colStatus: { width: '16%' },
  thText: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tdText: {
    color: '#374151',
    fontSize: 8,
  },
  statusSafe: { color: '#16a34a', fontFamily: 'Helvetica-Bold' },
  statusActive: { color: '#d97706', fontFamily: 'Helvetica-Bold' },
  statusExceeded: { color: '#dc2626', fontFamily: 'Helvetica-Bold' },
  footer: {
    marginTop: 16,
    paddingTop: 8,
    borderTop: '1px solid #e5e7eb',
    fontSize: 7,
    color: '#9ca3af',
  },
});

interface ReportRow {
  animalLabel: string;
  animalType: string;
  drugName: string;
  dose: string;
  adminDate: string;
  safeDate: string;
  withdrawalDays: number;
  statusLabel: string;
  statusType: 'safe' | 'active' | 'exceeded';
}

function buildRows(logs: DrugUsageLog[]): ReportRow[] {
  const now = new Date();
  return logs.map(log => {
    const result = calculateTimeAwareMRLStatus(
      log.drugs.name,
      log.animal_types.name,
      log.dose_amount,
      log.dose_unit,
      log.administration_date,
      now,
      'FSSAI'
    );

    const adminDate = new Date(log.administration_date);
    const safeDate = new Date(adminDate);
    safeDate.setDate(safeDate.getDate() + result.withdrawalPeriod);

    let statusLabel: string;
    let statusType: 'safe' | 'active' | 'exceeded';

    if (result.status === 'safe') {
      statusLabel = 'SAFE';
      statusType = 'safe';
    } else if (result.daysUntilSafe > 0) {
      statusLabel = `${result.daysUntilSafe}d remaining`;
      statusType = 'active';
    } else {
      statusLabel = 'EXCEEDED';
      statusType = 'exceeded';
    }

    return {
      animalLabel: log.animals?.tag_id ?? '—',
      animalType: log.animal_types.name,
      drugName: log.drugs.name,
      dose: `${log.dose_amount} ${log.dose_unit}`,
      adminDate: adminDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      safeDate: safeDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      withdrawalDays: result.withdrawalPeriod,
      statusLabel,
      statusType,
    };
  });
}

function SlaughterReportDoc({
  logs,
  userEmail,
}: {
  logs: DrugUsageLog[];
  userEmail: string;
}) {
  const now = new Date();
  const generated = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const rows = buildRows(logs);
  const safeCount = rows.filter(r => r.statusType === 'safe').length;
  const activeCount = rows.filter(r => r.statusType === 'active').length;
  const exceededCount = rows.filter(r => r.statusType === 'exceeded').length;

  return (
    <Document
      title="Slaughter Readiness Report"
      author="Farm MRL Portal"
      subject="FSSAI Drug Residue Compliance"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Slaughter Readiness Report</Text>
          <Text style={styles.meta}>
            Farm: {userEmail}    |    Generated: {generated}    |    Standard: FSSAI
          </Text>
        </View>

        {/* Summary boxes */}
        <Text style={styles.sectionLabel}>Summary</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }]}>
            <Text style={[styles.summaryLabel, { color: '#166534' }]}>Safe</Text>
            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>{safeCount}</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#fffbeb', border: '1px solid #fde68a' }]}>
            <Text style={[styles.summaryLabel, { color: '#92400e' }]}>Active Residues</Text>
            <Text style={[styles.summaryValue, { color: '#d97706' }]}>{activeCount}</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#fef2f2', border: '1px solid #fecaca' }]}>
            <Text style={[styles.summaryLabel, { color: '#991b1b' }]}>Exceeded</Text>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>{exceededCount}</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }]}>
            <Text style={[styles.summaryLabel, { color: '#475569' }]}>Total Records</Text>
            <Text style={[styles.summaryValue, { color: '#1e293b' }]}>{rows.length}</Text>
          </View>
        </View>

        {/* Table */}
        <Text style={styles.sectionLabel}>Drug Administration Records</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colAnimal]}>Animal Tag</Text>
          <Text style={[styles.thText, styles.colType]}>Type</Text>
          <Text style={[styles.thText, styles.colDrug]}>Drug</Text>
          <Text style={[styles.thText, styles.colDose]}>Dose</Text>
          <Text style={[styles.thText, styles.colAdminDate]}>Administered</Text>
          <Text style={[styles.thText, styles.colSafeDate]}>Safe From</Text>
          <Text style={[styles.thText, styles.colWithdrawal]}>W/D Days</Text>
          <Text style={[styles.thText, styles.colStatus]}>Status</Text>
        </View>

        {rows.map((row, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tdText, styles.colAnimal]}>{row.animalLabel}</Text>
            <Text style={[styles.tdText, styles.colType]}>{row.animalType}</Text>
            <Text style={[styles.tdText, styles.colDrug]}>{row.drugName}</Text>
            <Text style={[styles.tdText, styles.colDose]}>{row.dose}</Text>
            <Text style={[styles.tdText, styles.colAdminDate]}>{row.adminDate}</Text>
            <Text style={[styles.tdText, styles.colSafeDate]}>{row.safeDate}</Text>
            <Text style={[styles.tdText, styles.colWithdrawal]}>{row.withdrawalDays}d</Text>
            <Text style={[
              styles.tdText,
              styles.colStatus,
              row.statusType === 'safe' ? styles.statusSafe :
              row.statusType === 'active' ? styles.statusActive :
              styles.statusExceeded,
            ]}>
              {row.statusLabel}
            </Text>
          </View>
        ))}

        {rows.length === 0 && (
          <View style={{ padding: 12, backgroundColor: '#f9fafb' }}>
            <Text style={{ color: '#9ca3af', fontSize: 9, textAlign: 'center' }}>
              No drug administration records found.
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This report is based on FSSAI withdrawal period standards and should be used as a reference only.
          Consult a licensed veterinarian before making slaughter or sale decisions. W/D = Withdrawal Period.
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadSlaughterReport(
  logs: DrugUsageLog[],
  userEmail: string
): Promise<void> {
  const blob = await pdf(
    <SlaughterReportDoc logs={logs} userEmail={userEmail} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slaughter-readiness-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
