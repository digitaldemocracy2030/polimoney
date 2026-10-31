import { Badge, Box, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LinkCard } from '@/components/LinkCard';
import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { politicianDataMap } from '@/data/politician-data';
import { findPolitician } from '@/data/politician-master';
import type { AccountingReports, Report } from '@/models/type';

type RouteParams = { orgId: string };
type Props = { params: Promise<RouteParams> };

function getOrgData(orgId: string) {
  const dataModule = (
    politicianDataMap as Record<string, { default: AccountingReports }>
  )[orgId];
  if (!dataModule) return null;
  const reports = dataModule.default.data.map(
    (d: { report: Report }) => d.report,
  );
  if (reports.length === 0) return null;
  const latest = reports.reduce((a, b) => (a.year > b.year ? a : b));
  return { reports, latest };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { orgId } = await props.params;
  const data = getOrgData(orgId);
  if (!data)
    return { title: 'データが見つかりません | Polimoney (ポリマネー)' };
  return { title: `${data.latest.orgName} | Polimoney (ポリマネー)` };
}

export default async function Page(props: Props) {
  const { orgId } = await props.params;
  const data = getOrgData(orgId);
  if (!data) notFound();

  const politician = findPolitician(orgId);
  const sortedReports = [...data.reports].sort((a, b) => b.year - a.year);

  return (
    <PageLayout>
      <Stack gap="xl">
        <Box>
          <Title order={2}>{data.latest.orgName}</Title>
          <Group gap="xs" mt={4}>
            <Badge variant="light">{data.latest.orgType}</Badge>
            <Badge variant="light">{data.latest.activityArea}</Badge>
          </Group>
        </Box>

        <Box>
          <SectionHeading>政治資金収支報告</SectionHeading>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {sortedReports.map((report) => (
              <LinkCard
                key={report.id}
                href={`/organizations/${orgId}/political/${report.id}`}
                title={`${report.year}年`}
                subtitle={report.orgName}
              />
            ))}
          </SimpleGrid>
        </Box>

        {politician && (
          <Box>
            <SectionHeading>代表者</SectionHeading>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <LinkCard
                href={`/politicians/${orgId}`}
                image={{
                  src: politician.profile.image,
                  alt: politician.profile.name,
                }}
                overline={data.latest.representative}
                title={politician.profile.name}
                badges={[politician.profile.party].filter((v): v is string =>
                  Boolean(v),
                )}
              />
            </SimpleGrid>
          </Box>
        )}
      </Stack>
    </PageLayout>
  );
}
