import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { PoliticianCard } from '@/components/PoliticianCard';
import { politicianDataMap } from '@/data/politician-data';
import { comingSoonId, politicianMaster } from '@/data/politician-master';
import type { AccountingReports, Report } from '@/models/type';

export const metadata = {
  title: 'Polimoney - 政治資金の透明性を高める',
  description:
    'Polimoneyは、デジタル民主主義2030プロジェクトの一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。',
};

const TOP_COUNT = 9;

// type OrgEntry = {
//   orgName: string;
//   orgId: string;
//   latestReport: Report;
// };

// function getOrgEntries(): OrgEntry[] {
//   const entries: OrgEntry[] = [];
//   for (const [politicianId, dataModule] of Object.entries(
//     politicianDataMap as Record<string, { default: AccountingReports }>,
//   )) {
//     const reports = dataModule.default.data.map(
//       (d: { report: Report }) => d.report,
//     );
//     if (reports.length === 0) continue;
//     const latest = reports.reduce((a, b) => (a.year > b.year ? a : b));
//     if (!latest.orgName) continue;
//     entries.push({
//       orgName: latest.orgName,
//       orgId: politicianId,
//       latestReport: latest,
//     });
//   }
//   return entries.sort((a, b) => a.orgName.localeCompare(b.orgName, 'ja'));
// }

export default function Page() {
  const topPoliticians = politicianMaster
    .filter((e) => !e.id.startsWith(comingSoonId))
    .slice(0, TOP_COUNT);

  // const topOrgs = getOrgEntries().slice(0, TOP_COUNT);

  return (
    <Box>
      <Header />
      <Box px={4} py={6}>
        {/* TODO: セクションが増えるまで「政治家」見出しは非表示 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3} mb={4}>
          {topPoliticians.map((entry) => (
            <PoliticianCard key={entry.id} entry={entry} />
          ))}
        </SimpleGrid>
        {/* TODO: データが増えた場合表示上限を設ける
        <Box display="flex" justifyContent="center" mb={8}>
          <Link href="/politicians">
            <Button
              size="sm"
              bg="linear-gradient(90deg, #FDD2F8 0%, #A6D1FF 100%)"
              color="white"
              textShadow="0 0 3px #00000077"
              borderRadius="full"
              px={6}
              _hover={{ filter: 'brightness(0.97)' }}
            >
              政治家一覧をもっと見る
            </Button>
          </Link>
        </Box>
        */}

        {/*
        TODO: 政治団体導線を再公開する際にこのセクションを復帰する
        <HStack justify="space-between" align="baseline" mb={3}>
          <Text fontSize="lg" fontWeight="bold">
            政治団体
          </Text>
          <Link href="/organizations">
            <Text fontSize="sm" color="blue.500">
              もっと見る →
            </Text>
          </Link>
        </HStack>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {topOrgs.map((org) => (
            <Link href={`/organizations/${org.orgId}`} key={org.orgId}>
              <Card.Root
                flexDirection="row"
                boxShadow="xs"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
                transition="all 0.15s"
                cursor="pointer"
                overflow="hidden"
              >
                <Box
                  w="6px"
                  flexShrink={0}
                  background="linear-gradient(180deg, #FDD2F8 0%, #A6D1FF 100%)"
                />
                <Card.Body px={4} py={3}>
                  <Text fontWeight="bold">{org.orgName}</Text>
                  <HStack mt={1}>
                    <Badge variant="outline" fontSize="xs">
                      代表: {org.latestReport.representative}
                    </Badge>
                    <Badge variant="outline" fontSize="xs">
                      {org.latestReport.activityArea}
                    </Badge>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </Link>
          ))}
        </SimpleGrid>
        */}
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
