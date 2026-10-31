import fs from 'node:fs/promises';
import path from 'node:path';
import { Box, SimpleGrid, Stack, Text } from '@mantine/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LinkCard } from '@/components/LinkCard';
import { PageLayout } from '@/components/PageLayout';
import { ProfileHeader } from '@/components/ProfileHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { politicianDataMap } from '@/data/politician-data';
import { findPolitician } from '@/data/politician-master';
import type { EfMetadata } from '@/models/election-finance';
import type { AccountingReports, Report } from '@/models/type';

type RouteParams = { politicianId: string };
type Props = { params: Promise<RouteParams> };

function getPoliticalReports(politicianId: string): Report[] {
  const dataModule = (
    politicianDataMap as Record<string, { default: AccountingReports }>
  )[politicianId];
  if (!dataModule) return [];
  return dataModule.default.data.map((d: { report: Report }) => d.report);
}

async function getElectionData(dataId: string): Promise<EfMetadata | null> {
  const filePath = path.join(
    process.cwd(),
    'data',
    'election-finance',
    `ef-${dataId}.json`,
  );
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(content) as { metadata: EfMetadata };
    return json.metadata;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { politicianId } = await props.params;
  const politician = findPolitician(politicianId);
  if (!politician)
    return { title: 'データが見つかりません | Polimoney (ポリマネー)' };
  return {
    title: `${politician.profile.name} | Polimoney (ポリマネー)`,
  };
}

export default async function Page(props: Props) {
  const { politicianId } = await props.params;
  const politician = findPolitician(politicianId);

  if (!politician || politician.id.startsWith('demo-comingsoon')) {
    notFound();
  }

  const politicalReports = politician.politicalDataId
    ? getPoliticalReports(politician.politicalDataId)
    : [];

  const electionItems = (
    await Promise.all(
      (politician.electionDataIds ?? []).map(async (dataId) => ({
        dataId,
        metadata: await getElectionData(dataId),
      })),
    )
  ).filter((item) => item.metadata !== null);

  return (
    <PageLayout profileName={politician.profile.name}>
      <Stack gap="xl">
        <ProfileHeader profile={politician.profile} />

        {politicalReports.length > 0 && (
          <Box>
            <SectionHeading>政治資金収支報告</SectionHeading>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {politicalReports.slice(0, 4).map((report) => (
                <LinkCard
                  key={report.id}
                  href={`/politicians/${politicianId}/political/${report.id}`}
                  title={`${report.year}年`}
                  subtitle={report.orgName}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {electionItems.length > 0 && (
          <Box>
            <SectionHeading>選挙運動費用収支報告</SectionHeading>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {electionItems.map(({ dataId, metadata }) =>
                metadata ? (
                  <LinkCard
                    key={dataId}
                    href={`/politicians/${politicianId}/election/${dataId}`}
                    title={metadata.title}
                    subtitle={metadata.date}
                  />
                ) : null,
              )}
            </SimpleGrid>
          </Box>
        )}

        {politicalReports.length === 0 && electionItems.length === 0 && (
          <Text c="dimmed">データがありません</Text>
        )}

        {/* TODO: 政治団体導線を再公開する際に「紐づく政治団体」セクション（orgName/orgType のリンクカード）を復帰する */}
      </Stack>
    </PageLayout>
  );
}
