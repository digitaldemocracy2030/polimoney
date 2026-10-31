import { SimpleGrid, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { LinkCard } from '@/components/LinkCard';
import { PageLayout } from '@/components/PageLayout';
import { politicianDataMap } from '@/data/politician-data';
import type { AccountingReports, Report } from '@/models/type';

export const metadata: Metadata = {
  title: '政治団体一覧 | Polimoney (ポリマネー)',
};

type OrgEntry = {
  orgName: string;
  politicianId: string;
  latestReport: Report;
};

function getOrgEntries(): OrgEntry[] {
  const entries: OrgEntry[] = [];
  for (const [politicianId, dataModule] of Object.entries(
    politicianDataMap as Record<string, { default: AccountingReports }>,
  )) {
    const reports = dataModule.default.data.map(
      (d: { report: Report }) => d.report,
    );
    if (reports.length === 0) continue;
    const latest = reports.reduce((a, b) => (a.year > b.year ? a : b));
    if (!latest.orgName) continue;
    entries.push({
      orgName: latest.orgName,
      politicianId,
      latestReport: latest,
    });
  }
  return entries.sort((a, b) => a.orgName.localeCompare(b.orgName, 'ja'));
}

export default function Page() {
  const entries = getOrgEntries();

  return (
    <PageLayout>
      <Title order={2} mb="md">
        政治団体一覧
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {entries.map((entry) => (
          <LinkCard
            key={`${entry.politicianId}-${entry.orgName}`}
            href={`/organizations/${entry.politicianId}`}
            title={entry.orgName}
            badges={[
              `代表: ${entry.latestReport.representative}`,
              entry.latestReport.activityArea,
            ]}
          />
        ))}
      </SimpleGrid>
    </PageLayout>
  );
}
