import {
  Badge,
  Box,
  Card,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
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
    entries.push({ orgName: latest.orgName, politicianId, latestReport: latest });
  }
  return entries.sort((a, b) => a.orgName.localeCompare(b.orgName, 'ja'));
}

export default function Page() {
  const entries = getOrgEntries();

  return (
    <Box>
      <Header />
      <Box px={4} py={6}>
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          政治団体一覧
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {entries.map((entry) => (
            <Link
              href={`/organizations/${entry.politicianId}`}
              key={`${entry.politicianId}-${entry.orgName}`}
            >
            <Card.Root
              key={`${entry.politicianId}-${entry.orgName}`}
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
                <Text fontWeight="bold">{entry.orgName}</Text>
                <HStack mt={1}>
                  <Badge variant="outline" fontSize="xs">
                    代表: {entry.latestReport.representative}
                  </Badge>
                  <Badge variant="outline" fontSize="xs">
                    {entry.latestReport.activityArea}
                  </Badge>
                </HStack>
              </Card.Body>
            </Card.Root>
            </Link>
          ))}
        </SimpleGrid>
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
